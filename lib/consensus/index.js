const Paxos = require("./Paxos.js");

class Main {
  constructor(template) {
    this.current = [];
    this.instance = new Set()
    // Launch paxos for all current overlays
    template.getOverlays().forEach(overlay => {
      this.current.push(new Paxos(template, overlay));
    });

    // Launch paxos for incoming overlays
    template.on("overlay-open", overlay => {
      if(this.instance.has(overlay)) return;
      this.instance.add(overlay);
      try {
        this.current.push(new Paxos(template, overlay));
      } catch (e) {
        console.log(e);
      }
    });
  }
}

module.exports = Main;
