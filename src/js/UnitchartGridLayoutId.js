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
    bin,
    lite = false;

  function chart(selection) {
    selection.each(function (aqData) {
      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect();
      const { height, width } = continerRect;

      const innerWidth = width * (1 - margin.left - margin.right),
        innerHeight = height * (1 - margin.top - margin.bottom);

      const fl = container.select(".figureLayer");

      const tooltip = d3.select("#tooltipContainer");

      fl.transition()
        .duration(1200)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${width * margin.left},${height * margin.top})`
        );

      const data = aqData.orderby("id").objects();

      const idArray = Array.from(new Set(data.map((d) => d.id)));

      bin = Math.floor(Math.sqrt(idArray.length));

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

      const rect = fl
        .selectAll("rect")
        .data(data, (d) => (d.id ? d.id : d.dim));

      if (lite) {
        rect.join(
          function (enter) {
            return enter;
          },
          function (update) {
            const rectUpdateTransition = update
              .transition()
              .duration(1200)
              .delay((d) => d.id)
              .style("opacity", 1);

            return rectUpdateTransition;
          },
          function (exit) {
            const rectExitTransition = exit
              .transition()
              .duration(1200)
              .style("opacity", 0);

            return rectExitTransition;
          }
        );
      } else {
        rect.join(
          function (enter) {
            const rectEner = enter
              .append("rect")
              .attr("id", (d) => "rect" + d.id)
              .attr("stroke", "white")
              .attr("stroke-width", 1)
              .attr("fill", "rgb(255, 250, 240)")
              .attr("x", (d) => justedxValue(d))
              // .attr("y", (d) => -2 * height)
              .attr("y", (d) => justedyValue(d))
              .attr("height", sizeValue)
              .attr("width", sizeValue)
              .style("opacity", 0);
            const rectEnterTransition = rectEner
              .transition()
              .duration(1200)
              .style("opacity", 1);
            return rectEnterTransition;
          },
          function (update) {
            const rectUpdateTransition = update
              .transition()
              .duration(details ? 1500 : 1200)
              .delay((d, i) => d.id)
              .attr("height", sizeValue)
              .attr("width", sizeValue)
              .attr("fill", "rgb(255, 250, 240)")
              .attr("x", (d) => justedxValue(d))
              .attr("y", (d) => justedyValue(d))
              .style("opacity", 1);

            return rectUpdateTransition;
          },
          function (exit) {
            const rectExitTransition = exit
              .transition()
              .duration(1200)
              .style("opacity", 0)
              // .attr("y", (d) => -2 * height)
              .remove();

            return rectExitTransition;
          }
        );
      }

      if (details) {
        const lableText = (text) =>
          text
            .replace(
              /indigenous/i,
              '<span key="firstnations">indigenous</span>'
            )
            .replace(
              /migrant/i,
              '<span key="migrantsandrefugees">migrant</span>'
            )
            .replace(/women/i, '<span key="women">women</span>')
            .replace(/domestic/i, '<span key="familyrelations">domestic</span>')
            .replace(/familay/i, '<span key="familyrelations">domestic</span>')
            .replace(/equality/i, '<span key="inequality">equality</span>')
            .replace(/violence/i, '<span key="violence">violence</span>');

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
          .attr("class", "in_svg_text_div")
          .style("padding-top", "1em")
          .style("font-size", `${sizeValue / 25}px`)
          .html(
            (d) =>
              `<strong style=" font-size: 2em">${d.publisher}:${lableText(
                d.heading
              )}</strong><br><br>${lableText(d.text)}`
          );

        istd.selectAll("span").style("background-color", function () {
          return colorScale(d3.select(this).attr("key"));
        });

        fl.selectAll("foreignObject")
          .transition()
          .duration(750)
          .delay(750)
          .style("opacity", 1);
      }

      if (!details) {
        fl.selectAll("foreignObject")
          .transition()
          .duration(1200)
          .style("opacity", 0)
          .end()
          .then(fl.selectAll("foreignObject").remove());
        const rects = fl.selectAll("rect");

        rects
          .on("mouseover", (e, d) => {
            if (d.heading) {
              tooltip
                .style("display", "block")
                .html(() => `${d.publisher}<br><b>${d.heading}</b>`);
            }
          })
          .on("mousemove", (e, d) => {
            tooltip
              .style("left", d3.pointer(e)[0] + "px")
              .style("top", d3.pointer(e)[1] + "px");
          })
          .on("mouseout", () => {
            tooltip.style("display", "none");
          })
          .on("click", function (e, d) {
            let stroke_status = d3.select(this).attr("stroke");
            let stroke_width = d3.select(this).attr("stroke-width");
            d3.select(this)
              // .attr("stroke", stroke_status == "white" ? "red" : "white")
              .attr("stroke-width", stroke_width == 1 ? 3 : 1);
          });
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

  // chart.bin = function (_) {
  //   if (!arguments.length) return bin;
  //   bin = _;
  //   return chart;
  // };

  chart.details = function (_) {
    if (!arguments.length) return details;
    details = _;
    return chart;
  };

  chart.lite = function (_) {
    if (!arguments.length) return lite;
    lite = _;
    return chart;
  };

  return chart;
}
