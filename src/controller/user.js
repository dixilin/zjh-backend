const userModel = require("../model/userModel");
const { encrypt, decrypt } = require("../utils/crypt");
const getToken = require("../utils/token");
const getUser = require("../utils/getUser");

const login = async (ctx) => {
  const { username, password, register } = ctx.request.body;
  const res = await userModel.findOne({
    username,
  });
  if (!res) {
    if (register) {
      const encryptPwd = encrypt(password);

      await userModel.create({
        username,
        password: encryptPwd,
      });
      const token = getToken({
        username,
        // _id,
      });
      ctx.body = {
        code: 0,
        msg: "创建成功",
        token,
      };
    } else {
      ctx.body = {
        code: 3001,
        msg: "账号未注册，是否注册账号并登陆",
      };
    }
  } else {
    if (decrypt(password, res.password)) {
      const token = getToken({
        username,
        // _id,
      });
      ctx.body = {
        code: 0,
        msg: "登陆成功",
        token,
      };
    } else {
      ctx.body = {
        code: 1,
        msg: "密码错误",
      };
    }
  }
};

const userInfo = async (ctx) => {
  const token = ctx.header.authorization.replace("Bearer ", "");

  const res = getUser(token);
  if (res) {
    ctx.body = {
      code: 0,
      token,
      ...res,
    };
  } else {
    ctx.body = {
      code: 401,
      msg: "请重新登陆",
    };
  }
};

module.exports = {
  login,
  userInfo,
};
