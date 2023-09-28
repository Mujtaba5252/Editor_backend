const mongoose = require("mongoose");
const Document = require("./DocumentSchema");
// require("dotenv").config();

mongoose.connect(
  "mongodb+srv://mujtabainfini8ai:x5FXvNdltLzWAT8K@mujtabacluster.uhfjm4w.mongodb.net/GoogleDocs?retryWrites=true&w=majority",

  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const io = require("socket.io")(process.env.PORT || 3001, {
  cors: {
    origin: "https://editor-frontend-nu.vercel.app",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      // Add a delay of 100 milliseconds
      setTimeout(() => {
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      }, 100);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
