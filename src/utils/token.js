const jwt = require("jsonwebtoken");

const SECRET = "zjh";

module.exports = (userInfo) => {
  const token = jwt.sign(userInfo, SECRET);
  return token;
};
