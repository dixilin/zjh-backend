function points(poker) {
  const playerPoker1 = poker[0];
  const playerPoker2 = poker[1];
  const playerPoker3 = poker[2];
  if (
    playerPoker1.num === playerPoker2.num &&
    playerPoker2.num === playerPoker3.num
  ) {
    return 100000000000000 * playerPoker1.num;
  } else if (
    playerPoker1.num - playerPoker2.num === 1 &&
    playerPoker2.num - playerPoker3.num === 1
  ) {
    if (
      playerPoker1.type === playerPoker2.type &&
      playerPoker2.type === playerPoker3.type
    ) {
      return 1000000000000 * playerPoker1.num;
    } else {
      if (playerPoker1 === 14 && playerPoker2 === 2 && playerPoker3 === 3) {
        return 200000000; // A23 也算顺子
      }
      return 100000000 * playerPoker1.num;
    }
  } else if (
    playerPoker1.type === playerPoker2.type &&
    playerPoker2.type === playerPoker3.type
  ) {
    return (
      10000000000 * playerPoker1.num +
      100000000 * playerPoker2.num +
      1000000 * playerPoker3.num
    );
  } else if (
    playerPoker1.num === playerPoker2.num ||
    playerPoker2.num === playerPoker3.num
  ) {
    if (playerPoker1.num === playerPoker2.num) {
      return 1000000 * playerPoker2.num + 10000 * playerPoker3.num;
    } else {
      return 1000000 * playerPoker2.num + 10000 * playerPoker1.num;
    }
  } else {
    return (
      10000 * playerPoker1.num + 100 * playerPoker2.num + 1 * playerPoker3.num
    );
  }
}

function comparePoker(poker1, poker2) {
  poker1 = poker1.sort((a, b) => b.num - a.num);
  poker2 = poker2.sort((a, b) => b.num - a.num);
  const p1 = points(poker1);
  const p2 = points(poker2);
  return p1 > p2;
}

module.exports = comparePoker;
