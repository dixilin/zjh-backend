const infoData = require("../data");

const roomList = (ctx) => {
  ctx.body = {
    code: 0,
    data: infoData.publicRooms,
  };
};

const watchPoker = (ctx) => {
  const { username, id } = ctx.request.body;
  const idx = infoData.publicRooms.findIndex((item) => item.id === id);
  const userIdx = infoData.publicRooms[idx].user.findIndex(
    (item) => item.name === username
  );
  infoData.publicRooms[idx].user[userIdx].watched = true;
  global.socket.server.in(id).emit("update", infoData.publicRooms[idx]);
  ctx.body = {
    code: 0,
    data: {
      poker: infoData.pokerData[id][userIdx],
    },
  };
};

module.exports = {
  roomList,
  watchPoker,
};
