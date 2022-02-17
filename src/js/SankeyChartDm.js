export default function SankeyChartDm() {
  // CANVAS SETUP
  let margin = {
      top: 0.1,
      right: 0,
      bottom: 0.1,
      left: 0,
    },
    color_domain,
    color_range;

  function chart(selection) {
    selection.each(function (aqData) {
      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect();
      const { height, width } = continerRect;

      const innerWidth = width * (1 - margin.left - margin.right),
        innerHeight = height * (1 - margin.top - margin.bottom);

      const fl1 = container.select(".figureLayer1"),
        fl2 = container.select(".figureLayer2");

      fl2
        .transition()
        .duration(1200)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      const colorScale = d3
        .scaleOrdinal()
        .domain(color_domain)
        .range(color_range);

      const aqData_g = aqData
        .filter((d) => d.group_or_issue == "group")
        .select("id", "key", "value");

      const aqData_i = aqData
        .filter((d) => d.group_or_issue == "issue")
        .select("id", "key", "value");

      const aqData_gi = aqData_g
        .join(aqData_i, ["id", "id"])
        .rename({ key_1: "source", key_2: "target", value_1: "value" })
        .select("id", "source", "target", "value");

      const data_links = aqData_gi.objects();

      const sankey = d3
        .sankey()
        .nodeId((d) => d.name)
        .nodeSort((n1, n2) => n2.value - n1.value)
        .nodeWidth(20)
        .nodePadding(10)
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ]);
      const nodeByName = new Map();

      for (const link of data_links) {
        if (!nodeByName.has(link.source))
          nodeByName.set(link.source, { name: link.source });
        if (!nodeByName.has(link.target))
          nodeByName.set(link.target, { name: link.target });
      }

      const data_nodes = Array.from(nodeByName.values());

      const graph = { nodes: data_nodes, links: data_links };

      const { nodes } = sankey({
        nodes: graph.nodes.map((d) => Object.assign({}, d)),
        links: graph.links.map((d) => Object.assign({}, d)),
      });

      const nodeGroup = fl2.selectAll("g").data(nodes, (d) => d.name || d[0]);

      nodeGroup.join(
        (enter) =>
          enter
            .append("g")
            .attr("class", (d) =>
              d.x0 < width / 2
                ? `nodeGroup sourceGroup ${d.name}`
                : `nodeGroup targetGroup ${d.name}`
            )
            .call((enter) =>
              enter
                .append("rect")
                .attr("id", (d) => d.name)
                .attr("fill", (d) => colorScale(d.name))
                .attr("x", (d) => d.x0)
                .attr("y", (d) => d.y0)
                .attr("width", (d) => d.x1 - d.x0)
                .attr("opacity", 1)
            )
            .call((enter) => {
              enter
                .select("rect")
                .transition()
                .duration(1200)
                .attr("y", (d) => d.y0)
                .attr("height", (d) => d.y1 - d.y0);
            }),
        (update) =>
          update.call((update) =>
            update
              .select("rect")
              .transition()
              .duration(1200)
              .attr("x", (d) => d.x0)
              .attr("y", (d) => d.y0)
              .attr("width", (d) => d.x1 - d.x0)
              .attr("height", (d) => d.y1 - d.y0)
              .attr("fill", (d) => colorScale(d.name))
          ),
        (exit) =>
          exit.call((exit) =>
            exit.select("rect").transition().duration(200).attr("height", 0)
          )
      );
    });
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.color_domain = function (_) {
    if (!arguments.length) return color_domain;
    color_domain = _;
    return chart;
  };

  chart.color_range = function (_) {
    if (!arguments.length) return color_range;
    color_range = _;
    return chart;
  };

  return chart;
}
