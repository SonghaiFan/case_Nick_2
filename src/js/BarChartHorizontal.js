export default function BarChartHorizontal() {
  // CANVAS SETUP
  let margin = {
      top: 0.1,
      right: 0.1,
      bottom: 0.1,
      left: 0.1,
    },
    dim_x,
    dim_color,
    dim,
    measure_y,
    x_domain,
    color_domain,
    y_domain,
    pad = 0.4,
    smooth = true;

  function chart(selection) {
    selection.each(function (aqData) {
      // Throw erro if the required configuration is not defined
      if (!dim_x) throw new Error('"dim_x" must be defined.');
      if (!measure_y) throw new Error('measure_y" must be defined.');

      dim_color = dim_color ? dim_color : dim_x;
      dim = dim ? dim : dim_x;

      console.log(dim_x, dim_color, dim);

      const aqDataU = aqData.derive({
        dim_x: `d['${dim_x}']`,
        dim_color: `d['${dim_color}']`,
        measure_y: `d['${measure_y}']`,
        dim: `d['${dim}']`,
      });

      // data is array object

      const data = aqDataU.objects();

      console.log(data);

      // initial rendering

      const container = d3.select(this);

      const continerRect = container.node().getBoundingClientRect();
      const { height, width } = continerRect;

      const innerWidth = width * (1 - margin.left - margin.right),
        innerHeight = height * (1 - margin.top - margin.bottom);

      const fl = container.select(".figureLayer"),
        fl1 = container.select(".figureLayer1"),
        al = container.select(".anotationLayer"),
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

      const xScale = d3
        .scaleBand()
        .domain(x_domain || aqDataU.array("dim_x"))
        .range([0, innerWidth])
        .padding(pad);

      const yScale = d3
        .scaleLinear()
        .domain(y_domain || [0, d3.max(aqDataU.array("measure_y"))])
        .range([innerHeight, 0]);

      const colorScale = d3
        .scaleOrdinal()
        .domain(aqDataU.array("dim_color"))
        .range(["rgb(252, 219, 57)", "rgb(3, 185, 118)", "rgb(250, 195, 211)"]);

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

      const xValue = (d) => xScale(d.dim_x);

      const yValue = (d) => yScale(d.measure_y);
      const colorValue = (d) => colorScale(d.dim_color);

      //   const keyOE = (d) =>
      //     [...new Set([d.dim, d.dim_x, d.dim_color])]
      //       .sort()
      //       .map((d) => d)
      //       .join(" ");

      const OE = fl1
        .selectAll("rect")
        .data(data, (d) => (d.id ? d.id + d.key : d.publisher + d.key));

      const size = 10;

      OE.join(
        function (enter) {
          const rectEner = enter
            .append("rect")
            .attr("class", (d) => (d.id ? d.id + d.key : d.publisher + d.key))
            .attr("fill", (d) => colorValue(d))
            .attr(
              "x",
              (d, i) =>
                xValue(d) + size / 2 + (i / data.length) * xScale.bandwidth()
            )
            .attr("y", (d) => yValue(d) - size / 2)
            .style("opacity", 0);

          const rectEnterTransition = rectEner
            .transition()
            .duration(smooth ? 1500 : 0)
            .delay((d, i) => d.id)
            .style("opacity", 0.2)
            .attr("width", size)
            .attr("height", size)
            .attr("rx", (d) => size);

          return rectEnterTransition;
        },
        function (update) {
          const rectUpdateTransition = update
            .transition()
            .duration(1500)
            .attr("fill", (d) => colorValue(d))
            .style("opacity", 1)
            .attr("stroke-width", 0)
            .style("opacity", 0.2)
            .attr("width", size)
            .attr("height", size)
            .attr(
              "x",
              (d, i) =>
                xValue(d) + size / 2 + (i / data.length) * xScale.bandwidth()
            )
            .attr("y", (d) => yValue(d) - size / 2)
            .attr("rx", (d) => size);

          return rectUpdateTransition;
        },
        function (exit) {
          const rectExitTransition = exit
            .transition()
            .duration(smooth ? 500 : 0)
            .style("opacity", 0)
            .remove();

          return rectExitTransition;
        }
      );
    });
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.dim_x = function (_) {
    if (!arguments.length) return dim_x;
    dim_x = _;
    return chart;
  };

  chart.x_domain = function (_) {
    if (!arguments.length) return x_domain;
    x_domain = _;
    return chart;
  };

  chart.measure_y = function (_) {
    if (!arguments.length) return measure_y;
    measure_y = _;
    return chart;
  };

  chart.y_domain = function (_) {
    if (!arguments.length) return y_domain;
    y_domain = _;
    return chart;
  };

  chart.dim_color = function (_) {
    if (!arguments.length) return dim_color;
    dim_color = _;
    return chart;
  };

  chart.dim = function (_) {
    if (!arguments.length) return dim;
    dim = _;
    return chart;
  };

  chart.color_domain = function (_) {
    if (!arguments.length) return color_domain;
    color_domain = _;
    return chart;
  };

  chart.pad = function (_) {
    if (!arguments.length) return pad;
    pad = _;
    return chart;
  };

  chart.smooth = function (_) {
    if (!arguments.length) return smooth;
    smooth = _;
    return chart;
  };

  return chart;
}
