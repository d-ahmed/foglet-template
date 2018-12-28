const types = {
  PREPARE: "prepare",
  ACKNOWLEDGE: "acknowledge",
  ACCEPT_REQUEST: "accept_request",
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
