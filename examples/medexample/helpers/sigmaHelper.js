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

const addNode = (container, options) => {
  container.graph.addNode(options);
  container.refresh();
};

const addTemplateToGraph = (container, template, options) => {
  const { index, color } = options;
  const { x, y } = template.getDescriptor();
  const id = template.foglet.inViewID;
  addNode(container, {
    id,
    label: `${id.substring(0, 4)}(${x},${y})`,
    x,
    y,
    size: 2,
    color
  });
  container.refresh();
};

const dropNode = (container, id) => {
  container.graph.dropNode(id)
}

const addEdge = (container, source, target, options = {}) => {
  try {
    let exists = false;
    container.graph.edges().forEach(edge => {
      if (edge.id == source + "-" + target) exists = true;
    });
    if (exists) return;
    container.graph.addEdge(
      Object.assign(
        {
          id: source + "-" + target,
          source,
          target,
          type: "curvedArrow"
        },
        options
      )
    );
    container.refresh();
  } catch (e) {
    // console.log("error connecting edges", e);
  }
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
