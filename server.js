const mongoose = require("mongoose");
const Document = require("./DocumentSchema");
const express = require("express");
const cors = require("cors"); // Import the cors package

const app = express();

// Enable CORS for all routes
app.use(cors());

mongoose.connect(
  "mongodb+srv://mujtabainfini8ai:x5FXvNdltLzWAT8K@mujtabacluster.uhfjm4w.mongodb.net/GoogleDocs?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const httpServer = require("http").createServer(app); // Create an HTTP server

const io = require("socket.io")(httpServer, {
  cors: {
    // origin: "https://editor-frontend-nu.vercel.app",
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
