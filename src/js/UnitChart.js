export default function UnitChart() {
  // CANVAS SETUP
  let margin = {
      top: 10,
      right: 0,
      bottom: 10,
      left: 0,
    },
    dim_color,
    color_domain,
    color_range,
    pad = 0.1,
    bin,
    details = false;

  function chart(selection) {
    selection.each(function (aqData, i, g) {
      bin = Math.round(Math.sqrt(aqData.size));

      const table = aqData
        .params({ bin: bin })
        .derive({ g_id: (d) => op.row_number() - 1 })
        .derive({
          g_x_id: (d) => d.g_id % bin,
          g_y_id: (d) => op.floor(d.g_id / bin),
        });

      const data = table.objects();
      // console.log(data);

      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect(),
        height = continerRect.height,
        width = continerRect.width;

      const innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

      const fl = container.select(".figureLayer"),
        al = container.select(".anotationLayer");

      fl.transition()
        .duration(750)
        .style("opacity", 1)
        .attr("transform", `translate(${margin.left},${margin.top})`);

      al.transition()
        .duration(750)
        .style("opacity", 1)
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(table.array("g_x_id"))
        .range([0, innerWidth])
        .padding(pad);

      const yScale = d3
        .scaleBand()
        .domain(table.array("g_y_id"))
        .range([0, innerHeight])
        .padding(pad);

      const colorScale = d3
        .scaleOrdinal()
        .domain(color_domain || dim_color)
        .range(color_range || d3.schemeTableau10);

      const xValue = (d) =>
        xScale.bandwidth() > yScale.bandwidth()
          ? xScale(d.g_x_id) + (xScale.bandwidth() - yScale.bandwidth()) / 2
          : xScale(d.g_x_id);
      const yValue = (d) =>
        yScale.bandwidth() > xScale.bandwidth()
          ? yScale(d.g_y_id) - (xScale.bandwidth() - yScale.bandwidth()) / 2
          : yScale(d.g_y_id);
      const colorValue = (d) => d[dim_color];

      const sizeValue = Math.min(xScale.bandwidth(), yScale.bandwidth());

      const OE = fl.selectAll("rect").data(data, (d) => d.id);

      let promiseQueue = [];

      OE.join(
        function (enter) {
          const rectEner = enter
            .append("rect")
            .attr("id", (d) => `article_rect_${d.id}`)
            .attr("stroke", dim_color || "white")
            .style("mix-blend-mode", "multiply")
            .attr("fill", (d) => (dim_color ? colorScale(colorValue(d)) : null))
            .attr("x", (d) => xValue(d))
            .attr("y", (d) => -2 * height)
            .attr("width", sizeValue);

          const rectEnterTransition = rectEner
            .transition()
            .duration(750)
            .style("opacity", 1)
            .attr("y", (d) => yValue(d))
            .attr("height", sizeValue);

          promiseQueue.push(rectEnterTransition.end());

          return rectEnterTransition;
        },
        function (update) {
          const rectUpdateTransition = update
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .delay((d, i) => i)
            .attr("height", sizeValue)
            .attr("width", sizeValue)
            .attr("x", (d) => xValue(d))
            .attr("y", (d) => yValue(d));
          promiseQueue.push(rectUpdateTransition.end());

          return rectUpdateTransition;
        },
        function (exit) {
          const rectExitTransition = exit
            .transition()
            .duration(750)
            .ease(d3.easeExp)
            .attr("y", (d) => -height)
            .remove();
          promiseQueue.push(rectExitTransition.end());
          return rectExitTransition;
        }
      );

      fl.selectAll("foreignObject").transition().style("opacity", 0).remove();

      function showDetails() {
        console.log("show details");
        const lableText = (text) =>
          text
            .replace(
              /indigenous/g,
              '<span key="firstnations">indigenous</span>'
            )
            .replace(
              /migrant/g,
              '<span key="migrantsandrefugees">migrant</span>'
            )
            .replace(/women/g, '<span key="women">women</span>')
            .replace(/domestic/g, '<span key="familyrelations">domestic</span>')
            .replace(/violence/g, '<span key="violence">violence</span>');

        const istd = fl
          .selectAll("foreignObject")
          .data(data, (d) => d.id)
          .join("foreignObject")
          .attr("height", sizeValue)
          .attr("width", sizeValue)
          .attr("x", (d) => xValue(d))
          .attr("y", (d) => yValue(d))
          .append("xhtml:div")
          .attr("id", "in_svg_text_div")
          .style("opacity", 0)
          .html(
            (d) =>
              `<g><strong>${d.heading}</strong><br><br>${lableText(d.text)}</g>`
          );

        istd.transition().style("opacity", 1);

        istd.selectAll("span").style("background-color", function () {
          return colorScale(d3.select(this).attr("key"));
        });

        const keys = [
          "firstnations",
          "migrantsandrefugees",
          "women",
          "familyrelations",
          "violence",
        ];

        const size = 20;

        al.selectAll("rect")
          .data(keys)
          .enter()
          .append("rect")
          .attr("x", width * 0.8)
          .attr("y", (d, i) => height * 0.3 + i * (size + 5))
          .attr("width", size)
          .attr("height", size)
          .style("fill", function (d) {
            return colorScale(d);
          });

        // Add one dot in the legend for each name.
        al.selectAll("text")
          .data(keys)
          .enter()
          .append("text")
          .attr("x", width * 0.8 + size * 1.2)
          .attr("y", (d, i) => height * 0.3 + i * (size + 5) + size / 2)
          .style("fill", "white")
          .text(function (d) {
            return d;
          })
          .attr("text-anchor", "left")
          .attr("dy", "0.25em");
      }

      if (details) {
        Promise.all(promiseQueue).then(showDetails);
      }
    });
  }

  chart.aqDatum = function (_) {
    if (!arguments.length) return originDatum;
    originDatum = _;
    // if (typeof updateData === 'function') updateData();
    return chart;
  };

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

  chart.details = function (_) {
    if (!arguments.length) return details;
    details = _;
    return chart;
  };

  return chart;
}
