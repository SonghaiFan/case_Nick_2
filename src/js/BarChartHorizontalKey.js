export default function BarChartHorizontalKey() {
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
    smooth = true,
    stack = true;

  function chart(selection) {
    selection.each(function (aqData) {
      // Throw erro if the required configuration is not defined
      if (!dim_x) throw new Error('"dim_x" must be defined.');
      if (!measure_y) throw new Error('measure_y" must be defined.');

      dim_color = dim_color ? dim_color : dim_x;
      dim = dim ? dim : dim_x;

      console.log(dim_x, dim_color, dim);

      const aqDataS = aqData
        .derive({
          dim_x: `d['${dim_x}']`,
          dim_color: `d['${dim_color}']`,
          measure_y: `d['${measure_y}']`,
          dim: `d['${dim}']`,
        })
        .groupby(["dim_x", "dim_color", "dim"])
        .rollup({ measure_y: (d) => op.sum(d.measure_y) })
        .groupby("dim_x")
        .orderby(["dim_x", "dim_color", "dim"])
        .derive({ sum_measure_y: (d) => op.sum(d.measure_y) })
        .derive({
          mean_measure_y: (d) => d.sum_measure_y / op.max(d.sum_measure_y),
        })
        .derive({ sum_measure_y1: aq.rolling((d) => op.sum(d.measure_y)) })
        .derive({ sum_measure_y0: (d) => op.lag(d.sum_measure_y1, 1, 0) })
        .derive({ gid: (d) => op.row_number() })
        .ungroup()
        .unorder()
        .derive({
          mean_measure_y: (d) =>
            (d.sum_measure_y / op.max(d.sum_measure_y)) * 0.575814536340852,
        })
        .derive({
          mean_measure_y1: (d) =>
            (d.sum_measure_y1 / op.max(d.sum_measure_y)) * 0.575814536340852,
        })
        .derive({
          mean_measure_y0: (d) =>
            (d.sum_measure_y0 / op.max(d.sum_measure_y)) * 0.575814536340852,
        });

      // data is array object

      const data = aqDataS.objects();

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
        .domain(x_domain || aqDataS.array("dim_x"))
        .range([0, innerWidth])
        .padding(pad);

      const yScale = d3
        .scaleLinear()
        .domain(
          y_domain || stack
            ? [0, d3.max(aqDataS.array("mean_measure_y"))]
            : [0, d3.max(aqDataS.array("measure_y"))]
        )
        .range([innerHeight, 0]);

      const colorScale = d3
        .scaleOrdinal()
        .domain(aqDataS.array("dim_color"))
        .range(["rgb(252, 219, 57)", "rgb(3, 185, 118)", "rgb(250, 195, 211)"]);

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

      const xValue = (d) => xScale(d.dim_x);
      const heightValue = (d) =>
        stack
          ? innerHeight - yScale(d.mean_measure_y1 - d.mean_measure_y0)
          : innerHeight - yScale(d.measure_y);
      const yValue = (d) =>
        stack ? yScale(d.mean_measure_y1) : yScale(d.measure_y);
      const colorValue = (d) => colorScale(d.dim_color);

      const keyOE = (d) =>
        [...new Set([d.dim, d.dim_x, d.dim_color])]
          .sort()
          .map((d) => d)
          .join(" ");

      const OE = fl1.selectAll("rect").data(data, (d) => keyOE(d));

      if (stack) {
        OE.join(
          function (enter) {
            const rectEner = enter
              .append("rect")
              .attr("class", (d) => keyOE(d))
              .attr("fill", (d) => colorValue(d))
              .style("opacity", 0)
              .attr("y", innerHeight)
              .attr("height", 0)
              .attr("x", (d) => xValue(d))
              .attr("width", xScale.bandwidth());

            const rectEnterTransition = rectEner
              .transition()
              .duration(smooth ? 1500 : 0)
              .style("opacity", 1)
              .attr("y", (d) => yValue(d))
              .attr("height", (d) => heightValue(d));

            return rectEnterTransition;
          },
          function (update) {
            const rectUpdateTransition = update
              .transition()
              .duration(750)
              .style("opacity", 1)
              .attr("stroke-width", 0)
              .attr("fill", (d) => colorValue(d))
              .attr("rx", 0)
              .transition()
              .delay((d, i) => i)
              .attr("y", (d) => yValue(d))
              .attr("height", (d) => heightValue(d))
              .transition()
              .duration(750)
              .attr("width", xScale.bandwidth())
              .attr("x", (d) => xValue(d));

            return rectUpdateTransition;
          },
          function (exit) {
            const rectExitTransition = exit
              .transition()
              .duration(smooth ? 500 : 0)
              .attr("height", 0)
              .attr("y", innerHeight)
              .style("opacity", 0)
              .remove();

            return rectExitTransition;
          }
        );
      } else {
        OE.join(
          function (enter) {
            const rectEner = enter
              .append("rect")
              .attr("class", (d) => keyOE(d))
              .attr("fill", (d) => colorValue(d))
              .style("opacity", 0)
              .attr("y", innerHeight)
              .attr("height", 0)
              .attr(
                "x",
                (d) => xValue(d) + ((d.gid - 1) * xScale.bandwidth()) / 3
              )
              .attr("width", xScale.bandwidth() / 3);

            const rectEnterTransition = rectEner
              .transition()
              .duration(smooth ? 1500 : 0)
              .style("opacity", 1)
              .attr("y", (d) => yValue(d))
              .attr("height", (d) => heightValue(d));

            return rectEnterTransition;
          },
          function (update) {
            const rectUpdateTransition = update
              .transition()
              .duration(500)
              .style("opacity", 1)
              .attr("stroke-width", 0)
              .attr("fill", (d) => colorValue(d))
              .transition()
              .delay((d, i) => i)
              .attr("width", xScale.bandwidth() / 3)
              .attr(
                "x",
                (d) => xValue(d) + ((d.gid - 1) * xScale.bandwidth()) / 3
              )
              .transition()
              .duration(500)
              .attr("y", (d) => yValue(d))
              .attr("height", (d) => heightValue(d));

            return rectUpdateTransition;
          },
          function (exit) {
            const rectExitTransition = exit
              .transition()
              .duration(smooth ? 500 : 0)
              .attr("height", 0)
              .attr("y", innerHeight)
              .style("opacity", 0)
              .remove();

            return rectExitTransition;
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

  chart.stack = function (_) {
    if (!arguments.length) return stack;
    stack = _;
    return chart;
  };

  return chart;
}
