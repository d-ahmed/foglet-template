const Ballot = require("./Ballot.js");
const Message = require("./Message.js");
const DELTA = 3000;
class Paxos {
  constructor(template, overlay) {
    this.progression = {
      ballot: new Ballot(),
      value: null,
      acceptedBallot: new Ballot(),
      acceptedValue: null,
      proposed: []
    };

    this.candidate = new Leader(template);
    this.overlay = overlay;

    this.candidate.template.addHandler(
      Message.types().PREPARE,
      this.acknowledge.bind(this)
    );
    this.candidate.template.addHandler(
      Message.types().ACKNOWLEDGE,
      this.propose.bind(this)
    );
    this.candidate.template.addHandler(Message.types().PROPOSE, this.accept.bind(this));

    this.prepare();
  }

  // PREPARE
  prepare() {
    this.progression.ballot.setPid(this.candidate.template.foglet.inViewID);
    this.periodic = setInterval(() => {
      if (!this.candidate.isLeader(this.overlay)) return;

      const ballot = this.progression.ballot.increment();

      const message = new Message(Message.types().PREPARE, { ballot });
      this.candidate.template.sendOverlayUnicastAll(this.overlay, message);
    }, DELTA);
  }
  // ACKNOWLEDGE
  acknowledge(id, message) {

    // console.log(id, message)

    const leaderBallot = message.content.ballot;
    
    if (this.greaterThan(leaderBallot, this.progression.ballot)) {
      this.progression.ballot = leaderBallot;
  
      const answer = new Message(Message.types().ACKNOWLEDGE, {
        ballot: leaderBallot,
        acceptedBallot: this.progression.acceptedBallot,
        acceptedValue: this.progression.acceptedValue
      });
      this.candidate.template.sendOverlayUnicast(this.overlay, leaderBallot.pid, answer);
    }
  }
  // Propose
  propose(id, message) {
    // TODO
    const { ballot, acceptedBallot, acceptedValue } = message.content;
    // test if same ballot number
    this.progression.proposed.push({ sender: id, value: acceptedValue });
    //  if(this.progression.proposed.length > n-t )
    // choose
    // send message
  }
  // Accept
  accept(id, message) {
    // TODO : accept and send accepte
  }

  greaterThan(ballot1, ballot2){
    // A proposal is greater than or equal to another if:
    // 1. it is the same (both the n and pid index are equal)
    // 2. The n is higher
    // 3. The n is the same but the pid is higher
    if (ballot1.n > ballot2.n) {
        return true;
    }
    else if (ballot1.n === ballot2.n && ballot1.pid > ballot2.pid) {
        return true;
    }
    else if (ballot1.n === ballot2.n && ballot1.pid === ballot2.pid) {
        return true;
    }
    else {
        return false;
    }
}
}

module.exports = Paxos;
