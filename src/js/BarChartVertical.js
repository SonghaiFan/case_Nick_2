export default function BarChartVertical() {
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
        al = container.select(".anotationLayer"),
        xl = container.select(".xAxisLayer"),
        yl = container.select(".yAxisLayer");

      al.transition().duration(750).style("opacity", 1);

      fl2
        .transition()
        .duration(smooth ? 750 : 0)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      const groupKey = "key";

      const aqDataSum = aqData
        .groupby(groupKey)
        .rollup({ value_sum: (d) => op.sum(d.value) })
        .orderby("value_sum");

      const aqDatAgg = aqData.groupby(groupKey).rollup({
        count: (d) => op.count(),
        ids: (d) => op.array_agg(d.id),
      });

      const data = aqDataSum.objects();

      const data2 = aqDataSum.groupby(groupKey).objects({ grouped: "entries" });

      const dataMap = aqDatAgg.groupby(groupKey).objects({ grouped: "map" });

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value_sum)])
        .range([0, innerWidth])
        .nice();

      console.log(xScale.domain());

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d[groupKey]))
        .range([innerHeight, 0])
        .padding(0.2);

      const colorScale = d3
        .scaleOrdinal()
        .domain(color_domain)
        .range(color_range);

      xl.transition()
        .duration(750)
        .style("opacity", 1)
        .call(d3.axisBottom(xScale))
        .attr(
          "transform",
          `translate(${width * margin.left},${height * (1 - margin.top)})`
        );

      yl.transition()
        .duration(750)
        .style("opacity", 1)
        .call(d3.axisLeft(yScale))
        .call(function (g) {
          g.selectAll("text").style("text-anchor", "end");
          return g;
        })
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      // RENDER

      console.log(data2);

      const idArray = [...new Set(aqData.array("id"))];

      const OEg = fl2
        .selectAll("g")
        .data(data2, (d) => d[0] || d.name)
        .join("g")
        .attr("class", (d) => `OEg key_${d[0]}`)
        .on("mouseover", function (e, d) {
          let overKeyGroup = d[0];

          let articleInGroup = dataMap.get(overKeyGroup)[0].ids;
          console.log(articleInGroup);

          fl.selectAll("rect").attr("fill", "black");

          articleInGroup.forEach(function (i) {
            let articleRect = fl.select(`#rect${i}`);
            articleRect.attr("fill", colorScale(overKeyGroup));
          });

          let percentage = (articleInGroup.length / idArray.length) * 100;

          al.selectAll("text")
            .data([null])
            .join("text")
            .attr("x", 150)
            .attr("y", 75)
            .style("fill", "white")
            .text(
              (d) =>
                `Code "${overKeyGroup}" included in ${
                  articleInGroup.length
                } articles(${parseFloat(percentage).toFixed(2)}%)`
            );
        })
        .on("mouseout", function (e, d) {
          fl.selectAll("rect").attr("fill", "black");
        });

      const OE = OEg.selectAll("rect").data((d) => d[1]);

      OE.join(
        (enter) =>
          enter
            .append("rect")
            .attr("id", (d) => d[groupKey])
            .attr("fill", (d) => colorScale(d[groupKey]))
            .attr("x", (d) => xScale(0))
            .attr("y", (d) => yScale(d[groupKey]))
            .attr("height", yScale.bandwidth())
            .call((enter) =>
              enter

                .transition()
                .duration(smooth ? 750 : 0)
                .attr("width", (d) => xScale(d.value_sum) - xScale(0))
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(750)
              .attr("fill", (d) => colorScale(d[groupKey]))
              .attr("y", (d) => yScale(d[groupKey]))
              .attr("height", yScale.bandwidth())
              // .transition()
              // .duration(750)
              .attr("x", (d) => xScale(0))
              .attr("width", (d) => xScale(d.value_sum) - xScale(0))
          ),
        (exit) =>
          exit.call((exit) =>
            exit
              .transition()
              .duration(750)
              .attr("height", 0)
              .attr("y", height)
              .remove()
          )
      );
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
