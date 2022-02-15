export default function UnitchartGridLayoutId() {
  // CANVAS SETUP
  let margin = {
      top: 0.1,
      right: 0,
      bottom: 0.1,
      left: 0,
    },
    color_domain,
    color_range,
    pad = 0.1,
    details = true,
    bin;

  function chart(selection) {
    selection.each(function (aqData) {
      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect();
      const { height, width } = continerRect;

      const innerWidth = width * (1 - margin.left - margin.right),
        innerHeight = height * (1 - margin.top - margin.bottom);

      const fl = container.select(".figureLayer"),
        al = container.select(".anotationLayer");

      fl.transition()
        .duration(750)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      const data = aqData.orderby("id").objects();

      const idArray = Array.from(new Set(data.map((d) => d.id)));

      const bin = Math.floor(Math.sqrt(idArray.length));

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

      const colorScale = d3
        .scaleOrdinal()
        .domain(color_domain)
        .range(color_range);

      const sizeValue = Math.min(xScale.bandwidth(), yScale.bandwidth());
      const shiftValue = Math.abs(yScale.bandwidth() - xScale.bandwidth()) / 2;

      const justedxValue = (d) =>
        xScale.bandwidth() > yScale.bandwidth()
          ? xScale(xValue(d)) + shiftValue
          : xScale(xValue(d));

      const justedyValue = (d) =>
        xScale.bandwidth() < yScale.bandwidth()
          ? yScale(yValue(d)) + shiftValue
          : yScale(yValue(d));

      // RENDER

      const rect = fl.selectAll("rect").data(data, (d) => d.id);

      rect.join(
        function (enter) {
          const rectEner = enter
            .append("rect")
            .attr("id", (d) => "rect" + d.id)
            .attr("stroke", "white")
            .attr("x", (d) => justedxValue(d))
            .attr("y", (d) => -2 * height)
            .attr("height", sizeValue)
            .attr("width", sizeValue);
          const rectEnterTransition = rectEner
            .transition()
            .duration(750)
            .style("opacity", 1)
            .attr("y", (d) => justedyValue(d));
          return rectEnterTransition;
        },
        function (update) {
          const rectUpdateTransition = update
            .transition()
            .duration(750)
            .delay((d, i) => d.id)
            .attr("height", sizeValue)
            .attr("width", sizeValue)
            .attr("x", (d) => justedxValue(d))
            .attr("y", (d) => justedyValue(d))
            .style("opacity", 1);

          return rectUpdateTransition;
        },
        function (exit) {
          const rectExitTransition = exit
            .transition()
            .duration(750)
            .attr("y", (d) => -2 * height)
            .remove();

          return rectExitTransition;
        }
      );

      fl.selectAll("foreignObject")
        .transition()
        .duration(750)
        .style("opacity", 0)
        .end()
        .then(fl.selectAll("foreignObject").remove().remove());

      al.transition()
        .duration(750)
        .style("opacity", 0)
        .end()
        .then(al.selectAll("*").remove());

      if (details && data.length == 1) {
        al.transition()
          .duration(750)
          .delay(750)
          .style("opacity", 1)
          .attr(
            "transform",
            `translate(${width * margin.left},${height * margin.top})`
          );

        const lableText = (text) =>
          text
            .replace("indigenous", '<span key="firstnations">indigenous</span>')
            .replace(
              "migrant",
              '<span key="migrantsandrefugees">migrant</span>'
            )
            .replace("women", '<span key="women">women</span>')
            .replace("domestic", '<span key="familyrelations">domestic</span>')
            .replace("violence", '<span key="violence">violence</span>');

        const istd = fl
          .selectAll("foreignObject")
          .data(data)
          .join("foreignObject")
          .attr("height", sizeValue)
          .attr("width", sizeValue)
          .attr("x", (d) => justedxValue(d))
          .attr("y", (d) => justedyValue(d))
          .style("opacity", 0)
          .append("xhtml:div")
          .attr("id", "in_svg_text_div")
          .html(
            (d) => `<strong>${d.heading}</strong><br><br>${lableText(d.text)}`
          );

        var keys = [
          "firstnations",
          "migrantsandrefugees",
          "women",
          "familyrelations",
          "violence",
        ];
        var size = 20;

        al.selectAll("rect")
          .data(keys)
          .join("rect")
          .attr("x", width * 0.75)
          .attr("y", (d, i) => height * 0.3 + i * (size + 5))
          .attr("width", size)
          .attr("height", size)
          .style("fill", (d) => colorScale(d));

        // Add one dot in the legend for each name.
        al.selectAll("text")
          .data(keys)
          .join("text")
          .attr("x", width * 0.75 + size * 1.2)
          .attr("y", (d, i) => height * 0.3 + i * (size + 5) + size / 2)
          .style("fill", "white")
          .text((d) => d)
          .attr("text-anchor", "left")
          .attr("dy", "0.25em");

        istd.selectAll("span").style("background-color", function () {
          return colorScale(d3.select(this).attr("key"));
        });

        fl.selectAll("foreignObject")
          .transition()
          .duration(750)
          .delay(750)
          .style("opacity", 1);
      }
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

  chart.details = function (_) {
    if (!arguments.length) return details;
    details = _;
    return chart;
  };

  return chart;
}
