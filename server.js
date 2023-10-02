const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const Document = require("./DocumentSchema");
const defaultValue = "";

mongoose.connect(
  "mongodb+srv://mujtabainfini8ai:x5FXvNdltLzWAT8K@mujtabacluster.uhfjm4w.mongodb.net/GoogleDocs?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws) => {
  let documentId;

  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    if (data.type === "get-document") {
      documentId = data.documentId;

      const document = await findOrCreateDocument(documentId);
      ws.send(JSON.stringify({ type: "load-document", data: document.data }));
      // Join a room (document) based on the documentId
      ws.documentId = documentId;
    } else if (data.type === "save-document") {
      await Document.findByIdAndUpdate(documentId, { data: data.content });
    } else if (data.type === "send-changes") {
      // Broadcast changes to all clients in the same document (room)
      wss.clients.forEach((client) => {
        if (client !== ws && client.documentId === documentId) {
          client.send(
            JSON.stringify({ type: "receive-changes", data: data.content })
          );
        }
      });
    }
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

server.listen(process.env.PORT || 3001, () => {
  console.log("Server is running on port 3001");
});
