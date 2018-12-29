class Ballot {
  constructor() {
    this.pid = 0;
    this.n = 0;
  }
}

const helpers = {
  setBallot: (ballot, { pid, n }) => {
    ballot.pid = pid;
    ballot.n = n;
    return ballot;
  },
  setPid: (ballot, pid) => {
    ballot.pid = pid;
    return ballot;
  },
  increment: ballot => {
    ballot.n = ballot.n + 1;
    return ballot;
  },
  greaterThan: (ballot1, ballot2) => {
    if (ballot1.n > ballot2.n) {
      return true;
    } else if (ballot1.n === ballot2.n && ballot1.pid > ballot2.pid) {
      return true;
    } else if (ballot1.n === ballot2.n && ballot1.pid === ballot2.pid) {
      return true;
    } else {
      return false;
    }
  },
  toString: ballot => ballot.pid + "-" + ballot.n
};

module.exports = {
  Ballot,
  helpers
};
