const { template, target } = consensus; // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'
const MAX_PEERS = 10;

// Create sigma graphs _________
// const rps = createSigma("rps");
const overlay = createSigma("overlay");

// Creating peers and sigma nodes
const MAX_NODES = 100;
const peers = [];
const delta = 2 * 1000;

for (let i = 0; i < MAX_NODES; i++) {
  const fogletTemplate = new template({ foglet: { id: i + "" } }, true);
  fogletTemplate.setDescriptor({
    id: i,
    x: getRandom(),
    y: getRandom()
  });
  peers.push(fogletTemplate);

  // Add nodes *to graph
  // addTemplateToGraph(rps, fogletTemplate, {
  //   color: randomColor(),
  //   index: i
  // });

  addTemplateToGraph(overlay, fogletTemplate, {
    color: "#000",
    index: i
  });

  // Adding listeners
  const fgId = fogletTemplate.foglet.inViewID;

  // fogletTemplate.on("rps-open", id => addEdge(rps, fgId, id));
  // fogletTemplate.on("rps-close", id => dropEdge(rps, `${fgId}-${id}`));
  fogletTemplate.on("descriptor-updated", ({ id, descriptor }) => {
    // updateNode(rps, id, descriptor);
    updateNode(overlay, id, descriptor);
  });

  // updateLocation(peers);
}

// Connect random peers with each others in the rps
Array.from(peers, (peer, index) => {
  if (index == 0) return;
  let rn = index;
  rn = Math.floor(Math.random() * index);
  const randomPeer = peers[rn];
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      peer.connection(randomPeer).then(resolve);
    }, index * 500)
  );
});

spawnTarget("1", {
  coordinates: { x: getRandom(), y: getRandom() },
  perimeter: 20
});
spawnTarget("2", {
  coordinates: { x: getRandom(), y: getRandom() },
  perimeter: 20
});
spawnTarget("5", {
  coordinates: { x: getRandom(), y: getRandom() },
  perimeter: 15
});
// spawnTarget("4", { coordinates: { x: 37, y: 3 }, perimeter: 4 });

// spawnTarget("c", {
//   coordinates: { x: getRandom(), y: getRandom() },
//   perimeter: 5
// });

// setInterval(() => {
//   refresh();
// }, 2 * 1000);

// doConvergence();
