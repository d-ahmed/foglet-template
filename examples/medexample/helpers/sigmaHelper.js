const NODES_COORDINATES = {};

const createSigma = (container, settings = {}) => {
  const defaultSettings = {
    minArrowSize: 6
  };
  return new sigma({
    renderer: {
      container,
      type: "canvas"
    },
    settings: Object.assign(defaultSettings, settings)
  });
};

const addTemplateToGraph = (container, template, options) => {
  const { index, color } = options;
  const { x, y } = template.foglet.overlay("tman").network.descriptor;
  const id = template.foglet.inViewID;
  container.graph.addNode({
    id,
    label: `${id.substring(0, 4)}(${x},${y})`,
    x,
    y,
    size: 3,
    color
  });
};

const addEdge = (container, source, target) => {
  let exists = false;
  container.graph.edges().forEach(edge => {
    if (edge.id == source + "-" + target) exists = true;
  });
  if (exists) return;
  container.graph.addEdge({
    id: source + "-" + target,
    source,
    target,
    type: "curvedArrow"
  });
  container.refresh();
};

const dropEdge = (container, id) => {
  let exists = false;
  container.graph.edges().forEach(edge => {
    if (edge.id == id) exists = true;
  });
  if (!exists) return;
  container.graph.dropEdge(id);
  container.refresh();
};

const randomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 3; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const updateNode = (container, id, data) => {
  const { x, y } = data;
  const node = container.graph.nodes(id);
  node.x = x;
  node.y = y;
  container.refresh();
};
