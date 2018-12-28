class Ballot {
  constructor() {
    this.set(0, 0);
  }

  set(pid, n) {
    this.pid = pid;
    this.n = n;
    return this;
  }

  setPid(pid) {
    this.pid = pid;
  }

  increment() {
    return this.set(this.pid, this.n + 1);
  }
}

module.exports = Ballot;
