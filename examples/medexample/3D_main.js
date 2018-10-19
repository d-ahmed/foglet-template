//console.log(template); // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'
const MAX_PEERS = 5;
// Create sigma graphs _________
// const rps = createSigma("rps");
//myChart;
//const overlay = createSigma("overlay");
// Creating peers and sigma nodes
const max = 100;
const peers = [];
const delta = 2 * 1000
for (let i = 0; i < max; i++) {
  //  const fogletTemplate = new template(undefined, true);
  const fogletTemplate = new template(
    {
      foglet: {
        id: i+'',
        overlays: [
          {
            name: "tman",
            options: {
              delta: delta,
              timeout: 2 * 1000,
              pendingTimeout: 5 * 1000,
              maxPeers: MAX_PEERS,
              descriptor: {
                x: Math.floor(Math.random() * max),
                y: Math.floor(Math.random() * max),
                z: Math.floor(Math.random() * max)
              }
            }
          }
        ]
      }
    },
    true
  );
  peers.push(fogletTemplate);
  addNode(fogletTemplate.foglet.overlay('tman')._network.options.descriptor,fogletTemplate.foglet.inViewID)
  // Add nodes to graph
  const options = {
    //color: randomColor(),
    index: i
  };
 // addTemplateToGraph(overlay, fogletTemplate, options);
  // Adding listeners
  const fgId = fogletTemplate.foglet.inViewID;
  fogletTemplate.on("overlay-open", id => add3DEdge(fgId, id));
  fogletTemplate.on("overlay-close", id => removeEdge(fgId,id));

  /*fogletTemplate.on("descriptor-updated", ({ id, descriptor }) => {
    updateNode(overlay, id, descriptor);
  });*/
}



forEachPromise(peers, (peer, index) => {

  if (index == 0) return;
  let rn = index;
  rn = Math.floor(Math.random() * index);
  const randomPeer = peers[rn];
  return new Promise(
    (resolve, reject) =>
      setTimeout(() => {
        peer.connection(randomPeer).then(resolve);
      },0.5 * 1000)
  );
}).then(() => {

});


