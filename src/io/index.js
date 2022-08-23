const infoData = require("../data");
const getUser = require("../utils/getUser");
const pokerShuffle = require("../utils/shuffle");
const comparePoker = require("../utils/comparePoker");

function getIndex({ id, username }) {
  const idx = infoData.publicRooms.findIndex((item) => item.id === id);
  const userIdx = infoData.publicRooms[idx]?.user?.findIndex(
    (item) => item.name === username
  );
  return {
    idx,
    userIdx,
  };
}

const getJackpot = (users) => {
  let total = 0;
  users.forEach((item) => {
    total += item.point;
  });
  return Math.abs(total);
};

function ioListen(io) {
  io.on("connection", (socket) => {
    console.log("socket连接成功。。。");
    global.socket = socket;

    function setPlayerIndex({ idx, userIdx }) {
      const userLength = infoData.publicRooms[idx].user.length;
      let nextIndex = (userIdx + 1) % userLength;
      let nextUser = infoData.publicRooms[idx].user[nextIndex];

      while (nextUser.giveUp || nextUser.out) {
        nextIndex = (nextIndex + 1) % userLength;
        nextUser = infoData.publicRooms[idx].user[nextIndex];
      }
      infoData.publicRooms[idx].playerIdx = nextIndex;
    }

    function checkFn({ idx, userIdx, id }) {
      const restPlayerList = infoData.publicRooms[idx].user.filter(
        (item) => !item.giveUp && !item.out
      );
      if (restPlayerList.length === 1) {
        const winnerIndex = infoData.publicRooms[idx].user.findIndex(
          (item) => item.name === restPlayerList[0]?.name
        );
        const currPoint = getJackpot(infoData.publicRooms[idx].user); // 当局奖池

        infoData.publicRooms[idx].base = 2;
        infoData.publicRooms[idx].playerIdx = winnerIndex;
        infoData.publicRooms[idx].times += 1;
        infoData.publicRooms[idx].start = false;

        infoData.publicRooms[idx].user.forEach((item, i) => {
          item.ready = false;
          const tempPoint = item.point;
          item.allPoint =
            winnerIndex === i
              ? item.allPoint + currPoint + tempPoint
              : item.allPoint + tempPoint;
          item.point = 0;
          item.watched = false;
          item.giveUp = false;
          item.currBase = 0;
          item.out = false;
        });
        socket.server.in(id).emit("gameOver", {
          lastPokers: infoData.pokerData[id],
          winner: restPlayerList[0].name,
          jackpot: currPoint,
        });
      } else {
        setPlayerIndex({ idx, userIdx });
      }
    }

    socket.on("enterHall", ({ username }) => {
      const index = infoData.onlineUsers.findIndex(
        (item) => item.username === username
      );

      if (index === -1) {
        infoData.onlineUsers.push({ username, id: socket.id, roomId: null });
      } else {
        const item = infoData.onlineUsers.find(
          (item) => item.username === username
        );
        const { idx } = getIndex({ id: item.roomId });
        item.roomId &&
          socket.emit("backToRoom", {
            id: item.roomId,
            roomInfo: infoData.publicRooms[idx],
          });
      }
    });

    socket.on("createRoom", ({ username }) => {
      const roomInfo = {
        master: username,
        roomName: username + "_room",
        user: [
          {
            name: username,
            ready: false,
            watched: false,
            allPoint: 0,
            point: 0,
            giveUp: false,
            currBase: 0,
            out: false,
          },
        ],
        id: socket.id,
        start: false,
        times: 0,
        // restTimes: 12,
        playerIdx: 0,
        base: 2, // 基数
      };
      socket.join(socket.id);

      infoData.publicRooms.push(roomInfo);
      const userIndex = infoData.onlineUsers.findIndex(
        (item) => item.username === username
      );
      infoData.onlineUsers[userIndex].roomId = socket.id;
      socket.emit("enterRoom", { id: socket.id, roomInfo });
    });

    socket.on("joinRoom", ({ id, username }) => {
      const { idx } = getIndex({ id, username });
      if (idx > -1) {
        infoData.publicRooms[idx].user.push({
          name: username,
          ready: false,
          watched: false,
          allPoint: 0,
          point: 0,
          giveUp: false,
          currBase: 0,
          out: false,
        });
        socket.join(id);
        socket.server.in(id).emit("enterRoom", {
          id: infoData.publicRooms[idx].id,
          roomInfo: infoData.publicRooms[idx],
        });

        const userIndex = infoData.onlineUsers.findIndex(
          (item) => item.username === username
        );
        infoData.onlineUsers[userIndex].roomId = id;
      } else {
        socket.emit("enterRoom");
      }
    });

    socket.on("leaveRoom", ({ id, username }) => {
      const { idx, userIdx } = getIndex({ id, username });
      socket.leave(id);
      infoData.publicRooms[idx].user.splice(userIdx, 1);
      if (infoData.publicRooms[idx].user.length === 0) {
        infoData.publicRooms.splice(idx, 1);
      } else {
        socket.server.in(id).emit("update", infoData.publicRooms[idx]);
      }

      const userIndex = infoData.onlineUsers.findIndex(
        (item) => item.username === username
      );
      infoData.onlineUsers[userIndex].roomId = null;
    });

    socket.on("destroyRoom", ({ id }) => {
      const idx = infoData.publicRooms.findIndex((item) => item.id === id);
      infoData.onlineUsers.forEach((item, index) => {
        infoData.publicRooms[idx].user.forEach(({ name }) => {
          if (item.username === name) {
            infoData.onlineUsers[index].roomId = null;
          }
        });
      });

      infoData.publicRooms.splice(idx, 1);
      socket.server.in(id).emit("leaveRoom");
      io.socketsLeave(id);
    });

    socket.on("backRoom", ({ id, token }) => {
      const { username } = getUser(token);
      const { idx } = getIndex({ id, username });
      socket.join(id);
      socket.server.in(id).emit("update", infoData.publicRooms[idx]);
    });

    function readyFn(flag, { id, username }) {
      const { idx, userIdx } = getIndex({ id, username });

      infoData.publicRooms[idx].user[userIdx].ready = flag;
      // 是否剩余未准备玩家
      if (
        !infoData.publicRooms[idx].user.filter((item) => !item.ready).length
      ) {
        const shuffleData = pokerShuffle();
        const len = infoData.publicRooms[idx].user.length;
        let tempArr = [];
        for (let i = 0; i < len; i++) {
          tempArr.push([]);
        }
        let i = infoData.publicRooms[idx].playerIdx;
        const lastWhileIdx = i === 0 ? len - 1 : i - 1;

        while (tempArr[lastWhileIdx].length !== 3) {
          tempArr[i % len].push(shuffleData[i]);
          i++;
        }
        infoData.pokerData[id] = tempArr;
        infoData.publicRooms[idx].user.forEach((item) => {
          item.point = -1;
        });
        if (len >= 2) {
          infoData.publicRooms[idx].start = true;
        }
      } else {
        infoData.publicRooms[idx].start = false;
      }
      socket.server.in(id).emit("update", infoData.publicRooms[idx]);
    }

    socket.on("ready", ({ id, username }) => {
      readyFn(true, { id, username });
    });

    socket.on("offReady", ({ id, username }) => {
      readyFn(false, { id, username });
    });

    socket.on("fill", ({ currBase, id, username }) => {
      const { idx, userIdx } = getIndex({ id, username });
      const index = infoData.publicRooms[idx].playerIdx;
      infoData.publicRooms[idx].user[index].point -= currBase;
      infoData.publicRooms[idx].user[index].currBase = currBase;
      infoData.publicRooms[idx].base = currBase;
      setPlayerIndex({ idx, userIdx });

      socket.server.in(id).emit("update", infoData.publicRooms[idx]);
    });

    socket.on("compare", ({ id, username, comparePlayer }) => {
      const { idx, userIdx } = getIndex({ id, username });

      const comparePlayerIdx = infoData.publicRooms[idx].user.findIndex(
        (item) => item.name === comparePlayer
      );
      const flag = comparePoker(
        infoData.pokerData[id][userIdx],
        infoData.pokerData[id][comparePlayerIdx]
      );
      const loserIndex = flag ? comparePlayerIdx : userIdx;
      infoData.publicRooms[idx].user[loserIndex].out = true;

      const base = infoData.publicRooms[idx].base;
      infoData.publicRooms[idx].user[userIdx].point -= base;
      checkFn({ idx, userIdx, id });
      socket.server.in(id).emit("update", infoData.publicRooms[idx]);
    });

    socket.on("giveUp", ({ id, username }) => {
      const { idx, userIdx } = getIndex({ id, username });

      infoData.publicRooms[idx].user[userIdx].giveUp = true;
      checkFn({ idx, userIdx, id });
      socket.server.in(id).emit("update", infoData.publicRooms[idx]);
    });
    socket.on("disconnect", function (reason) {
      console.log("disconnect", reason);
    });
  });
}

module.exports = ioListen;
