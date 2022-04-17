const getShufflePoker = require('./utils/shuffle')

function dealPoker(player = 4) {
  const pokers = getShufflePoker()
  const playerPokers = new Array(player).fill().map((item, idx) => {
    return [pokers[idx + player * 0], pokers[idx + player * 1], pokers[idx + player * 2]]
  })
  return playerPokers
}

dealPoker()