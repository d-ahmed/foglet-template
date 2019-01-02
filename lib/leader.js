/**
 *
 *
 * @class Leader
 */
class Leader {
  /**
   *Creates an instance of Leader.
   * @param {*} [template=null]
   * @memberof Leader
   */
  constructor(template = null, delta = 1 * 1000, callback) {
    this.onLeader = callback;
    this.template = template;

    this.leaderOfCible = new Map();

    this.ranking = (neighbor, callkack) => (a, b) => {
      const getDistance = (descriptor1, descriptor2) => {
        const { x: xa, y: ya, z: za } = descriptor1;
        const { x: xb, y: yb, z: zb } = descriptor2;
        const dx = xa - xb;
        const dy = ya - yb;
        const dz = za - zb;
        return Math.sqrt(dx * dx + dy * dy);
      };

      const distanceA = getDistance(neighbor, a);
      const distanceB = getDistance(neighbor, b);
      if (distanceA === distanceB) {
        if (a.id < b.id) {
          return -1;
        } else if (a.id >= b.id) {
          return 1;
        }
      }
      // console.log('neighbor ', neighbor, ' a ', a, ' b ', b)
      return distanceA - distanceB;
    };
    this.doLeaderElection();
    let period = setInterval(() => {
      this.doLeaderElection();
    }, delta);
  }

  /**
   *leader
   *
   * @memberof Leader
   */
  doLeaderElection() {
    if (!this.template) return;
    let visibleOverlay = Array.from(
      this.template.foglet._networkManager._overlays.keys()
    );
    let overlays = Array.from(
      this.template.foglet._networkManager._overlays.values()
    );
    overlays.forEach((network_, index) => {
      let network = network_._network;
      let rps = network._rps;
      let myPeers = Array.from(rps.partialView.values()).map(evp => {
        let descriptor = evp.descriptor;
        descriptor.peer = evp.peer;
        return descriptor;
      });
      let descriptor = JSON.parse(JSON.stringify(rps.options.descriptor));
      descriptor.peer = network.inviewId;
      myPeers.push(descriptor);

      let cible = this.template.targets.filter(
        target => target.id === visibleOverlay[index]
      );
      if (cible.length > 0) cible = cible[0];

      Array.from(this.leaderOfCible.keys(), key => {
        if (visibleOverlay.indexOf(key) === -1) {
          this.leaderOfCible.delete(key);
        }
      });

      if (myPeers.length > 0) {
        myPeers.sort(this.ranking(cible.getCoordinates()));
        this.leaderOfCible.set(cible.id, myPeers[0]);
        if (this.onLeader) this.onLeader({ cible: cible.id, pid: myPeers[0] });
      }
    });
  }

  /**
   *
   *
   * @returns
   * @memberof Leader
   */
  getLeaders() {
    return Array.from(this.leaderOfCible.values()).map(
      desc => desc.peer || desc.id
    );
  }

  /**
   * @param overlay
   * tests if i am the leader
   */
  isLeader(overlay) {
    const leader = this.leaderOfCible.get(overlay);
    if (!leader) return false;
    return leader.peer == this.template.foglet.inViewID;
  }

  /**
   * @param overlay
   * return leader of the overlay
   */
  getLeader(overlay) {
    return this.leaderOfCible.get(overlay);
  }
}

module.exports = Leader;
