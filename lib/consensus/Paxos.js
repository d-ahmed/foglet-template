const { Ballot, helpers: BHelpers } = require("./Ballot.js");
const Message = require("./Message.js");
const Leader = require("../leader.js");
const DELTA = 2000;

class Paxos {
  constructor(template, overlay, onLeader) {
    this.progression = {
      initialValue: null,
      maxPeers: 0,
      ballot: new Ballot(),
      value: null,
      acceptedBallot: new Ballot(),
      acceptedValue: null,
      proposed: [],
      accepted: {},
      decided: null
    };

    this.candidate = new Leader(template, 8 * 1000, onLeader);
    this.overlay = overlay;

    this.candidate.template.addHandler(
      Message.types().START,
      this.prepare.bind(this),
      this.overlay
    );

    this.candidate.template.addHandler(
      Message.types().PREPARE,
      this.acknowledge.bind(this),
      this.overlay
    );
    this.candidate.template.addHandler(
      Message.types().ACKNOWLEDGE,
      this.propose.bind(this),
      this.overlay
    );

    this.candidate.template.addHandler(
      Message.types().PROPOSE,
      this.accept.bind(this),
      this.overlay
    );

    this.candidate.template.addHandler(
      Message.types().ACCEPT,
      this.decide.bind(this),
      this.overlay
    );
    this.candidate.template.addHandler(
      Message.types().DECIDE,
      this.decided.bind(this),
      this.overlay
    );
  }

  // START
  start(resolver = null) {
    this.resolver = resolver;
    const leader = this.candidate.getLeader(this.overlay);
    if (!leader) return;
    const myId = this.candidate.template.foglet.inViewID;
    const message = new Message(Message.types().START, {
      pid: myId,
      cible: this.overlay
    });

    if (leader.peer === myId) {
      this.prepare(myId, message);
    } else {
      this.candidate.template.sendOverlayUnicast(
        this.overlay,
        leader.peer,
        message
      );
    }
  }

  /**
   *
   * @memberof Paxos
   */
  prepare(id, message) {
    // console.log(id, message)
    if (this.periodic) return;
    this.progression.initialValue = message.content;
    BHelpers.setPid(
      this.progression.ballot,
      this.candidate.template.foglet.inViewID
    );
    this.sendPrepare();
    this.periodic = setInterval(() => {
      this.sendPrepare();
    }, DELTA);
  }

  sendPrepare() {
    if (!this.candidate.isLeader(this.overlay)) return;
    this.progression.proposed = [];
    this.progression.maxPeers =
      this.candidate.template.neighboursOverlay(this.overlay).length + 1;

    const ballot = BHelpers.increment(this.progression.ballot);
    const message = new Message(Message.types().PREPARE, {
      ballot,
      maxPeers: this.progression.maxPeers
    });
    this.candidate.template.sendOverlayUnicastAll(this.overlay, message);
    this.acknowledge(this.candidate.template.foglet.inViewID, message);
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
    if (this.progression.decided) return;
    let { ballot, maxPeers } = message.content;
    this.progression.maxPeers = maxPeers;
    if (BHelpers.greaterThan(ballot, this.progression.ballot)) {
      this.progression.ballot = ballot;

      const answer = new Message(Message.types().ACKNOWLEDGE, {
        ballot,
        acceptedBallot: this.progression.acceptedBallot,
        acceptedValue: this.progression.acceptedValue
      });

      if (id === this.candidate.template.foglet.inViewID) {
        this.propose(this.candidate.template.foglet.inViewID, answer);
      } else {
        this.candidate.template.sendOverlayUnicast(
          this.overlay,
          ballot.pid,
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
    // console.log(id, message)
    if (this.progression.decided) return;
    const { ballot, acceptedBallot, acceptedValue } = message.content;
    if (!acceptedBallot) return;

    this.progression.proposed.push({
      ballot: acceptedBallot,
      value: acceptedValue
    });

    if (this.majority(this.progression.proposed)) {
      let value = null;
      if (this.isNoValue()) {
        value = this.progression.initialValue;
      } else {
        value = this.greatestBallot().value;
      }
      const message = new Message(Message.types().PROPOSE, {
        ballot: ballot,
        value
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
    if (this.progression.decided) return;

    const { ballot, value } = message.content;
    if (BHelpers.greaterThan(ballot, this.progression.ballot)) {
      this.progression.acceptedBallot = ballot;
      this.progression.acceptedValue = value;
      const message = new Message(Message.types().ACCEPT, {
        ballot: this.progression.acceptedBallot,
        value: this.progression.acceptedValue
      });
      this.candidate.template.sendOverlayUnicastAll(this.overlay, message);
      this.decide(this.candidate.template.foglet.inViewID, message);
    }
  }

  decide(id, message) {
    if (this.progression.decided) return;
    const { ballot, value } = message.content;
    const bstring = BHelpers.toString(ballot);

    if (!this.progression.accepted[bstring]) {
      this.progression.accepted[bstring] = { [id]: value };
    } else {
      this.progression.accepted[bstring][id] = value;
    }

    if (!this.isMajorityValue(bstring, value)) return;

    // this.progression.decided = value;
    // Normalement setInterval, mais pour tester je fais qu'une seule fois
    const answer = new Message(Message.types().DECIDE, { value });
    this.candidate.template.sendOverlayUnicastAll(this.overlay, answer);
    this.decided(this.candidate.template.foglet.inViewID, answer);
  }

  decided(id, message) {
    if (this.progression.decided) return;
    const { value } = message.content;
    this.progression.decided = value;
    if (this.resolver) this.resolver(value);

    if (!this.candidate.isLeader(this.overlay)) return;
    clearInterval(this.periodic);
  }

  /**
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
   * @returns
   * @memberof Paxos
   */
  greatestBallot() {
    if (this.progression.length == 0) return;
    let greatest = this.progression.proposed[0];
    this.progression.proposed.forEach(proposed => {
      if (
        BHelpers.greaterThan(proposed.ballot, greatest.ballot) &&
        proposed.value !== null
      ) {
        greatest = proposed;
      }
    });
    return greatest;
  }

  majority(array) {
    return array.length >= Math.floor(this.progression.maxPeers / 2 + 1);
  }

  isMajorityValue(bstring, value) {
    let count = 0;
    const accepted = this.progression.accepted[bstring];
    Object.keys(accepted).forEach(key => {
      if (value && accepted[key].pid == value.pid) count++;
    });

    return count >= Math.floor(this.progression.maxPeers / 2 + 1);
  }
}

module.exports = Paxos;
