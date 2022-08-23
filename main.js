const { createServer } = require("http");
const koa = require("koa");
const { Server } = require("socket.io");
require("./src/db");
const router = require("./src/router");
const middleware = require("./src/middleware");

const ioListen = require("./src/io");
const app = new koa();
middleware(app);

router(app);

const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  cors: {
    origin: true,
  },
});

ioListen(io);

httpServer.listen(3001, () => {
  console.log("server is running at http://localhost:3001");
});
