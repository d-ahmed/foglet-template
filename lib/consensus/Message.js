const types = {
  START: "start",
  PREPARE: "prepare",
  ACKNOWLEDGE: "acknowledge",
  PROPOSE: "propose",
  ACCEPTED: "accepted"
};

class Message {
  constructor(type, content) {
    this.type = type;
    this.content = content;
  }
  static types() {
    return types;
  }
}

module.exports = Message;
