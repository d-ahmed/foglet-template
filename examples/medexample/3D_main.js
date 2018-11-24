
const MAX_PEERS = 2
const max = 30
const peers = []
const delta = 1000
for (let i = 0; i < max; i++) {
  const fogletTemplate = new template(
    {
      foglet: {
        id: i + '',
        overlays: [
          {
            name: 'tman',
            options: {
              delta: delta,
              timeout: 60 * 1000,
              pendingTimeout: 5 * 1000,
              maxPeers: MAX_PEERS,
              descriptor: {
                x: i * 2, // Math.floor(Math.random() * max), //
                y:  i % 5, //  Math.floor(Math.random() * max),  // 
                z: Math.floor(Math.random() * max)
              }
            }
          }
        ]
      }
    },
    true
  )
  peers.push(fogletTemplate)
  addNode(fogletTemplate.foglet.overlay('tman')._network.options.descriptor, fogletTemplate.foglet.inViewID)

  const fgId = fogletTemplate.foglet.inViewID
  fogletTemplate.on('overlay-open', id => add3DEdge(fgId, id))
  fogletTemplate.on('overlay-close', id => removeEdge(fgId, id))
}

forEachPromise(peers, (peer, index) => {
  if (index === 0) return
  let rn = Math.floor(Math.random() * index)
  const randomPeer = peers[rn]
  return new Promise(
    (resolve, reject) => peer.connection(randomPeer).then(resolve)
  )
}).then(() => {

})
