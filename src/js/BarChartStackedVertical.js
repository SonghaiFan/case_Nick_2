export default function BarChartStackedVertical() {
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

      const fl1 = container.select(".figureLayer1"),
        xl = container.select(".xAxisLayer"),
        yl = container.select(".yAxisLayer");

      fl1
        .transition()
        .duration(1200)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      const groupKey = "key";

      // const data = aqData
      //   .groupby(groupKey)
      //   .rollup({ value_sum: (d) => op.sum(d.value) })
      //   .orderby("value_sum")
      //   .objects();

      const data = aqData
        .groupby(groupKey)
        .derive({ value_sum: (d) => op.sum(d.value) })
        .derive({ value_stackmax: aq.rolling((d) => op.sum(d.value)) })
        .derive({ value_stackmin: (d) => op.lag(d.value_stackmax, 1, 0) })
        .orderby("value_sum")
        // .objects({ grouped: "entries" });
        .objects();

      const keyArray = Array.from(new Set(data.map((d) => d[groupKey])));

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
        .duration(1200)
        .style("opacity", 1)
        .call(d3.axisBottom(xScale))
        .attr(
          "transform",
          `translate(${width * margin.left},${height * (1 - margin.top)})`
        );

      yl.transition()
        .duration(1200)
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

      // const OEg = fl1
      //   .selectAll("g")
      //   .data(data2, (d) => d[0])
      //   .join("g")
      //   .attr("class", (d) => `OEg key_${d[0]}`);

      // const OE = OEg.selectAll("rect").data(
      //   (d) => d[1],
      //   (d) => d.id + d.key
      // );

      const OE = fl1.selectAll("rect").data(data, (d) => d.id + d.key);

      OE.join(
        function (enter) {
          const rectEner = enter
            .append("rect")
            .attr("class", (d, i) => `OErect id_${d.id}`)
            .attr("y", (d) => yScale(d[groupKey]))
            .attr("height", yScale.bandwidth())
            .style("opacity", 0)
            .attr("fill", (d) => colorScale(d[groupKey]));

          rectEner
            .transition()
            .duration(smooth ? 1200 : 0)
            .delay(smooth ? 1200 : 0)
            .attr("x", (d) => xScale(d.value_stackmin))
            .attr("width", (d) => xScale(d.value_stackmax - d.value_stackmin))
            .style("opacity", 1);

          return rectEner;
        },
        function (update) {
          return update
            .style("opacity", 1)
            .transition()
            .duration(1200)
            .delay(
              (d, i) =>
                (keyArray.length - keyArray.indexOf(d[groupKey])) * 50 + i * 1
            )
            .attr("y", (d) => yScale(d[groupKey]))
            .attr("height", yScale.bandwidth())
            .transition()
            .attr("x", (d) => xScale(d.value_stackmin))
            .attr("width", (d) => xScale(d.value_stackmax - d.value_stackmin))
            .attr("fill", (d) => colorScale(d[groupKey]));
        },
        function (exit) {
          return exit.call((exit) =>
            exit.transition().duration(1200).style("opacity", 0).remove()
          );
        }
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
