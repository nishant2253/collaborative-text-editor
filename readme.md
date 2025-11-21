# 📝 Collaborative Document Editor

A real-time collaborative text editor inspired by Google Docs. Supports multi-user editing, cursor sharing, presence tracking, permissions, AI-powered writing assistance, and autosave — all powered by modern MERN + Socket.IO architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.x-blue)

## 🚀 Purpose

This project demonstrates your ability to design and develop:

- Full-stack real-time web applications
- WebSocket-based synchronization
- Multi-user presence & cursor broadcasting
- Role-based permissions
- AI model integration (Gemini API)
- Secure authentication (JWT Access + Refresh Tokens)
- Scalable backend architecture

This assignment is built for SDE Intern requirements, combining real-time technology + backend design + frontend UI/UX.

## ✨ Features

### 📝 1. Real-Time Collaborative Editing

- Multiple users can edit the same document
- Updates sync instantly across sessions using Socket.IO rooms
- Changes are merged smoothly using QuillJS editor

### 🖱 2. Cursor Sync (Per-User Cursor Position)

- Each user sees the cursors of others
- Displays user-specific color + name

### 👥 3. Active User Presence

- Shows list of users currently viewing/editing the document
- Auto-updated as users join or leave rooms

### 💾 4. Auto Save + Manual Save

- Auto save every 1.2 seconds
- Manual "Save" button for immediate commit
- Saves HTML document content to MongoDB

### 🔗 5. Document Sharing / Permissions

- Owner can share document with others using email
- Supports roles:
  - **Owner**
  - **Editor**
  - **Viewer**
- Server enforces permissions before allowing edits

### 🔐 6. JWT Authentication (Access + Refresh Tokens)

- Login / Register with JWT cookies
- Protected routes for all document APIs

### 🤖 7. AI Assistant (Gemini API Integration)

Includes:

- Grammar Check
- Summarize
- Enhance Text
- Auto Complete
- Suggestions

AI writes directly into the editor through controlled updates.

### 📁 8. Document List

- "Owned" and "Shared with me" documents are displayed

## 🏗 Tech Stack

### Frontend

- React + Vite
- React Quill
- Socket.IO Client
- TailwindCSS
- Axios
- React-Hot-Toast

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Auth
- Gemini API (@google/genai)

## 📂 Directory Structure

```
collaborative-text-editor/
│
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── ShareModal.jsx
│   │   │   └── PresenceList.jsx
│   │   ├── pages/
│   │   │   └── DocumentPage.jsx
│   │   ├── hooks/useAuth.js
│   │   ├── services/api.js
│   │   ├── services/socket.js
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/                    # Node Backend
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── document.routes.js
│   │   └── ai.routes.js
│   ├── config/
│   │   ├── db.js
│   │   ├── jwt.js
│   │   └── gemini.js
│   ├── models/
│   │   ├── Document.js
│   │   ├── User.js
│   │   └── Permission.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── documentService.js
│   ├── websockets/
│   │   └── editorSocket.js
│   ├── middlewares/
│   │   ├── authmiddleware.js
│   │   └── validator.js
│   ├── utils/helper.js
│   ├── socket.js
│   ├── index.js
│   └── .env
│
└── README.md
```

## 🔌 Backend API Routes

### Auth

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
```

### Documents

```
POST   /api/documents/            # create doc
GET    /api/documents/            # list docs
GET    /api/documents/:id         # get doc
PUT    /api/documents/:id         # update content/title
DELETE /api/documents/:id         # delete
```

### Share

```
POST /api/documents/:id/share     # share with user
```

### AI Routes

```
POST /api/ai/grammar-check
POST /api/ai/enhance
POST /api/ai/summarize
POST /api/ai/complete
POST /api/ai/suggestions
```

## 🔧 Important Backend Code Snippets

### 1. Joining Document Room (Socket.IO)

```javascript
socket.on("join-document", async ({ documentId, userId, userName }) => {
  socket.join(documentId);
  socket.documentId = documentId;
  socket.userId = userId;

  const doc = await Document.findById(documentId);
  socket.emit("document", { content: doc.content });

  presence[documentId].add({ userId, userName });
  io.to(documentId).emit("presence-update", [...presence[documentId]]);
});
```

### 2. Auto-Save Handler

```javascript
socket.on("document-save", async ({ documentId, content }) => {
  await Document.findByIdAndUpdate(documentId, {
    content,
    updatedAt: new Date(),
  });

  io.to(documentId).emit("document-saved", {
    documentId,
    savedAt: new Date(),
  });
});
```

### 3. AI Integration

```javascript
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: text,
});
return response.output_text;
```

## 🖥 Important Frontend Code Snippets

### 1. Connecting Socket + Real-Time Updates

```javascript
useEffect(() => {
  const s = createSocket();
  socketRef.current = s;
  s.connect();

  s.on("connect", () => {
    s.emit("join-document", {
      documentId: id,
      userId: user?._id,
      userName: user?.name,
    });
  });

  s.on("document", (payload) => setContent(payload.content));
  s.on("presence-update", setActiveUsers);

  return () => disconnectSocket();
}, [id]);
```

### 2. Manual Save

```javascript
async function manualSave() {
  setManualSaving(true);
  await api.put(`/documents/${id}`, { content });
  socketRef.current.emit("document-save", { documentId: id, content });
  setManualSaving(false);
}
```

### 3. Cursor Sync

```javascript
quill.on("selection-change", (range) => {
  socket.emit("cursor-change", {
    documentId,
    userId: user._id,
    range,
  });
});
```

## 🛠 How to Run Locally

### 1. Clone Repo

```bash
git clone https://github.com/yourname/collaborative-editor.git
cd collaborative-editor
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/collab-editor
JWT_SECRET=youraccesstokensecret
JWT_REFRESH_SECRET=yourrefreshtokensecret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Run server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 🌐 Environment Variables

### Backend (.env)

| Variable             | Description                   |
| -------------------- | ----------------------------- |
| `MONGO_URI`          | MongoDB connection string     |
| `JWT_SECRET`         | Secret key for access tokens  |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `GEMINI_API_KEY`     | Google Gemini API key         |
| `CLIENT_URL`         | Frontend URL for CORS         |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**

- GitHub: [@nishant2253](https://github.com/nishant2253)

## 🙏 Acknowledgments

- Inspired by Google Docs
- Built with modern web technologies
- Powered by Google Gemini AI

---

⭐️ If you find this project helpful, please give it a star!
