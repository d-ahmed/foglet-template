console.log(template) // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = '' // 'template'

sigma.classes.graph.addMethod('findNode', function(id){
  return this.nodesArray.filter((node)=>node.id===id).shift()
})

let rps = new sigma({
  renderer: {
    container: 'rps',
    type: 'canvas'
  },
  settings: {
    minArrowSize: 10
  }
})
let overlay = new sigma({
  renderer: {
    container: 'overlay',
    type: 'canvas'
  },
  settings: {
    minArrowSize: 10
  }
})

let deplace = 360000

let peers = []

const max = 10
let maxPeers = 4
peers.push(new template({foglet:{
  overlays: [
    {
      name: 'tman',
      options: {
        delta: 2 * 1000,
        maxPeers: maxPeers,
        timeout: 1 * 1000,
        pendingTimeout: 2 * 1000,
        descriptor:{
          x : 0,
          y : 0
        }
      }
    }
  ]
}}, true))
const peerLabel = `${peers[0].foglet.inViewID.slice(0,4)} (${peers[0].foglet.overlay('tman').network.descriptor.x},${peers[0].foglet.overlay('tman').network.descriptor.y})`
rps.graph.addNode({
  'id': peers[0].foglet.inViewID,
  'firstLabel': peerLabel,
  'label': peerLabel,
  'x': peers[0].foglet.overlay('tman').network.descriptor.x,
  'y': peers[0].foglet.overlay('tman').network.descriptor.y,
  'size': 1
})

overlay.graph.addNode({
  'id': peers[0].foglet.inViewID,
  'label': peerLabel,
  'firstLabel': peerLabel,
  'x': peers[0].foglet.overlay('tman').network.descriptor.x,
  'y': peers[0].foglet.overlay('tman').network.descriptor.y,
  'size': 1
})

peers[0].on('changelocation', (foglet)=>{
  
  let rpsnode = rps.graph.findNode(foglet.inViewID)
  let tmannode = overlay.graph.findNode(foglet.inViewID)
  let x = foglet.overlay('tman').network.descriptor.x
  let y = foglet.overlay('tman').network.descriptor.y
  let peerLabel = `(${x},${y})`
  console.log('changelocation', peerLabel)
  rpsnode.firstLabel = peerLabel
  tmannode.firstLabel = peerLabel
  refresh(foglet.inViewID, overlay)
  refresh(foglet.inViewID, rps)
  refresh(peers[0].foglet.inViewID, rps)
  refresh(peers[0].foglet.inViewID, overlay)
  rpsnode.x = x
  rpsnode.y = y
  tmannode.x = x
  tmannode.y = y
  rps.refresh()
  overlay.refresh()
})

peers[0].on('rps-open', (id) => {
  rps.graph.addEdge({
    'id': id + '-' + peers[0].foglet.inViewID,
    'source': peers[0].foglet.inViewID,
    'target': id,
    'type':'curvedArrow'
  })
  refresh(id, rps)
  refresh(peers[0].foglet.inViewID, rps)
})
peers[0].on('rps-close', (id) => {
  rps.graph.dropEdge(id + '-' + peers[0].foglet.inViewID)
  refresh(id, rps)
  refresh(peers[0].foglet.inViewID, rps)
})
peers[0].on('overlay-open', (id) => {
  overlay.graph.addEdge({
    'id': id + '-' + peers[0].foglet.inViewID,
    'source': peers[0].foglet.inViewID,
    'target': id,
    'type':'curvedArrow'
  })
  refresh(id, overlay)
  refresh(peers[0].foglet.inViewID, overlay)
})
peers[0].on('overlay-close', (id) => {
  overlay.graph.dropEdge(id + '-' + peers[0].foglet.inViewID)
  refresh(id, overlay)
  refresh(peers[0].foglet.inViewID, overlay)
})

let p = []
for (let i = 1; i < max; ++i) {
  p.push(i)
}


randomColor = () => {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let  colors = []

let colorsPromise = new Promise((resolve, reject)=>{
  p.reduce((acc, i)=>{
    colors[(i-2)] = randomColor()
  })
  setTimeout(resolve, 100)
})

colorsPromise.then(()=>{
  p.reduce((acc, i) => acc.then(() => {
    return new Promise((resolve, reject) => {
      let x = i*2;
      let y = i%5;
      /* let x = Math.floor(Math.random()*50);
      let y = Math.floor(Math.random()*50);*/
      let t = new template({foglet:{
        overlays: [
          {
            name: 'tman',
            options: {
              delta: 2 * 1000,
              timeout: 1 * 1000,
              pendingTimeout: 2 * 1000,
              maxPeers: maxPeers,
              descriptor:{
                x : x,
                y : y
              }
            }
          }
        ]
      }}, true)
      console.log(colors[i-1])
      let peerLabel = `${t.foglet.inViewID.slice(0,4)} (${t.foglet.overlay('tman').network.descriptor.x},${t.foglet.overlay('tman').network.descriptor.y})`
      rps.graph.addNode({
        'id': t.foglet.inViewID,
        'label': peerLabel,
        'firstLabel': peerLabel,
        'x': t.foglet.overlay('tman').network.descriptor.x,
        'y': t.foglet.overlay('tman').network.descriptor.y,
        'size': 1,
        'color':colors[i-1]
      })
      overlay.graph.addNode({
        'id': t.foglet.inViewID,
        'label': peerLabel,
        'firstLabel': peerLabel,
        'x': t.foglet.overlay('tman').network.descriptor.x,
        'y': t.foglet.overlay('tman').network.descriptor.y,
        'size': 1,
        'color':colors[i-1]
      })
  
      t.on('changelocation', (foglet)=>{
        console.log('changelocation', foglet)
        let rpsnode = rps.graph.findNode(foglet.inViewID)
        let tmannode = overlay.graph.findNode(foglet.inViewID)
        let x = foglet.overlay('tman').network.descriptor.x
        let y = foglet.overlay('tman').network.descriptor.y
        let peerLabel = `(${x},${y})`
        rpsnode.firstLabel = peerLabel
        tmannode.firstLabel = peerLabel
        refresh(foglet.inViewID, overlay)
        refresh(foglet.inViewID, rps)
        refresh(t.foglet.inViewID, rps)
        refresh(t.foglet.inViewID, overlay)
        rpsnode.x = x
        rpsnode.y = y
        tmannode.x = x
        tmannode.y = y
        rps.refresh()
        overlay.refresh()
      })
  
      t.on('rps-open', (id) => {
        rps.graph.addEdge({
          'id': id + '-' + t.foglet.inViewID,
          'source': t.foglet.inViewID,
          'target': id,
          'type':'curvedArrow'
        })
        refresh(id, rps)
        refresh(t.foglet.inViewID, rps)
      })
      t.on('rps-close', (id) => {
        rps.graph.dropEdge(id + '-' + t.foglet.inViewID)
        refresh(id, rps)
        refresh(t.foglet.inViewID, rps)
      })
      t.on('overlay-open', (id) => {
        overlay.graph.addEdge({
          'id': id + '-' + t.foglet.inViewID,
          'source': t.foglet.inViewID,
          'target': id,
          'type':'curvedArrow'
        })
        refresh(id, overlay)
        refresh(t.foglet.inViewID, overlay)
      })
      t.on('overlay-close', (id) => {
        overlay.graph.dropEdge(id + '-' + t.foglet.inViewID)
        refresh(id, overlay)
        refresh(t.foglet.inViewID, overlay)
      })
      const rn = Math.floor(Math.random() * peers.length)
      let p = peers[rn]
      peers.push(t)
      t.connection(p).then(() => {
        rps.refresh()
        resolve()
      }).catch(e => {
        reject(e)
      })
    })
  }), Promise.resolve()).then(() => {
    /*rps.graph.nodes().forEach(n => {
      // n.color = '#DC143C'
    })*/
    rps.refresh()
    /*overlay.graph.nodes().forEach(n => {
      // n.color = '#FFA500'
    })*/
    overlay.refresh()

      setInterval(()=>{
        let x = Math.floor(Math.random()*20)
        let y = Math.floor(Math.random()*20)
        peers[Math.floor(Math.random()*(max-1)+1)].changeLocation(x,y)
      }, deplace * 1000)
  
    //setListeners()
    
    
    /*for(let i=0; i<peers.length; i++){
      /*for(let j=0; i<peers.length; j++){
        if(i!=j){

        }
      }
      broadcast(peers[i], 'miaouBroadcast', undefined)
      broadcast(peers[i], 'miaouBroadcast', 'tman')
      peers[i].sendUnicastAll('miaouUnicast')
  }*/
    
  })
})



function broadcast (peer, message, overlay) {
  peer.foglet.overlay(overlay).communication.sendBroadcast(message)
}

function setListeners () {
  peers.forEach(p => {
    p.on('receive-rps', (id, message) => {
      console.log('[%s][RPS] receive an unicasted message from %s: ', p.foglet.id, id, message)
    })
    p.on('receive-overlay', (id, message) => {
      console.log('[%s][OVERLAY] receive an unicasted message from %s: ', p.foglet.id, id, message)
    })
    p.foglet.overlay().communication.onBroadcast((id, message) => {
      console.log('[%s][RPS] receive a broadcasted message from %s: ', p.foglet.id, id, message)
    })
    p.foglet.overlay('tman').communication.onBroadcast((id, message) => {
      console.log('[%s][OVERLAY] receive a broadcasted message from %s: ', p.foglet.id, id, message)
    })
  })
}

function refresh (id, graph, overlay) {
  const n = graph.graph.nodes(id)
  n.label = n.firstLabel + ' d=' + graph.graph.degree(id)
  graph.refresh()
}


let scramble = (delay = 0) => {
  for (let i = 0; i < max; ++i) {
    setTimeout((nth) => {
      peers[nth].foglet.overlay('tman')._network.rps._exchange() // force exchange
    }, i * delay, i)
  };
}