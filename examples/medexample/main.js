const { template, target } = consensus; // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'
const MAX_PEERS = 10;
// Create sigma graphs _________
// const rps = createSigma("rps");
//myChart;
const overlay = createSigma("overlay");
// Creating peers and sigma nodes
const max = 100;
const peers = [];
const delta = 2 * 1000;
for (let i = 0; i < max; i++) {
  // const fogletTemplate = new template(undefined, true);
  const fogletTemplate = new template(
    {
      foglet: {
        id: i + "",
        overlays: [
          {
            name: "tman",
            options: {
              pid: "tman",
              delta: delta,
              timeout: 5 * 1000,
              pendingTimeout: 5 * 1000,
              maxPeers: MAX_PEERS,
              descriptor: {
                id: i + "",
                x: Math.floor(Math.random() * max), // i * 2, // 
                y: Math.floor(Math.random() * max), // i % 5, 
                z: Math.floor(Math.random() * max)
                //  x: i,
                //  y: i % 3
              }
            }
          }
        ]
      }
    },
    true
  );

  peers.push(fogletTemplate);
  // Add nodes *to graph
  const options = {
    color: "#000", //randomColor(), ,
    index: i
  };
  // addTemplateToGraph(rps, fogletTemplate, options);
  addTemplateToGraph(overlay, fogletTemplate, options);
  // Adding listeners
  const fgId = fogletTemplate.foglet.inViewID;
  // fogletTemplate.on("rps-open", id => addEdge(rps, fgId, id));
  // fogletTemplate.on("overlay-open", id => addEdge(overlay, fgId, id));
  // fogletTemplate.on("rps-close", id => dropEdge(rps, `${fgId}-${id}`));
  // fogletTemplate.on("overlay-close", id => dropEdge(overlay, `${fgId}-${id}`));
  fogletTemplate.on("descriptor-updated", ({ id, descriptor }) => {
    //    updateNode(rps, id, descriptor);
    updateNode(overlay, id, descriptor);
  });

  // updateLocation(peers);
}

// Connect random peers with each others
Array.from(peers, (peer, index) => {
  if (index == 0) return;
  let rn = index;
  rn = Math.floor(Math.random() * index);
  const randomPeer = peers[rn];
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      peer.connection(randomPeer).then(resolve);
    }, index * 1000)
  );
});

// spawnTarget(30);
spawnTarget(1, { coordinates: { x: 100, y: 100 }, perimeter: 20 });
spawnTarget(2, { coordinates: { x: 100, y: 50 }, perimeter: 20 });
spawnTarget(3, { coordinates: { x: 150, y: 130 }, perimeter: 30 });
spawnTarget(4, { coordinates: { x: 50, y: 130 }, perimeter: 20 });

// setInterval(() => {
//   refresh();
// }, 2 * 1000);

// doConvergence();
