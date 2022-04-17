const { shuffle } = require('lodash')
function generatePoker() {
  const arr = []
  const points = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

  // S-黑桃  H-红心  C-梅花  D-方块
  const pokerType = ['S', 'H', 'C', 'D']
  points.forEach(p => {
    pokerType.forEach(t => {
      arr.push({
        type: t,
        num: p
      })
    })
  })
  return arr
}

function pokerShuffle() {
  return shuffle(generatePoker())
}

module.exports = pokerShuffle
