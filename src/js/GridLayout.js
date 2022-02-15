export default function GridLayout() {
  // CANVAS SETUP
  let dim_x, dim_y, grid_columns, grid_gap;

  function chart(selection) {
    selection.each(function (aqData, i, g) {
      const data = aqData.objects();

      const gridColumns = grid_columns
        ? grid_columns
        : Math.round(Math.sqrt(aqData.size));

      const container = d3.select(this);

      container
        .style("grid-template-columns", `repeat(${gridColumns},1fr)`)
        .style("grid-template-rows", `repeat(${gridColumns},1fr)`)
        .style("grid-auto-columns", "1fr")
        .style("grid-auto-rows", "1fr")
        .style("grid-auto-flow", "column")
        .style("grid-gap", `5px`);

      const canvasDiv = container
        .selectAll("div")
        .data(data)
        .join("div")
        .attr("id", (d) => `subplot-${d.id}`)
        .style("border", "1px solid")
        .text((d) => d.id);
    });
  }

  chart.dim_x = function (_) {
    if (!arguments.length) return dim_x;
    dim_x = _;
    // if (typeof updateData === 'function') updateData();
    return chart;
  };

  chart.dim_y = function (_) {
    if (!arguments.length) return dim_y;
    dim_y = _;
    return chart;
  };

  chart.grid_columns = function (_) {
    if (!arguments.length) return grid_columns;
    grid_columns = _;
    return chart;
  };

  chart.grid_gap = function (_) {
    if (!arguments.length) return grid_gap;
    grid_gap = _;
    return chart;
  };

  return chart;
}
