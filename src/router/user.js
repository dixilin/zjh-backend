const Router = require("koa-router");
const userController = require("../controller/user");
const userRouter = new Router();

userRouter.post("/api/login", userController.login);

userRouter.get("/api/userInfo", userController.userInfo);

module.exports = userRouter;
