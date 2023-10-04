const mongoose = require("mongoose");
const Document = require("./DocumentSchema");
const cors = require("cors");
const express = require("express");
const http = require("http"); // Import http module
const { Server } = require("socket.io"); // Import Server from socket.io

const port = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app); // Create an HTTP server using express app
const newSocket = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
  },
});

// Enable CORS for your Express app
app.use(cors());

mongoose.connect(
  "mongodb+srv://mujtabainfini8ai:x5FXvNdltLzWAT8K@mujtabacluster.uhfjm4w.mongodb.net/GoogleDocs?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const defaultValue = "";

newSocket.on("connection", (socket) => {
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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
