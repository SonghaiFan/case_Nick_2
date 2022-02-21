export default function SankeyChart() {
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
    smooth = false;

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
        .duration(1200)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      fl4
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

      links.forEach((link) => {
        link.path = link.source.name + "_" + link.target.name;
      });

      const linksByPath = new Map();

      for (const link of links) {
        if (!linksByPath.has(link.path)) {
          linksByPath.set(link.path, [link]);
        } else {
          linksByPath.get(link.path).push(link);
        }
      }

      const linksByPathGroupArray = Array.from(linksByPath.entries());

      const leftNodeList = [
        "firstnations",
        "racialminorities",
        "women",
        "children",
        "youngpeople",
        "unemployedorprecariouslyemployed",
        "peoplewithdisabilitiesorchronichealthconditions",
      ];

      console.log(linksByPath);

      const nodeGroup = fl4.selectAll("g").data(nodes, (d) => d.name);

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
                .duration(1200)
                .attr("opacity", 1)
            ),
        (update) =>
          update.call((update) =>
            update
              .select("text")
              .transition()
              .duration(1200)
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
          exit
            .call((exit) =>
              exit.select("text").transition().duration(200).attr("opacity", 0)
            )
            .remove()
      );

      const linksGroups = fl3
        .selectAll("g")
        .data(linksByPathGroupArray, (d) => d[0])
        .join("g")
        .attr("class", (d) => `linksGroup ${d[0]}`)
        .on("mouseover", function (e, d) {
          let overKeyGroup = d[0];

          let group = overKeyGroup.split("_")[0];
          let issue = overKeyGroup.split("_")[1];

          let articleInGroup = linksByPath.get(overKeyGroup);
          console.log(articleInGroup.length);

          al.selectAll("text")
            .data([null])
            .join("text")
            .attr("x", 850)
            .attr("y", 75)
            .style("fill", "white")
            .text(
              (d) =>
                `"${group}" is metioned with "${issue}" ${articleInGroup.length} times`
            );
        })
        .on("mouseout", function (e, d) {
          al.selectAll("*").remove();
        });

      const linkGroup = linksGroups.selectAll("path").data(
        (d) => d[1],
        (d) => d.id
      );

      linkGroup.join(
        (enter) =>
          enter
            .append("path")
            .attr("class", (d) => `linkGroup article${d.id}`)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-dasharray", (d, i, n) => n[i].getTotalLength() * 2)
            .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
            .call((enter) =>
              enter
                .transition()
                .duration(1200)
                .attr("stroke-width", (d) => Math.max(1, d.width))
                .transition()
                .duration(1200)
                .attr("stroke-dashoffset", 0)
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(1200)
              .attr("d", d3.sankeyLinkHorizontal())
              .attr("stroke-dasharray", (d, i, n) => n[i].getTotalLength() * 2)
              .attr("stroke-width", (d) => Math.max(1, d.width))
              .attr("stroke-dashoffset", 0)
          ),
        (exit) =>
          exit.call((exit) =>
            exit
              .transition()
              .duration(500)
              .attr("d", d3.sankeyLinkHorizontal())
              .attr("stroke-width", 0)
              .remove()
          )
      );

      const link = fl3.selectAll("path");

      link
        .on("mouseover", function (e, d) {
          let overedLink = d3.select(this);
          overedLink.attr("stroke-width", (d) => Math.max(5, d.width)).raise();

          let overedRectId = overedLink
            .attr("class")
            .split(" ")[1]
            .replace("article", "rect");

          let overedLinkGroup = d3.select(this.parentNode);
          let overedPath = overedLinkGroup.attr("class").split(" ")[1];

          let articleInPath = linksByPath.get(overedPath);

          fl.selectAll("rect").attr("fill", "black");

          articleInPath.forEach(function (i) {
            let articleRect = fl.select(`#rect${i.id}`);
            articleRect.attr("fill", "rgb(235, 224, 208)");
          });

          fl.select(`#${overedRectId}`).attr("fill", "white");
        })
        .on("mouseout", function (e, d) {
          d3.select(this).attr("stroke-width", d.width);
          fl.selectAll("rect").attr("fill", "rgb(235, 224, 208)");
        });

      const node = fl2.selectAll("rect");

      node
        .on("mouseover", function (e, d) {
          let articleInNode = d.sourceLinks.length
            ? d.sourceLinks
            : d.targetLinks;

          let key = d.name;

          console.log(articleInNode);

          articleInNode.forEach(function (i) {
            let articleRect = fl.select(`#rect${i.id}`);
            articleRect.attr("fill", colorScale(key));
          });
        })
        .on("mouseout", function (e, d) {
          fl.selectAll("rect").attr("fill", "rgb(235, 224, 208)");
        });

      const rects = fl.selectAll("rect").raise();

      rects
        .on("mouseover", function (e, d) {
          rects.attr("fill", "rgb(235, 224, 208)");
          let overedRect = d3.select(this);
          overedRect.attr("fill", "white");

          let overedRectId = overedRect.attr("id").replace("rect", "article");
          // console.log(overedRectId);
          d3.selectAll(`.linkGroup.${overedRectId}`)
            .attr("stroke", "white")
            .attr("stroke-width", (d) => Math.max(5, d.width))
            .raise();
        })
        .on("mouseout", function () {
          rects.attr("fill", "rgb(235, 224, 208)");
          d3.selectAll(".linkGroup")
            .attr("stroke", "gray")
            .attr("stroke-width", (d) => Math.max(1, d.width));
        });
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

  return chart;
}
