const router = require("koa-router")();
const userRouter = require("./user");
const roomRouter = require("./room");

module.exports = (app) => {
  router.use(userRouter.routes());
  router.use(roomRouter.routes());

  app.use(router.routes());
};
