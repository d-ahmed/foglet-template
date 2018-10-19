console.log(template); // eslint-disable-line
// the bundle is included by default in the browser you do not have to require/import it
localStorage.debug = ""; // 'template'
const MAX_PEERS = 5;
// Create sigma graphs _________
// const rps = createSigma("rps");
//myChart;
const overlay = createSigma("overlay");
// Creating peers and sigma nodes
const max = 50;
const peers = [];
const delta = 10 * 1000
for (let i = 0; i < max; i++) {
  //  const fogletTemplate = new template(undefined, true);
  const fogletTemplate = new template(
    {
      foglet: {
        id: i + '',
        overlays: [
          {
            name: "tman",
            options: {
              delta: delta,
              timeout: 5 * 1000,
              pendingTimeout: 5 * 1000,
              maxPeers: MAX_PEERS,
              descriptor: {
                x: Math.floor(Math.random() * max),
                y: Math.floor(Math.random() * max)
              }
            }
          }
        ]
      }
    },
    true
  );
  peers.push(fogletTemplate);
  // Add nodes to graph
  const options = {
    color: randomColor(),
    index: i
  };
  // addTemplateToGraph(rps, fogletTemplate, options);
  addTemplateToGraph(overlay, fogletTemplate, options);
  // Adding listeners
  const fgId = fogletTemplate.foglet.inViewID;
  // fogletTemplate.on("rps-open", id => addEdge(rps, fgId, id));
  fogletTemplate.on("overlay-open", id => addEdge(overlay, fgId, id));
  // fogletTemplate.on("rps-close", id => dropEdge(rps, `${fgId}-${id}`));
  fogletTemplate.on("overlay-close", id => dropEdge(overlay, `${fgId}-${id}`));
  fogletTemplate.on("descriptor-updated", ({ id, descriptor }) => {
    // updateNode(rps, id, descriptor);
    updateNode(overlay, id, descriptor);
  });
}

// Connect random peers with each others
forEachPromise(peers, (peer, index) => {
  if (index == 0) return;
  let rn = index;
  rn = Math.floor(Math.random() * index);
  const randomPeer = peers[rn];
  return new Promise(
    (resolve, reject) =>
      setTimeout(() => {
        peer.connection(randomPeer).then(resolve);
      },0.5 *1000),

  );
}).then(() => {

});

let scramble = (delay = 0) => {
  for (let i = 0; i < max; ++i) {
    setTimeout((nth) => {
      peers[nth].foglet.overlay('tman')._network.rps._exchange() // force exchange
    }, i * delay, i)
  };
}

var convergence = () => { 
	var getDistance = (a,b) => {
		  var dx = a.x - b.x;
		  var dy = a.y - b.y;
		  return Math.sqrt(dx * dx + dy * dy);
		};
	var voisins = new Array(); 
	var fails = 0;
	for (let i = 0; 
		i < overlay.graph.nodes().length; i++) {
		for (let j =0; j < overlay.graph.nodes().length ; j++ ) {
				voisins[j] = getDistance(overlay.graph.nodes()[i], overlay.graph.nodes()[j]);
		}
		// Là on a la distance à tous les autres voisins. 
		var min;
		for ( let k = 1; k<= MAX_PEERS ; k++){
			if (voisins[0] == 0){
				min = 1;
			} else { min = 0; }
			for(let l=0; l<voisins.length; l++){
				if(voisins[l] != 0){
					if(voisins[min] > voisins[l]){
						min = l; 
					}
				}
			} // Là on a le voisin le + proche. 
			var jelai = false; 
			for (let m =0; m < overlay.graph.edges().length;
			m++){
				if (overlay.graph.edges()[m].source == overlay.graph.nodes()[i].id){
					if (overlay.graph.edges()[m].target == overlay.graph.nodes()[min].id){
						jelai = true;
					}
				}
			}
			if (!jelai) {
				fails++;
			}
			voisins[min]=1000;
			
		}
		
	}
	return (Math.floor(((overlay.graph.edges().length-fails) / (overlay.graph.edges().length))*100 ));
}


ranking = (a) => (b, c) => {
  const distanceA = (
    Math.sqrt(
      Math.pow((a.x - b.x), 2) +
      Math.pow((a.y - b.y), 2)
    ))
  const distanceB = (
    Math.sqrt(
      Math.pow((a.x - c.x), 2) +
      Math.pow((a.y - c.y), 2)
    ))
  return distanceA > distanceB ? 1 : distanceA == distanceB ? 0 : -1
}


getCoords = function() {
  var x = document.getElementById('tbNames')
  while (x.rows.length > 1) {
    for (l = 1; l < x.rows.length; ++l) {
      x.deleteRow(l)
    }
  }
  for (let i = 0; i < max; i++) {
    voisins = JSON.parse(JSON.stringify(overlay.graph.nodes())).sort(ranking(overlay.graph.nodes()[i])).slice(1,MAX_PEERS+1);
    lesCoords =''
    cpt = 0;
    for (let l = 0; l< MAX_PEERS;++l) {
      for (let m = 0; m < overlay.graph.edges().length; ++m) {
        if ((overlay.graph.edges()[m].source == overlay.graph.nodes()[i].id) &&
          (overlay.graph.edges()[m].target ==voisins[l].id)) {
            lesCoords = lesCoords + '(' + voisins[l].x + ',' + voisins[l].y + ') '
            ++cpt
        }
      }
    }
    var x = document.getElementById('tbNames')
    var row = x.insertRow(i+1)
    row.insertCell(0).innerHTML =  '(' +overlay.graph.nodes()[i].x +','+overlay.graph.nodes()[i].y+')';
    row.insertCell(1).innerHTML = lesCoords;
    row.insertCell(2).innerHTML = getCoordsList(voisins);
    row.insertCell(3).innerHTML = cpt/MAX_PEERS *100 +"%"
  }


}

getCoordsList = function (list) {
  coords = ''
  list.forEach((l) => {
    coords = coords + '(' + l.x + ',' + l.y + ') '
  })
  return coords
}


ranking = (neighbor, callkack) => (a, b) => {
  const getDistance = (descriptor1, descriptor2) => {
    const { x: xa, y: ya, z:za } = descriptor1;
    const { x: xb, y: yb, z:zb } = descriptor2;
    const dx = xa - xb;
    const dy = ya - yb;
    const dz = za - zb;
    return Math.sqrt(dx * dx + dy * dy);
    // return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const distanceA = getDistance(neighbor, a);
  const distanceB = getDistance(neighbor, b);
  if(distanceA === distanceB){
    callkack(neighbor, a, b)
  }
  return distanceA - distanceB;
}



let peersNeighbours = () => peers.map( p => p.foglet.overlay('tman')._network.getNeighbours())

let getPeersF = () => deepcopy(peers.map(p => {
  descriptor = p.foglet.overlay('tman')._network._rps.options.descriptor
  descriptor.id = p.foglet.overlay('tman')._network.inviewId
  return descriptor
}));


let equidistance = new Map();
addToEuidistance = (neighborId, aId, bId) => {
  if(!equidistance.has(neighborId)){
    equidistance.set(neighborId, new Set())
  }
  equidistance.get(neighborId).add(aId+'-'+bId)
  equidistance.get(neighborId).add(bId+'-'+aId)
}


let getRanked = () => {
  let datacopy = deepcopy(getPeersF())
  return deepcopy(getPeersF()).map(p => deepcopy(datacopy.filter((p1 => p.id!==p1.id)).sort(ranking(p, (neighbor, a, b)=>{
    //console.log("Ranking equal",neighbor, a, b)
    addToEuidistance(neighbor.id, a.id, b.id)
  })).slice(0,MAX_PEERS)))
}

compareNeighbours = (tab1, tab2) => {
  if(tab1.length !== tab2.length){
    new Error("Require same size")
    return;
  }
  const reducer = (acc, val) => acc + val;
  const iterator = equidistance.values()
  return  Math.floor((tab1.map((value, index)=>{
    let a = new Set(value);
    let b = new Set(tab2[index]);
    let union = new Set([...a, ...b]);
    let differenceA = new Set([...a].filter(x => !b.has(x)));
    let differenceB = new Set([...b].filter(x => !a.has(x)));
    let unionAB = new Set([...differenceA, ...differenceB]);

    let contains = false
    let nextIte = iterator.next().value
    if(nextIte){
    for (let id of unionAB.values()) {
        for (let id1 of unionAB.values()) {
          if(nextIte.has(id+'-'+id1)){
            contains = true
          }
        }
      }
    }
    let numerateur = b;
    if(contains && b.size !== union.size){
      numerateur = new Set([...b, ...unionAB]);
    }
    // console.log(index, contains, a.size !== union.size)
    return (numerateur.size/union.size)
  }).reduce(reducer)/ tab1.length)* 100)
}

doConvergence = () => {
  let cpt = 1;
  let ranked = getRanked().map(r=>r.map(r1=>r1.id));
  let span = document.getElementById("converge");
  const i = setInterval(()=>{
    const conv = compareNeighbours(ranked, peersNeighbours());
    span.innerHTML = conv +" %";
    doPlot(cpt,conv)
    if(conv===100){
      clearInterval(i)
    }
    ++cpt;
  }, 3 * 1000)
}

let axeY = [0];
let axeX = [0];

doPlot =  (cpt,conv) => {
  axeY.push(conv)
  axeX.push(cpt)
  graph = createGraph(axeX, axeY)
}

doConvergence();