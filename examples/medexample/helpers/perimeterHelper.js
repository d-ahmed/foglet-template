const spawnTarget = (targetId, options = {}) => {
  // Create target
  if (!targetId) return console.log("please specify an id");
  const spawned = new target(targetId, options);
  const { x, y } = spawned.getCoordinates();
  const color = randomColor();
  addNode(overlay, {
    id: spawned.id,
    label: `p-${targetId}(${x}, ${y})`,
    x,
    y,
    size: 4,
    color
  });
  // Add peers to the target overlay
  peers.forEach(peer => {
    const response = peer.targetSpawned(spawned);
    if (!response) return;
    const fgid = peer.foglet.inViewID;
    const edgeId = id => `${spawned.id}.${fgid}-${id}`;
    peer.on(spawned.id + "-open", id =>
      addEdge(overlay, fgid, id, { color, id: edgeId(id) })
    );
    peer.on(spawned.id + "-close", id => dropEdge(overlay, edgeId(id)));
  });
};
