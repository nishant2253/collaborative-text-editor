// server/models/Permission.js
const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, enum: ["owner", "editor", "viewer"], required: true },
  },
  { timestamps: true }
);

PermissionSchema.index({ documentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Permission", PermissionSchema);
