import UnitChart from "./UnitChart.js";
import { HorizontalBarchart } from "./Barchart.js";

const figures = d3.selectAll("figure");
const fig1 = d3.select("#fig1");
const fig2 = d3.select("#fig2");
const fig3 = d3.select("#fig3");
const steps = d3.selectAll(".step");
const chapters = d3.selectAll(".chapter");
const navbar = d3.select("#navbar");

// initialize the scrollama
const scroller = scrollama();

// load the data

// const aqData = await aq.loadCSV("src/data/demo.csv");
const aqData = await aq.loadCSV("src/data/article_data.csv");

console.log(aqData);

// preparation for rendering

const UnitChartInstance1 = UnitChart();

// const HorizontalBarchart_1 = HorizontalBarchart()
//   .dim_color("country")
//   .measure_y("sales")
//   .color_domain(aqData.array("country"));

function stepTrigger(index) {
  switch (index) {
    case 0:
      break;
    case 1:
      fig1.datum(aqData.slice(0, 0)).call(UnitChartInstance1);
      break;
    case 2:
      fig1.datum(aqData.slice(0, 1)).call(UnitChartInstance1);
      break;
    case 3:
      fig1.datum(aqData.slice(0, 8)).call(UnitChartInstance1);
      break;
    case 4:
      fig1.datum(aqData.sample(12)).call(UnitChartInstance1);
      break;
    case 5:
      fig1.datum(aqData).call(UnitChartInstance1);
      break;
    case 6:
      // fig2.datum(aqData).call(HorizontalBarchart_1.dim_x("country").dim(null));
      break;
    case 7:
      // fig2
      //   .datum(aqData)
      //   .call(HorizontalBarchart_1.dim_x("country").dim("brand").smooth(false));
      break;
    case 8:
      // fig2
      //   .datum(aqData)
      //   .call(HorizontalBarchart_1.dim_x("brand").dim("country"));
      break;
    case 9:
      // granularity change
      // fig2.datum(aqData).call(HorizontalBarchart_1.dim_x("brand").dim("year"));
      break;
    case 10:
      // fig2.datum(aqData).call(HorizontalBarchart_1.dim_x("year").dim("brand"));
      break;
    case 11:
      // fig3.datum(aqData).call();
      break;
    case 12:
      // fig3.datum(aqData).call();
      break;
    case 13:
      // fig3.datum(aqData).call();
      break;
    case 14:
      // fig3.datum(aqData).call();
      break;
    case 15:
      // fig3.datum(aqData).call();
      break;
  }
}

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.75);
  steps.style("min-height", stepH + "px");
  chapters.style("min-height", stepH + "px");

  const figureHeight = window.innerHeight * 0.8;
  const figureMarginTop = (window.innerHeight - figureHeight) / 3;

  figures
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter({ element, direction, index }) {
  // add color to current step only
  steps.classed("is-active", false);
  d3.select(element).classed("is-active", true);

  // update graphic based on step
  figures.select("p").text(index);

  navbar.select("#next").attr("href", `#scrollama_step_${index + 1}`);
  navbar.select("#previous").attr("href", `#scrollama_step_${index - 1}`);

  d3.select("#dynamic_nav_container")
    .selectAll("a")
    .classed("is-active", false);
  d3.select(`#scrollama_step_tag_${index}`).classed("is-active", true);

  stepTrigger(index);
}

function setStepNavigationBar() {
  d3.selectAll(":is(.chapter,.step)").each(function () {
    const scrololama_index = d3.select(this).attr("data-scrollama-index");

    d3.select(this).attr("id", `scrollama_step_${scrololama_index}`);

    const symbol = d3.select(this).attr("class") == "step" ? "●" : "■";

    d3.select("#dynamic_nav_container")
      .append("a")
      .text(symbol)
      .attr("id", `scrollama_step_tag_${scrololama_index}`)
      .attr("href", `#scrollama_step_${scrololama_index}`);
  });
}

function initialCanvas() {
  const defaultLayters = [
    "morphLayer",
    "figureLayer",
    "xAxisLayer",
    "yAxisLayer",
    "anotationLayer",
  ];

  figures
    .append("svg")
    .selectAll("g")
    .data(defaultLayters)
    .enter()
    .append("g")
    .attr("class", (d) => d);
}

function init() {
  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();
  initialCanvas();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations

  scroller.setup({
    step: ":is(.chapter,.step)",
    offset: 0.6,
    debug: false,
  });

  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.onStepEnter(handleStepEnter);

  setStepNavigationBar();
}

function renderScrollProcessBar() {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById("top-progress-bar").style.width = scrolled + "%";
}

// kick things off
window.onload = init();
window.onscroll = function () {
  renderScrollProcessBar();
};
window.addEventListener("resize", handleResize);
