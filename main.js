import UnitchartGridLayoutKey from "./src/js/UnitchartGridLayoutKey.js";
import UnitchartGridLayoutId from "./src/js/UnitchartGridLayoutId.js";
import BarChartStackedVertical from "./src/js/BarChartStackedVertical.js";
import BarChartVertical from "./src/js/BarChartVertical.js";
// import BarChartVerticalCo from "./src/js/BarChartVerticalCo.js";
import SankeyChart from "./src/js/SankeyChart.js";
import SankeyChartDm from "./src/js/SankeyChartDm.js";
// import SankeyChartHiden from "./src/js/SankeyChartHiden.js";

const figures = d3.selectAll(".figure");
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
const articleData = await aq.loadCSV("src/data/article_data.csv");
const hierarchyData = await aq.loadCSV("src/data/hierarchy_data.csv");
const articleData25 = await aq.loadCSV("src/data/article_data25.csv");
const hierarchyData25 = await aq.loadCSV("src/data/hierarchy_data25.csv");

const colorValue = hierarchyData
  .groupby(["group_or_issue", "key"])
  .rollup({ count: (d) => op.count() })
  .orderby(["group_or_issue", aq.desc("count")])
  .groupby("group_or_issue")
  .derive({ rolling_count: aq.rolling((d) => op.sum(d.count)) })
  .derive({ percent: (d) => d.rolling_count / op.sum(d.count) || 0 })
  .derive({
    color: aq.escape((d) =>
      d.group_or_issue == "group"
        ? d3.interpolateCool(1 - d.percent)
        : d3.interpolateWarm(d.percent)
    ),
  });

// preparation for rendering

// const UnitGridLayout = GridLayout();

const keyUnitChart = UnitchartGridLayoutKey()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

const idUnitChart = UnitchartGridLayoutId()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

const keyBarChartStackedVertical = BarChartStackedVertical()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

const keyBarChartVertical = BarChartVertical()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

// const keyBarChartVerticalCo = BarChartVerticalCo()
//   .color_domain(colorValue.array("key"))
//   .color_range(colorValue.array("color"));

const aSankeyChart = SankeyChart()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

const aSankeyChartDm = SankeyChartDm()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

// const aSankeyChartHd = SankeyChartHiden()
//   .color_domain(colorValue.array("key"))
//   .color_range(colorValue.array("color"));

// const HorizontalBarchart_1 = HorizontalBarchart()
//   .dim_color("country")
//   .measure_y("sales")
//   .color_domain(aqData.array("country"));

const dumyData = aq.table({
  id: d3.range(1, 3846),
});

function stepTrigger(index) {
  switch (index) {
    case 0:
      break;
    case 1:
      fig1.datum(articleData.filter((d) => false)).call(idUnitChart);
      fig1.datum(hierarchyData.filter((d) => false)).call(keyUnitChart);
      break;
    case 2:
      fig1.datum(hierarchyData.filter((d) => false)).call(keyUnitChart);
      fig1.datum(articleData.filter((d) => d.id == 1)).call(idUnitChart);
      break;
    case 3:
      fig1
        .datum(
          hierarchyData.filter((d) => d.id == 1 || d.id == 4 || d.id == 14)
        )
        .call(keyUnitChart.bin(3));
      fig1
        .datum(articleData.dedupe("publisher"))
        .call(idUnitChart.details(true).bin(3));
      break;
    case 4:
      fig1.datum(hierarchyData).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .bin(null)
      );
      fig1.datum(articleData).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .details(false)
          .bin(null)
      );
      break;
    case 5:
      fig1.datum(articleData).call(
        idUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1.datum(hierarchyData).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.6,
        })
      );
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      break;
    case 6:
      fig1.datum(hierarchyData).call(
        keyBarChartStackedVertical.margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.6,
        })
      );
      fig1.select(".figureLayer2").selectAll("*").remove();
      fig1.datum(articleData).call(idUnitChart);
      break;
    case 7:
      fig1.datum(hierarchyData).call(
        keyBarChartVertical.smooth(false).margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.6,
        })
      );
      fig1.select(".figureLayer1").selectAll("*").remove();
      fig1.datum(hierarchyData25.filter((d) => false)).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.6,
        })
      );
      fig1.datum(articleData).call(idUnitChart);
      break;
    case 8:
      fig1.datum(articleData25).call(idUnitChart);
      fig1.datum(hierarchyData25).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1.datum(hierarchyData25).call(keyBarChartVertical.smooth(true));
      break;
    case 9:
      fig1
        .datum(hierarchyData25.filter((d) => d.group_or_issue == "group"))
        .call(keyBarChartVertical);
      break;
    case 10:
      fig1
        .datum(hierarchyData25.filter((d) => d.group_or_issue == "issue"))
        .call(keyBarChartVertical);
      break;
    case 11:
      fig1.datum(hierarchyData25).call(keyBarChartVertical);
      break;
    case 12:
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      fig1.datum(articleData25).call(idUnitChart);
      fig1.datum(hierarchyData25).call(keyUnitChart);
      fig1.datum(hierarchyData25).call(
        aSankeyChartDm.margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.45,
        })
      );
      fig1.datum(hierarchyData25.filter((d) => false)).call(
        aSankeyChart.margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.45,
        })
      );
      break;
    case 13:
      fig1.datum(articleData25.filter((d) => d.id == 1)).call(idUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id == 1)).call(keyUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id == 1)).call(aSankeyChartDm);
      fig1.datum(hierarchyData25.filter((d) => d.id == 1)).call(aSankeyChart);
      break;
    case 14:
      fig1.datum(articleData25.filter((d) => d.id <= 2)).call(idUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 2)).call(keyUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 2)).call(aSankeyChartDm);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 2)).call(aSankeyChart);
      break;
    case 15:
      fig1.datum(articleData25.filter((d) => d.id <= 3)).call(idUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 3)).call(keyUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 3)).call(aSankeyChartDm);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 3)).call(aSankeyChart);
      break;
    case 16:
      fig1.datum(hierarchyData25.filter((d) => d.id <= 4)).call(keyUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 4)).call(aSankeyChartDm);
      fig1.datum(articleData25.filter((d) => d.id <= 4)).call(idUnitChart);
      fig1.datum(hierarchyData25.filter((d) => d.id <= 4)).call(aSankeyChart);
      break;
    case 17:
      fig1.datum(hierarchyData25).call(keyUnitChart);
      fig1.datum(hierarchyData25).call(aSankeyChartDm);
      fig1.datum(articleData25).call(idUnitChart);
      fig1.datum(hierarchyData25).call(aSankeyChart);
      break;
    case 18:
      fig1
        .datum(hierarchyData25.filter((d) => d.key == "firstnations"))
        .call(aSankeyChartDm);
      fig1
        .datum(hierarchyData25.filter((d) => d.key == "firstnations"))
        .call(aSankeyChart);
      break;
    case 19:
      break;
    case 20:
      break;
    case 21:
      break;
    case 22:
      break;
  }
}

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.85);
  steps.style("margin-bottom", stepH + "px");
  chapters.style("min-height", stepH + "px");

  const figureHeight = window.innerHeight * 0.95;
  const figureMarginTop = (window.innerHeight - figureHeight) / 4;

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
    "figureLayer",
    "figureLayer1",
    "figureLayer2",
    "figureLayer3",
    "figureLayer4",
    "morphLayer5",
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
    .attr("class", (d) => d)
    .style("opacity", 0);
}

function init() {
  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();
  initialCanvas();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations

  scroller.setup({
    step: ":is(.chapter,.step)",
    offset: 0.3,
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
