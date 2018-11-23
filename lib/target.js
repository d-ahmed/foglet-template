const Perimeter = require("./overlay/perimeter.js");
const lmerge = require('lodash.merge')

module.exports = class Target {
  constructor(id, options) {
    this.id = "p-" + id;
    const perimeter = 7;
    const coordinates = {
      x: id,
      y: id,
      // x: Math.floor(Math.random() * 20),
      // y: Math.floor(Math.random() * 20),
      z: Math.floor(Math.random() * 20)
    };

    this.options = lmerge(
      {
        coordinates,
        perimeter,
        overlay: {
          name: this.id,
          class: Perimeter,
          options: {
            pid: this.id,
            delta: 2 * 1000,
            timeout: 5 * 1000,
            pendingTimeout: 5 * 1000,
            // descriptorTimeout: 1000 * 1000,
            maxPeers: Infinity,
            target: {
              perimeter,
              coordinates
            },
            protocol: "foglet-template-" + this.id, // foglet running on the protocol foglet-example, defined for spray-wrtc
            signaling: {
              address: "https://signaling.herokuapp.com/",
              // signalingAdress: 'https://signaling.herokuapp.com/', // address of the signaling server
              room: "room-foglet-template-" + this.id // room to join
            }
          }
        }
      },
      options
    );
  }

  isNearby(descriptor) {
    const descriptor1 = descriptor;
    const descriptor2 = this.getCoordinates();
    const perimeter = this.getPerimeter();

    const { x: xa, y: ya, z: za } = descriptor1;
    const { x: xb, y: yb, z: zb } = descriptor2;
    const dx = xa - xb;
    const dy = ya - yb;
    const dz = za - zb;
    const distance = Math.sqrt(dx * dx + dy * dy);
    //  Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance > perimeter ? false : true;
  }

  getCoordinates() {
    return this.options.coordinates;
  }
  getOverlay() {
    return this.options.overlay;
  }
  getPerimeter() {
    return this.options.perimeter;
  }
};
