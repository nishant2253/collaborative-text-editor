const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authmiddleware");
const Permission = require("../models/Permission");
const Document = require("../models/Document");
const User = require("../models/User");
const { asyncHandler } = require("../utils/helper");

// ----------------------------------------------------
// GET all collaborators for a document
// ----------------------------------------------------
router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can view sharing" });

    const perms = await Permission.find({ documentId: req.params.id })
      .populate("userId", "email name")
      .lean();

    res.json({
      collaborators: perms.map((p) => ({
        id: p._id,
        userId: p.userId._id,
        email: p.userId.email,
        name: p.userId.name,
        role: p.role,
      })),
    });
  })
);

// ----------------------------------------------------
// Add user to document / change role
// ----------------------------------------------------
router.post(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const { userEmail, role } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can share" });

    const target = await User.findOne({ email: userEmail });
    if (!target) return res.status(404).json({ message: "User not found" });

    await Permission.findOneAndUpdate(
      { documentId: doc._id, userId: target._id },
      { role },
      { upsert: true }
    );

    res.json({ message: "Updated", userId: target._id, role });
  })
);

// ----------------------------------------------------
// Remove collaborator
// ----------------------------------------------------
router.delete(
  "/:id/:userId",
  auth,
  asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (doc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can remove user" });

    await Permission.findOneAndDelete({
      documentId: req.params.id,
      userId: req.params.userId,
    });

    res.json({ message: "Removed" });
  })
);

module.exports = router;
