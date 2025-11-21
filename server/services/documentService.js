// server/services/documentService.js
const Document = require("../models/Document");
const Permission = require("../models/Permission");

const canAccess = async (userId, documentId) => {
  // owner via document
  const doc = await Document.findById(documentId);
  if (!doc) return false;
  if (doc.owner.toString() === userId.toString())
    return { ok: true, role: "owner", doc };

  // permission
  const perm = await Permission.findOne({ documentId, userId });
  if (perm) return { ok: true, role: perm.role, doc };
  return { ok: false };
};

const generateShareId = () => {
  return Math.random().toString(36).substr(2, 9);
};

module.exports = { canAccess, generateShareId };
