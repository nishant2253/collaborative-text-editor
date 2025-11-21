// server/models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Document" },
    content: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shareId: { type: String, unique: true, sparse: true }, // optional public share link id
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
