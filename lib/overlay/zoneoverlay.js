const TMAN = require("./abstract");
const debug = require("debug")("template:overlay");
const MUpdateCache = require('./messages/mupdatecache.js')
const MCible = require('./messages/mcible.js')
const _ = require("lodash");

module.exports = class ZoneOverlay extends TMAN {
  constructor(...Args) {
    super(...Args);
    debug("Overlay initialized");
    this.rps._partialViewSize = () => this.options.maxPeers;
    this.rps._sampleSize = () => 256;
    this._setupListener();
    this._updateCache();
    this.myneighbours = new Set();

    this._manager._rps._communication.onUnicast((id, message) => { 
      if(message.type === 'MCible'){
        if(message.descriptor.iscible){
          if(this._rps.options.descriptor.cibles.indexOf(message.descriptor.id)===-1 && message.func === 'add'){
            this._rps.options.descriptor.cibles.push(message.descriptor.id)
          } else if(this._rps.options.descriptor.cibles.indexOf(message.descriptor.id)!==-1 && message.func === 'remove'){            //this.options.maxPeers =  this.options.maxPeers-1
            this._rps.options.descriptor.cibles = this._rps.options.descriptor.cibles.filter(cible=>cible!=message.descriptor.id)
          }
        }
      }
    })

    this._rps.on("open", id => {
      if(this.myneighbours.has(id)){
        this._manager._rps._communication.sendUnicast(id, new MCible(this._rps.options.descriptor.id, this._rps.options.descriptor))
      }
    })

    this._rps.on("close", id => {
          this._manager._rps._communication.sendUnicast(id, new MCible(this._rps.options.descriptor.id, this._rps.options.descriptor, 'remove'))
    })

  }

  /**
   * Gives the start descriptor used by the TMan overlay (can be an empty object).
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {Object} The start descriptor used by the TMan overlay
   */
  _startDescriptor() {
    return {
      id: "test",
      iscible: false,
      perimettre: 0,
      cibles: [],
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
      z: Math.floor(Math.random() * 50)
    };
  }

  _setupListener(delay = this.options.delta){
    setTimeout(() => {
      this._manager.overlay('tman').communication.onUnicast((id, message) => { 
        if(message.type === 'MUpdateCache'){
          this._rps.cache.set(message.peer, message.descriptor)
        }
      })
    }, 0.5 * 1000)

    setTimeout(() => {
      this._manager.overlay('tman').communication.onUnicast((id, message) => { 
        if(message.type === 'MUpdatePartialView'){
          this._rps.cache.set(message.peer, message.descriptor)
          if(this._rps.partialView.has(message.peer)){
            const myDescriptor = this._rps.partialView.get(message.peer).descriptor;
            myDescriptor.x = message.descriptor.x;
            myDescriptor.y = message.descriptor.y;
            myDescriptor.z = message.descriptor.z;
          }
        }
      })
    }, 0.5 * 1000)
  }

  _updateCache(delay = this.options.delta) {

    

    this.periodic = setInterval(() => {
      this._rps.parent.getPeers().forEach(peerId => {
        this._manager.overlay('tman').communication.sendUnicast(peerId, new MUpdateCache(this.inviewId, this._rps.options.descriptor))
      });
    }, 2 * 1000);
  }

  /**
   * Give the delay **in milliseconds** after which the descriptor must be recomputed.
   * Subclasses of {@link TManOverlay} **must** implement this method.
   * @return {number} The delay **in milliseconds** after which the descriptor must be recomputed
   */
  _descriptorTimeout() {
    return 5 * 1000;
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
    const getDistance = (descriptor1, descriptor2) => {
      const { x: xa, y: ya, z:za } = descriptor1;
      const { x: xb, y: yb, z:zb } = descriptor2;
      const dx = xa - xb;
      const dy = ya - yb;
      const dz = za - zb;
      return Math.sqrt(dx * dx + dy * dy);
      //return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    const distanceA = getDistance(neighbour.descriptor, descriptorA);
    const distanceB = getDistance(neighbour.descriptor, descriptorB);

    // La cible défini sont perimettre
    if(neighbour.descriptor.iscible===true && this._rps.options.descriptor.id === neighbour.descriptor.id){
      if(!descriptorA.iscible && distanceA <= neighbour.descriptor.perimettre){
        if(!this.myneighbours.has(peerA.descriptor.id)){
          this.options.maxPeers =  this.options.maxPeers+1
          this.myneighbours.add(descriptorA.id)
        }
        return -1;
      }else if(!descriptorA.iscible && distanceA > neighbour.descriptor.perimettre && this.myneighbours.has(peerA.descriptor.id)){
        this.myneighbours.delete(peerA.descriptor.id)
        this.options.maxPeers =  this.options.maxPeers-1
      }
    }

    // Tous ceux qui voit la cible doivent s'interconnecter
    if(
      (this._rps.options.descriptor.id === neighbour.descriptor.id) &&
      neighbour.descriptor.cibles.length>0 &&
      ((_.intersection(neighbour.descriptor.cibles, descriptorA.cibles).length>0) ||
      ((neighbour.descriptor.cibles.indexOf(descriptorA.id)!==-1) && descriptorA.iscible))
    ){
        if(!this.myneighbours.has(descriptorA.id)){
          this.options.maxPeers =  this.options.maxPeers+1
          this.myneighbours.add(descriptorA.id)
        }
        
        return -1;
    }else if((this._rps.options.descriptor.id === neighbour.descriptor.id) && this.myneighbours.has(descriptorA.id) && ((_.intersection(neighbour.descriptor.cibles, descriptorA.cibles).length===0) || (neighbour.descriptor.cibles.indexOf(descriptorA.id)===-1) && descriptorA.iscible)){
            this.options.maxPeers =  this.options.maxPeers-1
            this.myneighbours.delete(descriptorA.id)
    }

    return 1;
  }
};
