const teams = require("./teams.json");

const main = () => {
  const groups = [
    teams[0],
    teams[1],
    teams[2],
    teams[3],
    teams[4],
    teams[5],
    teams[6],
    teams[7],
  ];
  const elimSt = []; // teams in elimination stage
  const quartFin = []; // teams in quarter final
  const semiFin = []; // teams in semi final
  const final = []; // teams in final
  const winner = [];

  // random number of goals
  const matchResult = () => {
    let goalsX = 0;
    let goalsY = 0;
    goalsX += Math.round(Math.random() * 4);
    goalsY += Math.round(Math.random() * 4);
    return { goalsX: goalsX, goalsY: goalsY };
  };
  // extra time (if result is draw in elimination stage)
  const exTimeResult = () => {
    var exGoalsX = 0;
    var exGoalsY = 0;
    exGoalsX += Math.round(Math.random() * 2);
    exGoalsY += Math.round(Math.random() * 2);
    return { exGoalsX: exGoalsX, exGoalsY: exGoalsY };
  };
  //penalties (if result is draw after extra time in elimination stage)
  const penResult = () => {
    let penX, penY;
    penX = Math.round(Math.random() * 5);
    do {
      penY = Math.round(Math.random() * 5);
    } while (penX === penY);
    return { penX: penX, penY: penY };
  };

  // matches scheme in group stage
  const schemeGr = [
    [0, 1, 2, 3],
    [0, 3, 1, 2],
    [0, 2, 1, 3],
  ];
  // matces scheme in elimination stage
  const schemeEl = [
    [0, 3],
    [1, 2],
    [4, 7],
    [5, 6],
    [8, 11],
    [9, 10],
    [12, 15],
    [13, 14],
  ];

  // group stage match
  const matchGr = (x, y) => {
    // random result for every match
    var { goalsX, goalsY } = matchResult();
    console.log(`  ${x.state} ${goalsX}:${goalsY} ${y.state}`);

    // update teams table after match
    if (goalsX > goalsY) {
      x.wons += 1;
      y.lost += 1;
      x.scored += goalsX;
      y.scored += goalsY;
      x.conceded += goalsY;
      y.conceded += goalsX;
      x.total_points += 3;
      x.won_teams.push(y.state);
    } else if (goalsY > goalsX) {
      y.wons += 1;
      x.lost += 1;
      x.scored += goalsX;
      y.scored += goalsY;
      x.conceded += goalsY;
      y.conceded += goalsX;
      y.total_points += 3;
      y.won_teams.push(x.state);
    } else {
      x.draw += 1;
      y.draw += 1;
      x.scored += goalsX;
      y.scored += goalsY;
      x.conceded += goalsY;
      y.conceded += goalsX;
      x.total_points += 1;
      y.total_points += 1;
    }
  };

  // group stage
  var stageNum = 0;
  for (j = 0; j < 3; j++) {
    stageNum++;
    var stageChar = String.fromCharCode(8543 + stageNum);
    console.log(`\nGrupna faza - ${stageChar} kolo:`);

    var groupNum = 0;
    for (i = 0; i < groups.length; i++) {
      var team1 = schemeGr[j][0];
      var team2 = schemeGr[j][1];
      var team3 = schemeGr[j][2];
      var team4 = schemeGr[j][3];
      var match01t1 = groups[i][team1];
      var match01t2 = groups[i][team2];
      var match02t1 = groups[i][team3];
      var match02t2 = groups[i][team4];

      groupNum++;
      var groupChar = String.fromCharCode(64 + groupNum);
      console.log(` Grupa ${groupChar}:`);
      matchGr(match01t1, match01t2);
      matchGr(match02t1, match02t2);
    }
  }

  // sort table by goal differences
  const sortByGoalDiff = (a, b) => {
    if (a.total_points === b.total_points) {
      a.goalDiff = a.scored - a.conceded;
      b.goalDiff = b.scored - b.conceded;
      return a.goalDiff > b.goalDiff ? -1 : 1;
    }
  };
  // sort table by scored goals
  const sortByScored = (a, b) => {
    if (a.total_points === b.total_points && a.goalDiff === b.goalDiff) {
      return a.scored > b.scored ? -1 : 1;
    }
  };
  // sort table by mutual duel
  const sortByMutual = (a, b) => {
    if (
      a.total_points === b.total_points &&
      a.goalDiff === b.goalDiff &&
      a.scored === b.scored
    ) {
      var mutualDuel = a.won_teams.filter((el) => el === b.state);
      return mutualDuel.length > 0 ? -1 : 1;
    }
  };

  // table preview after group phase
  console.log(`\nKraj grupne faze:`);
  groupNum = 0;
  groups.map((group) => {
    // sorting group table
    group.sort((a, b) => b.total_points - a.total_points);
    group.sort(sortByGoalDiff);
    group.sort(sortByScored);
    group.sort(sortByMutual);

    // table output
    groupNum++;
    groupChar = String.fromCharCode(64 + groupNum);
    console.log(` Grupa ${groupChar}:`);
    group.map((team, i) => {
      const { state, rank, wons, draw, lost, scored, conceded, total_points } =
        team;
      console.log(
        ` ${
          i + 1
        }. ${state} (${rank}) ${wons} ${draw} ${lost} ${scored}:${conceded} ${total_points}`
      );
    });
    // teams in next stage
    elimSt.push(group[0], group[1]);
  });

  // elimination stage match
  const matchEl = (x, y, nextStage) => {
    let result;
    let { goalsX, goalsY } = matchResult();
    let { exGoalsX, exGoalsY } = exTimeResult();
    let { penX, penY } = penResult();

    // random result for every match
    if (goalsX !== goalsY) {
      result = ` ${x.state} ${goalsX}:${goalsY} ${y.state}`;
    }
    if (goalsX === goalsY) {
      result = ` ${x.state} ${goalsX}(${exGoalsX}):${goalsY}(${exGoalsY}) ${y.state} (produzeci)`;
      goalsX += exGoalsX;
      goalsY += exGoalsY;
    }
    if (goalsX === goalsY && exGoalsX === exGoalsY) {
      result = ` ${x.state} ${goalsX}(${penX}):${goalsY}(${penY}) ${y.state} (penali)`;
      goalsX = penX;
      goalsY = penY;
    }

    goalsX > goalsY ? nextStage.push(x) : nextStage.push(y);
    console.log(result);
  };

  // elimination stage
  console.log(`\nEliminaciona faza - 1/8 finala:`);
  for (let i = 0; i < schemeEl.length; i++) {
    var t1 = elimSt[schemeEl[i][0]];
    var t2 = elimSt[schemeEl[i][1]];
    matchEl(t1, t2, quartFin);
  }
  console.log(`\nEliminaciona faza - 1/4 finala`);
  for (let i = 0; i < quartFin.length; i += 2) {
    t1 = quartFin[i];
    t2 = quartFin[i + 1];
    matchEl(t1, t2, semiFin);
  }
  console.log(`\nEliminaciona faza - polufinale`);
  for (let i = 0; i < semiFin.length; i += 2) {
    t1 = semiFin[i];
    t2 = semiFin[i + 1];
    matchEl(t1, t2, final);
  }
  console.log(`\nEliminaciona faza - finale`);
  t1 = final[0];
  t2 = final[1];
  matchEl(t1, t2, winner);

  console.log(`\nPobednik:\n !!! ${winner[0].state} !!!`);
};

main();
