const jwt = require("jsonwebtoken");

const SECRET = "zjh";
const getUser = (token) => {
  const user = jwt.verify(token, SECRET);
  return user;
};
module.exports = getUser;
