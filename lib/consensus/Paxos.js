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
      this.acknowledge
    );
    this.candidate.template.addHandler(
      Message.types().ACKNOWLEDGE,
      this.propose
    );
    this.candidate.template.addHandler(Message.types().PROPOSE, this.accept);

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
    const leaderBallot = message.content.ballot;
    if (leaderBallot.n >= this.progression.ballot) {
      this.progression.ballot = leaderBallot;

      const answer = new Message(Message.types().ACKNOWLEDGE, {
        ballot: leaderBallot,
        acceptedBallot: this.progression.acceptedBallot,
        acceptedValue: this.progression.acceptedValue
      });

      this.candidate.template.sendUnicast(leaderBallot.pid, answer);
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
}

module.exports = Paxos;
