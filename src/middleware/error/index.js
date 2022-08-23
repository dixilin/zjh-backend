//全局异常处理
const catchError = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    switch (err.status) {
      case 401:
        let msg = "token不正确";
        ctx.status = 401;
        if (
          err.originalError &&
          err.originalError.name === "TokenExpiredError"
        ) {
          msg = "token身份已过期，请重新登录";
        }
        ctx.body = {
          code: 401,
          msg,
        };
        break;
      case 500:
        ctx.status = 500;
        ctx.body = {
          code: 500,
          msg: "服务器出现问题",
        };
        break;
      case 404:
        ctx.status = 404;
        ctx.body = {
          code: 404,
          msg: "找不到该资源",
        };
        break;
      default:
        throw err;
    }
  }
};

module.exports = catchError;
