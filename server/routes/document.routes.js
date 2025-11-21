// server/routes/document.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authmiddleware");
const Document = require("../models/Document");
const Permission = require("../models/Permission");
const { validate } = require("../middlewares/validator");
const Joi = require("joi");
const { sanitizeBasic, asyncHandler } = require("../utils/helper");
const { canAccess } = require("../services/documentService");

// Create document
const createSchema = Joi.object({
  body: Joi.object({ title: Joi.string().allow("", null) }),
});
router.post(
  "/",
  auth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { title } = req.body;
    const doc = new Document({
      title: title || "Untitled",
      owner: req.user._id,
    });
    await doc.save();

    // assign owner permissions
    await Permission.create({
      documentId: doc._id,
      userId: req.user._id,
      role: "owner",
    });

    res.status(201).json({ document: doc });
  })
);

// ---------------------------------------------------------
// GET ALL DOCUMENTS (Owned + Shared)
// ---------------------------------------------------------
// ---------------------------------------------------------
// GET ALL DOCUMENTS (Owned + Shared)
// ---------------------------------------------------------
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    // Documents owned by this user
    const owned = await Document.find({ owner: req.user._id })
      .sort("-updatedAt")
      .lean();

    // Permissions where user is NOT owner but has access
    const userPerms = await Permission.find({
      userId: req.user._id,
    }).lean();

    const permittedIds = userPerms
      .map((p) => p.documentId?.toString())
      .filter(Boolean);

    const shared = permittedIds.length
      ? await Document.find({
          _id: { $in: permittedIds },
          owner: { $ne: req.user._id },
        })
          .sort("-updatedAt")
          .lean()
      : [];

    res.json({
      documents: [...owned, ...shared],
    });
  })
);

// ---------------------------------------------------------
// GET SINGLE DOCUMENT WITH ROLE
// ---------------------------------------------------------
router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const access = await canAccess(req.user._id, req.params.id);

    if (!access || !access.ok)
      return res.status(403).json({ message: "No access" });

    const docObj = access.doc.toObject ? access.doc.toObject() : access.doc;
    docObj.role = access.role;

    res.json({ document: docObj });
  })
);

// ---------------------------------------------------------
// UPDATE DOCUMENT
// ---------------------------------------------------------
const updateSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
  }),
});

router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const access = await canAccess(req.user._id, req.params.id);

    if (!access || !access.ok)
      return res.status(403).json({ message: "No access" });

    if (!["owner", "editor"].includes(access.role))
      return res.status(403).json({ message: "Insufficient permission" });

    const updates = {};

    if (req.body.title !== undefined)
      updates.title = sanitizeBasic(req.body.title);

    if (req.body.content !== undefined)
      updates.content = sanitizeBasic(req.body.content);

    try {
      const updated = await Document.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });

      if (!updated) return res.status(404).json({ message: "Not found" });

      res.json({ document: updated });
    } catch (err) {
      console.error("Document update failed:", err);
      return res
        .status(400)
        .json({ message: "Bad request", error: err.message });
    }
  })
);

// ---------------------------------------------------------
// DELETE DOCUMENT
// ---------------------------------------------------------
router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: "Not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can delete" });

    await Permission.deleteMany({ documentId: doc._id });
    await doc.deleteOne();

    res.json({ message: "Deleted" });
  })
);

// ---------------------------------------------------------
// SHARE DOCUMENT
// ---------------------------------------------------------
const shareSchema = Joi.object({
  body: Joi.object({
    userEmail: Joi.string().email().optional(),
    role: Joi.string().valid("editor", "viewer").required(),
  }),
});

router.post(
  "/:id/share",
  auth,
  validate(shareSchema),
  asyncHandler(async (req, res) => {
    const { userEmail, role } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can share" });

    const User = require("../models/User");
    const target = await User.findOne({ email: userEmail });

    if (!target)
      return res.status(404).json({ message: "Target user not found" });

    await Permission.findOneAndUpdate(
      { documentId: doc._id, userId: target._id },
      { role },
      { upsert: true }
    );

    res.json({ message: "Shared", userId: target._id, role });
  })
);

// GET PERMISSIONS FOR A DOCUMENT
router.get(
  "/:id/permissions",
  auth,
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Only owner can view permissions" });

    const permissions = await Permission.find({ documentId: doc._id })
      .populate("userId", "email")
      .lean();

    res.json({
      permissions: permissions.map((p) => ({
        userEmail: p.userId.email,
        role: p.role,
      })),
    });
  })
);

router.post(
  "/:id/share/remove",
  auth,
  asyncHandler(async (req, res) => {
    const { userEmail } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can remove access" });

    const User = require("../models/User");
    const target = await User.findOne({ email: userEmail });

    if (!target) return res.status(404).json({ message: "User not found" });

    await Permission.deleteOne({
      documentId: doc._id,
      userId: target._id,
    });

    res.json({ message: "Access removed" });
  })
);

module.exports = router;
