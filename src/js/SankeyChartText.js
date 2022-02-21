export default function SankeyChartText() {
  // CANVAS SETUP
  let margin = {
      top: 0.1,
      right: 0,
      bottom: 0.1,
      left: 0,
    },
    dim_color,
    color_domain,
    color_range,
    pad = 0.1,
    bin,
    smooth = false,
    lite = false;

  function chart(selection) {
    selection.each(function (aqData) {
      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect();
      const { height, width } = continerRect;

      const innerWidth = width * (1 - margin.left - margin.right),
        innerHeight = height * (1 - margin.top - margin.bottom);

      const fl = container.select(".figureLayer"),
        fl2 = container.select(".figureLayer2"),
        fl3 = container.select(".figureLayer3"),
        fl4 = container.select(".figureLayer4"),
        al = container.select(".anotationLayer");

      fl3
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      fl4
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

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

      console.log(aqData.objects());
      console.log(data_links);

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

      const { nodes, links } = sankey({
        nodes: graph.nodes.map((d) => Object.assign({}, d)),
        links: graph.links.map((d) => Object.assign({}, d)),
      });

      const leftNodeList = [
        "firstnations",
        "racialminorities",
        "women",
        "children",
        "youngpeople",
        "unemployedorprecariouslyemployed",
        "peoplewithdisabilitiesorchronichealthconditions",
      ];

      const nodeGroup = fl4.selectAll("g").data(nodes, (d) => d.name || d[0]);

      if (lite) {
        nodeGroup.join(
          (enter) => enter,
          (update) =>
            update
              .select("text")
              .transition()
              .duration(750)
              .attr("opacity", 1)
              .text((d) => `${d.name}:${d.value}`),
          (exit) =>
            exit.select("text").transition().duration(200).attr("opacity", 0)
        );
      } else {
        nodeGroup.join(
          (enter) =>
            enter
              .append("g")
              .attr("class", (d) => `OEg key_${d.name}`)
              .call((enter) =>
                enter
                  .append("text")
                  .attr("opacity", 0)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", (d) =>
                    leftNodeList.includes(d.name) ? "start" : "end"
                  )
                  .style("fill", "white")
                  .attr("x", (d) =>
                    leftNodeList.includes(d.name) ? d.x0 + 30 : d.x1 - 30
                  )
                  .attr("y", (d) => (d.y1 + d.y0) / 2)
                  .text((d) => `${d.name}:${d.value}`)
              )
              .call((enter) =>
                enter
                  .select("text")
                  .transition()
                  .duration(750)
                  .attr("opacity", 1)
              ),
          (update) =>
            update.call((update) =>
              update
                .select("text")
                .transition()
                .duration(750)
                .attr("opacity", 1)
                .attr("y", (d) => (d.y1 + d.y0) / 2)
                .attr("x", (d) =>
                  leftNodeList.includes(d.name) ? d.x0 + 30 : d.x1 - 30
                )
                .attr("text-anchor", (d) =>
                  leftNodeList.includes(d.name) ? "start" : "end"
                )
                .text((d) => `${d.name}:${d.value}`)
            ),
          (exit) =>
            exit.call((exit) =>
              exit.select("text").transition().duration(200).attr("opacity", 0)
            )
          // .remove()
        );
      }
    });
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.dim = function (_) {
    if (!arguments.length) return dim;
    dim = _;
    return chart;
  };

  chart.dim_color = function (_) {
    if (!arguments.length) return dim_color;
    dim_color = _;
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

  chart.pad = function (_) {
    if (!arguments.length) return pad;
    pad = _;
    return chart;
  };

  chart.bin = function (_) {
    if (!arguments.length) return bin;
    bin = _;
    return chart;
  };

  chart.smooth = function (_) {
    if (!arguments.length) return smooth;
    smooth = _;
    return chart;
  };

  chart.lite = function (_) {
    if (!arguments.length) return lite;
    lite = _;
    return chart;
  };

  return chart;
}
