const Paxos = require("./Paxos.js");

class Main {
  constructor(template) {
    this.current = [];
    // Launch paxos for all current overlays
    template.getOverlays().forEach(overlay => {
      this.current.push(new Paxos(template, overlay));
    });

    // Launch paxos for incoming overlays
    template.on("overlay-open", overlay => {
      try {
        this.current.push(new Paxos(template, overlay));
      } catch (e) {
        console.log(e);
      }
    });
  }
}

module.exports = Main;
