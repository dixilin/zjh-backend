const path = require("path");
const bodyParser = require("koa-bodyparser");
const koaJwt = require("koa-jwt");
const static = require("koa-static");
const catchError = require("./error");

const SECRET = "zjh";

module.exports = (app) => {
  app.use(catchError);

  app.use(
    koaJwt({
      secret: SECRET,
    }).unless({
      path: [/^((?!\/api))/, /!^\/api\//, /^\/public/, /^\/api\/login/], //无需验证的接口
    })
  );
  app.use(static(path.resolve(__dirname, "../../public")));
  app.use(bodyParser());
};
