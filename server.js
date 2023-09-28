const express = require("express");
const mongoose = require("mongoose");
const SocketIO = require("socket.io");
const Document = require("./DocumentSchema");

const app = express();

// Connect to the database
mongoose.connect(
  "mongodb+srv://mujtabainfini8ai:x5FXvNdltLzWAT8K@mujtabacluster.uhfjm4w.mongodb.net/google-docs-clone?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Create a Socket.IO server
const io = SocketIO(app.listen(3001));

// Add a middleware to handle the Socket.IO connection
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Add a route to handle the `get-document` event
app.get("/get-document/:documentId", async (req, res) => {
  // Get the document ID from the request parameters
  const documentId = req.params.documentId;

  // Find or create the document
  const document = await findOrCreateDocument(documentId);

  // Join the Socket.IO room for the document
  req.io.join(documentId);

  // Emit the `load-document` event to the client
  req.io.emit("load-document", document.data);

  // Send the response to the client
  res.send("Document loaded successfully");
});

// Move your existing code for handling the `send-changes` and `save-document` events into the Express route handler.

// Start the Express server
app.listen(5173, () => {
  console.log("Express server listening on port 5173");
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
