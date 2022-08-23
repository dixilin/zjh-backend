const Router = require("koa-router");
const roomController = require("../controller/room");
const roomRouter = new Router();

roomRouter.get("/api/roomList", roomController.roomList);
roomRouter.post("/api/watchPoker", roomController.watchPoker);

module.exports = roomRouter;
