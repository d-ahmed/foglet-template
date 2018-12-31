const Paxos = require("./Paxos.js");

class Main {
  constructor(template) {
    this.template = template;
    this.current = {};
    this.instance = new Set();
    // Launch paxos for all current overlays
    template.getOverlays().forEach(overlay => {
      this.current[overlay] = new Paxos(template, overlay);
    });

    // Launch paxos for incoming overlays
    template.on("target-spawned", overlay => {
      if (this.instance.has(overlay)) return;
      console.log(overlay)
      this.instance.add(overlay);
      template.handleUnicast(overlay);
      try {
        this.current[overlay] = new Paxos(template, overlay);
      } catch (e) {
        console.log(e);
      }
    });
  }

  getTarget(target) {
    if (!this.current[target]) return;
    this.current[target].start();
  }
}

module.exports = Main;
