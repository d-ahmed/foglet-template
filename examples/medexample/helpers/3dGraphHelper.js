
const initData = {
  nodes: [],
  links: []
}
const elem = document.getElementById('3d-graph')
const Graph = ForceGraph3D()(elem)
  .enableNodeDrag(false)
  .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
  .linkDirectionalArrowLength(3.5)
  .linkDirectionalArrowRelPos(1)
  .linkCurvature(0.3)
  .graphData(initData)

const randomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// ------------------------- Node -------------------------
addNode = (descriptor, node) => {
  const { nodes, links } = Graph.graphData()
  Graph.graphData({
    nodes: [...nodes,
      { id: parseFloat(node),
        name: node + '- (' + descriptor.x + ',' + descriptor.y + ',' + descriptor.z + ')',
        val: 1,
        color: randomColor()
      }],
    links: [...links]
  })
}

// function removeNode (node) {
//   let { nodes, links } = Graph.graphData()
//   links = links.filter(l => l.source.id !== node && l.target.id !== node) // Remove links attached to node
//   nodes.splice(node.id, 1) // Remove node
//   nodes.forEach((n, idx) => { n.id = idx }) // Reset node ids to array index
//   Graph.graphData({ nodes, links })
// }

// ------------------------- EDGE -------------------------
add3DEdge = (src, trgt) => {
  const { nodes, links } = Graph.graphData()
  Graph.graphData({
    nodes: [...nodes],
    links: [...links, { source: parseFloat(src), target: parseFloat(trgt) }]
  })
}

function removeEdge (src, trgt) {
  let { nodes, links } = Graph.graphData()

  Graph.graphData({
    nodes: [...nodes],
    links: [...links.filter(l => ((l.source.id !== parseFloat(src)) || (l.target.id !== parseFloat(trgt))))]
  })
}
