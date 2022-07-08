require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = require("express")();

const PORT = process.env.PORT || 8900;
const server = http.createServer(app);

app.use(
  cors({
    origin: "https://doubtell-main.netlify.app/",
  })
);

// const io = require("socket.io")(process.env.PORT || 8900, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

app.get("/", (req, res) => {
  res.send("This is home route of socket server");
});

const io = socketIo(server, {
  cors: { origin: "https://doubtell-main.netlify.app/" },
});

let usersConnected = [];

const addUser = (userId, socketId) => {
  !usersConnected.some((user) => user.userId === userId) &&
    usersConnected.push({ userId, socketId });
};

const removeUser = (socketId) => {
  usersConnected = usersConnected.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return usersConnected.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("a user connected");

  //user connectes
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", usersConnected);
  });

  //send and get messages
  socket.on("sendMessage", (data) => {
    //find the connected user first
    const receiver = getUser(data.receiverId);
    // console.log(usersConnected);

    if (receiver !== undefined) {
      io.to(receiver.socketId).emit("getMessage", {
        senderId: data.senderId,
        text: data.text,
      });
    }
  });

  //user disconnects
  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
  });
});

server.listen(PORT, () => {
  console.log("Socket server started!");
});
