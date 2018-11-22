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

    this._updateLeader();
  }

  _updateLeader(delay = this.options.delta) {
    setInterval(() => {
      const overlay = this.options.pid;
      const manager = this._manager.overlay(overlay);

      const neighbours = manager._network.getNeighbours();
      neighbours.forEach(neighbour => {
        const {
          id: leaderId,
          descriptor: leaderPos
        } = this.options.target.leader;

        const targetPos = this.options.target.coordinates;
        const neighbourPos = this._rps.partialView.get(neighbour).descriptor;
        const distance1 = this.getDistance(leaderPos, targetPos);
        const distance2 = this.getDistance(neighbourPos, targetPos);
        if (
          distance2 < distance1 ||
          (distance2 === distance1 && neighbour < leaderId)
        ) {
          this.options.target.leader = {
            id: neighbour,
            descriptor: neighbourPos
          };
        }
      });
    }, delay);
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
