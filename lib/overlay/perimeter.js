const MUpdateCache = require("./messages/mupdatecache.js");
const TMAN = require("./overlay");
const MUpdatePartialView = require("./messages/mupdatepartialview.js");

module.exports = class Perimeter extends TMAN {
  constructor(...Args) {
    super(...Args);
    this.options.target.leader = {
      id: this._rps.II.peer,
      descriptor: this._rps.options.descriptor
    };
    this._setupListener();
    this._updateCache();
  }

  _setupListener(delay = this.options.delta) {
    const overlay = this.options.pid;
    setTimeout(() => {
      this._manager.overlay(overlay).communication.onUnicast((id, message) => {
        if (message.type === "MUpdateCache") {
          this._rps.cache.set(message.peer, message.descriptor);
          if (this._rps.partialView.has(message.peer)) {
            const myDescriptor = this._rps.partialView.get(message.peer)
              .descriptor;
            myDescriptor.x = message.descriptor.x;
            myDescriptor.y = message.descriptor.y;
            myDescriptor.z = message.descriptor.z;
          }
        }
      });
    }, 0.5 * 1000);
  }

  _updateCache(delay = this.options.delta) {
    this.periodic = setInterval(() => {
      const overlay = this.options.pid;
        this._manager
        .overlay(overlay) && this._manager
        .overlay(overlay)
        .communication.sendMulticast(
          this._rps.getPeers(),
          new MUpdateCache(this.inviewId, this._rps.options.descriptor)
        ).then().catch(
          e => {

            }
        );
    }, 0.7 * delay);
  }


  /**
   * Gives the start descriptor used by the TMan overlay (can be an empty object).
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {Object} The start descriptor used by the TMan overlay
   */
  _startDescriptor() {
    return {
      id: "test",
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
      z: Math.floor(Math.random() * 10)
    };
  }



  getDistance(descriptor1, descriptor2) {
    const { x: xa, y: ya, z: za } = descriptor1;
    const { x: xb, y: yb, z: zb } = descriptor2;
    const dx = xa - xb;
    const dy = ya - yb;
    const dz = za - zb;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isNearby(descriptor1, descriptor2, perimeter) {
    const distance = this.getDistance(descriptor1, descriptor2);
    //  Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance > perimeter ? false : true;
  }
  /**
   * Compare two peers and rank them according to a ranking function.
   * This function must return `0 if peerA == peerB`, `1 if peerA < peerB` and `-1 if peerA > peerB`.
   *
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @param {*} neighbour - The neighbour to rank with
   * @param {Object} descriptorA - Descriptor of the first peer
   * @param {Object} descriptorB - Descriptor of the second peer
   * @param {TManOverlay} peerA - (optional) The overlay of the first peer
   * @param {TManOverlay} peerB - (optional) The overlay of the second peer
   * @return {integer} `0 if peerA == peerB`, `1 if peerA < peerB` and `-1 if peerA > peerB` (according to the ranking algorithm)
   */
  _rankPeers(neighbour, descriptorA, descriptorB, peerA, peerB) {
    return 1;
    //   const { coordinates, perimeter } = this.options.target;
    //   return this.isNearby(coordinates, descriptorA, perimeter) ? -1 : 1;
  }
};
