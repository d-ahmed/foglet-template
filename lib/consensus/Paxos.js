const Ballot = require("./Ballot.js");
const Message = require("./Message.js");
const DELTA = 3000;
class Paxos {
  constructor(template, overlay) {
    this.progression = {
      initialValue: null,
      maxPeers: 0,
      ballot: new Ballot(),
      value: null,
      acceptedBallot: new Ballot(),
      acceptedValue: null,
      proposed: [],
      accepted: []
    };

    this.candidate = new Leader(template);
    this.overlay = overlay;

    this.candidate.template.addHandler(
      Message.types().START,
      this.prepare.bind(this)
    );

    this.candidate.template.addHandler(
      Message.types().PREPARE,
      this.acknowledge.bind(this)
    );
    this.candidate.template.addHandler(
      Message.types().ACKNOWLEDGE,
      this.propose.bind(this)
    );

    this.candidate.template.addHandler(
      Message.types().PROPOSE,
      this.accept.bind(this)
    );
  }

  // START
  start() {
    const leader = this.candidate.getLeader(this.overlay);
    if (!leader) return;
    const message = new Message(Message.types().START, {pid: this.candidate.template.foglet.inViewID, cible:this.overlay});
    this.candidate.template.sendOverlayUnicast(
      this.overlay,
      leader.peer,
      message
    );
  }

  /**
   *
   * @memberof Paxos
   */
  prepare(id, message) {
    if (this.periodic) return;
    this.progression.initialValue = message.content
    this.progression.ballot.setPid(this.candidate.template.foglet.inViewID);
    this.periodic = setInterval(() => {
      if (!this.candidate.isLeader(this.overlay)) return;
      this.progression.proposed = [];
      this.progression.maxPeers =
        this.candidate.template.neighboursOverlay(this.overlay).length + 1;

      const ballot = this.progression.ballot.increment();

      const message = new Message(Message.types().PREPARE, {
        ballot,
        maxPeers: this.progression.maxPeers
      });
      this.candidate.template.sendOverlayUnicastAll(this.overlay, message);
      this.acknowledge(this.candidate.template.foglet.inViewID, message);
    }, DELTA);
  }

  /**
   * ACKNOWLEDGE
   *
   * @param {*} id
   * @param {*} message
   * @memberof Paxos
   */
  acknowledge(id, message) {
    // console.log(id, message)
    // this.progression.accepted = []
    let { ballot, maxPeers } = message.content;
    this.progression.maxPeers = maxPeers;
    const leaderBallot = ballot

    if (this.greaterThan(leaderBallot, this.progression.ballot)) {
      this.progression.ballot = leaderBallot;

      const answer = new Message(Message.types().ACKNOWLEDGE, {
        ballot: leaderBallot,
        acceptedBallot: this.progression.acceptedBallot,
        acceptedValue: this.progression.acceptedValue
      });

      if(id === this.candidate.template.foglet.inViewID){
        this.propose(this.candidate.template.foglet.inViewID, answer);
      }else{
        this.candidate.template.sendOverlayUnicast(
          this.overlay,
          leaderBallot.pid,
          answer
        );
      }
    }
  }

  /**
   * The leader propose a value to acceptors
   *
   * @param {*} id
   * @param {*} message
   * @memberof Paxos
   */
  propose(id, message) {
    const { ballot, acceptedBallot, acceptedValue } = message.content;
    this.progression.proposed.push({ ballot: acceptedBallot, value: acceptedValue });
    
    if (
      this.progression.proposed.length >=
      Math.floor(this.progression.maxPeers / 2 + 1)
    ) {
      let value = null;
      if (this.isNoValue()) {
        value = this.progression.initialValue
      } else {
        value = this.greatestBallot().value;
      }
      const message = new Message(Message.types().PROPOSE, {
        ballot: ballot,
        val: value
      });
      this.candidate.template.sendOverlayUnicastAll(this.overlay, message);
      this.accept(this.candidate.template.foglet.inViewID, message);
    }
  }

  /**
   *
   *
   * @param {*} id
   * @param {*} message
   * @memberof Paxos
   */
  accept(id, message) {
    let {ballot, val} = message.content
    if(this.greaterThan(ballot, this.progression.ballot)){
      this.progression.acceptedBallot = ballot
      this.progression.acceptedValue = val
      this.progression.accepted.push({ ballot: ballot, value: val });
      const message = new Message(Message.types().ACCEPT, {
        ballot: this.progression.acceptedBallot,
        val: this.progression.acceptedValue
      });
      this.candidate.template.sendOverlayUnicastAll(this.overlay, message);
    }
  }

  /**
   *
   *
   * @returns
   * @memberof Paxos
   */
  isNoValue() {
    let noValue = true;
    this.progression.proposed.forEach(proposed => {
      noValue = noValue && proposed.value === null;
    });
    return noValue;
  }

  /**
   *
   *
   * @returns
   * @memberof Paxos
   */
  greatestBallot() {
    let greatest = this.progression.proposed[0];
    this.progression.proposed.forEach(proposed => {
      
      if (this.greaterThan(proposed.ballot, greatest.ballot) && proposed.value!==null) {
        greatest = proposed;
      }
    });
    return greatest;
  }

  /**
   *
   *
   * @param {*} ballot1
   * @param {*} ballot2
   * @returns
   * @memberof Paxos
   */
  greaterThan(ballot1, ballot2) {
    // A proposal is greater than or equal to another if:
    // 1. it is the same (both the n and pid index are equal)
    // 2. The n is higher
    // 3. The n is the same but the pid is higher
    if (ballot1.n > ballot2.n) {
      return true;
    } else if (ballot1.n === ballot2.n &&  ballot1.pid > ballot2.pid) {
      return true;
    } else if (ballot1.n === ballot2.n && ballot1.pid === ballot2.pid) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = Paxos;