
const initData = {
  nodes: [],
  links: []
};
const elem = document.getElementById("3d-graph");
const Graph = ForceGraph3D()(elem)
  .enableNodeDrag(false)
  .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
  .graphData(initData);

function removeNode(node) {
  let { nodes, links } = Graph.graphData();
  links = links.filter(l => l.source !== node && l.target !== node); // Remove links attached to node
  nodes.splice(node.id, 1); // Remove node
  nodes.forEach((n, idx) => { n.id = idx; }); // Reset node ids to array index
  Graph.graphData({ nodes, links });
}

function removeEdge(src,trgt){

  let { nodes, links } = Graph.graphData();
  //links = links.filter(l => l.source !== fgId && l.target !== id); // Remove links attached to node
  Graph.graphData({
    nodes: [...nodes],
    links : [...links.filter(l => l.source !== parseFloat(src) && l.target !== parseFloat(trgt))]
  });
//  console.log(src,trgt)

}


const randomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

addNode = (descriptor,node)=>{
    const { nodes, links } = Graph.graphData();
    console.log(node);
    Graph.graphData({
       nodes: [...nodes,{ id : parseFloat(node),name : node + '- ('+descriptor.x+','+descriptor.y+ ','+descriptor.z+')',val :2 ,color : randomColor()   }],
        links : [...links]
    });
  }

add3DEdge = (src , trgt)=>{
  const { nodes, links } = Graph.graphData();
  Graph.graphData({
    nodes: [...nodes],
     links: [...links, {source: parseFloat(src), target: parseFloat(trgt)}]
  });
  //console.log(src,trgt)
}