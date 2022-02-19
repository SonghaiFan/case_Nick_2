export default function UnitchartGridLayoutKey() {
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
    lite = false;

  function chart(selection) {
    selection.each(function (aqData) {
      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect();
      const { height, width } = continerRect;

      const innerWidth = width * (1 - margin.left - margin.right),
        innerHeight = height * (1 - margin.top - margin.bottom);

      const fl1 = container.select(".figureLayer1");

      fl1
        .transition()
        .duration(1200)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      const data = aqData.orderby("id").objects();

      const idArray = Array.from(new Set(data.map((d) => d.id)));

      // const keyArray = Array.from(new Set(data.map((d) => d.key)));

      bin = bin || Math.floor(Math.sqrt(idArray.length));

      const xValue = (d) => idArray.indexOf(d.id) % bin;

      const yValue = (d) => Math.floor(idArray.indexOf(d.id) / bin);

      const xScale = d3
        .scaleBand()
        .domain(data.map(xValue))
        .range([0, innerWidth])
        .padding(pad);

      const yScale = d3
        .scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(pad);

      const sizeValue = Math.min(xScale.bandwidth(), yScale.bandwidth());
      const shiftValue = Math.abs(yScale.bandwidth() - xScale.bandwidth()) / 2;

      // RENDER

      let groupKey = "key";

      const data2 = aqData
        .groupby(groupKey)
        .orderby("id")
        .objects({ grouped: "entries" });

      const keyArray = Array.from(new Set(data2.map((d) => d[0])));

      const bin2 = Math.floor(Math.sqrt(keyArray.length));

      const xValue2 = (d) =>
        d[groupKey]
          ? keyArray.indexOf(d[groupKey]) % bin2
          : keyArray.indexOf(d[0]) % bin2;

      const yValue2 = (d) =>
        d[groupKey]
          ? Math.floor(keyArray.indexOf(d[groupKey]) / bin2)
          : Math.floor(keyArray.indexOf(d[0]) / bin2);

      const xScale2 = d3
        .scaleBand()
        .domain(data.map(xValue2))
        .range([0, sizeValue])
        .padding(0);

      const yScale2 = d3
        .scaleBand()
        .domain(data.map(yValue2))
        .range([0, sizeValue])
        .padding(0);

      const colorScale = d3
        .scaleOrdinal()
        .domain(color_domain)
        .range(color_range);

      const justedxValue2 = (d) =>
        xScale.bandwidth() > yScale.bandwidth()
          ? xScale(xValue(d)) + shiftValue + xScale2(xValue2(d))
          : xScale(xValue(d)) + xScale2(xValue2(d));

      const justedyValue2 = (d) =>
        xScale.bandwidth() < yScale.bandwidth()
          ? yScale(yValue(d)) + shiftValue + yScale2(yValue2(d))
          : yScale(yValue(d)) + yScale2(yValue2(d));

      // RENDER

      // const OEg = fl1
      //   .selectAll("g")
      //   .data(data2, (d) => d[0])
      //   .join("g")
      //   .attr("class", (d) => `OEg key_${d[0]}`);

      const OE = fl1.selectAll("rect").data(data, (d) => d.id + d.key);

      if (lite) {
        OE.join(
          function (enter) {
            let rectEner = enter
              .append("rect")
              .attr("class", (d, i) => `OErect id_${d.id}`)
              .attr("x", (d) => justedxValue2(d))
              .attr("y", (d) => justedyValue2(d))
              .attr("height", Math.min(25, yScale2.bandwidth()))
              .attr("width", Math.min(100, xScale2.bandwidth()))
              .style("opacity", 0)
              .attr("fill", (d) => colorScale(d[groupKey]));

            rectEner
              .transition()
              .duration(1200)
              .delay((d, i) => 1200 + d.id)
              .style("opacity", 1);

            return rectEner;
          },
          function (update) {
            return update
              .transition()
              .duration(1200)
              .delay((d, i) => d.id)
              .style("opacity", 1);
          },
          function (exit) {
            return exit.call((exit) =>
              exit.transition().duration(1200).style("opacity", 0)
            );
          }
        );
      } else {
        OE.join(
          function (enter) {
            let rectEner = enter
              .append("rect")
              .attr("class", (d, i) => `OErect id_${d.id}`)
              // .style("mix-blend-mode", "hard-light")
              .attr("x", (d) => justedxValue2(d))
              .attr("y", (d) => justedyValue2(d))
              .attr("height", Math.min(25, yScale2.bandwidth()))
              .attr("width", Math.min(100, xScale2.bandwidth()))
              .style("opacity", 0)
              .attr("fill", (d) => colorScale(d[groupKey]));

            rectEner
              .transition()
              .duration(1200)
              .delay((d, i) => 1200 + d.id)
              .style("opacity", 1);

            return rectEner;
          },
          function (update) {
            return update
              .transition()
              .duration(1200)
              .delay((d, i) => d.id)
              .attr("x", (d) => justedxValue2(d))
              .attr("y", (d) => justedyValue2(d))
              .attr("height", Math.min(25, yScale2.bandwidth()))
              .attr("width", Math.min(100, xScale2.bandwidth()))
              .style("opacity", 1)
              .attr("fill", (d) => colorScale(d[groupKey]));
          },
          function (exit) {
            return exit.call((exit) =>
              exit
                .transition()
                .duration(1200)
                .attr("y", (d) => -2 * height)
                .style("opacity", 0)
                .remove()
            );
          }
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

  chart.legend = function (_) {
    if (!arguments.length) return legend;
    legend = _;
    return chart;
  };

  chart.lite = function (_) {
    if (!arguments.length) return lite;
    lite = _;
    return chart;
  };

  return chart;
}
