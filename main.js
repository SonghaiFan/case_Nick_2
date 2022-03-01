import UnitchartGridLayoutKey from "./src/js/UnitchartGridLayoutKey.js";
import UnitchartGridLayoutId from "./src/js/UnitchartGridLayoutId.js";
import BarChartStackedVertical from "./src/js/BarChartStackedVertical.js";
import BarChartVertical from "./src/js/BarChartVertical.js";
import BarChartHorizontal from "./src/js/BarChartHorizontal.js";
import BarChartHorizontalKey from "./src/js/BarChartHorizontalKey.js";
import SankeyChartText from "./src/js/SankeyChartText.js";
import SankeyChartNode from "./src/js/SankeyChartNode.js";
import SankeyChartLink from "./src/js/SankeyChartLink.js";

const figures = d3.selectAll(".figure");
const article = d3.selectAll(".article");
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
const characteristicsData = await aq.loadCSV(
  "src/data/characteristics_data.csv"
);
const characteristicsDataAgg = await aq.loadCSV(
  "src/data/characteristics_data_agg.csv"
);

const colorValue = hierarchyData
  .groupby(["group_or_issue", "key"])
  .rollup({ count: (d) => op.count() })
  .orderby(["group_or_issue", aq.desc("count")])
  .groupby("group_or_issue")
  .derive({ rolling_count: aq.rolling((d) => op.sum(d.count)) })
  .derive({ percent: (d) => d.rolling_count / op.sum(d.count) || 0 })
  .derive({
    color: aq.escape((d) =>
      d.group_or_issue == "group" ? "rgb(28, 106, 228)" : "rgb(250, 77, 29)"
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

const aSankeyChartText = SankeyChartText();

const aSankeyChartNode = SankeyChartNode()
  .color_domain(colorValue.array("key"))
  .color_range(colorValue.array("color"));

const aSankeyChartLink = SankeyChartLink();

const aBarChartHorizontal = BarChartHorizontal()
  .dim_x("publisher")
  .dim_color("publisher")
  .dim("id")
  .measure_y("value");

const aBarChartHorizontalKey = BarChartHorizontalKey().measure_y("value");

const dumyData = aq.table({
  id: d3.range(1, 3846),
});

function stepTrigger(index) {
  switch (index) {
    case 0:
      article
        .style("max-width", "65rem")
        .style("margin-left", "calc(50% - 65rem/2)");
      break;
    case 1:
      article
        .style("max-width", "65rem")
        .style("margin-left", "calc(50% - 65rem/2)");
      fig1
        .datum(articleData.filter((d) => false))
        .call(idUnitChart.details(true));
      fig1.datum(hierarchyData.filter((d) => false)).call(
        keyUnitChart
          .margin({
            top: 0.3,
            right: 0,
            bottom: 0.3,
            left: 0.5,
          })
          .legend(true)
      );

      break;
    case 2:
      article.style("max-width", "35rem").style("margin-left", "10%");
      fig1.datum(articleData.filter((d) => d.id == 1)).call(idUnitChart);
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(0)");
      fig1
        .datum(
          hierarchyData
            .filter((d) => d.id == 1)
            .filter((d) => d.key == "familyrelations" || d.key == "violence")
        )
        .call(keyUnitChart);

      break;
    case 3:
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(-385px)");
      fig1
        .datum(
          hierarchyData
            .filter((d) => d.id == 1)
            .filter(
              (d) =>
                d.key == "familyrelations" ||
                d.key == "violence" ||
                d.key == "firstnations"
            )
        )
        .call(keyUnitChart);
      break;

    case 4:
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(-975px)");
      fig1
        .datum(
          hierarchyData
            .filter((d) => d.id == 1)
            .filter(
              (d) =>
                d.key == "familyrelations" ||
                d.key == "violence" ||
                d.key == "firstnations" ||
                d.key == "women"
            )
        )
        .call(keyUnitChart);
      break;
    case 5:
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(-1870px)");
      fig1.datum(hierarchyData.filter((d) => d.id == 1)).call(keyUnitChart);
      break;
    case 6:
      fig1
        .datum(articleData.filter((d) => d.id == 1))
        .call(idUnitChart.details(false));
      fig1.datum(hierarchyData.filter((d) => d.id == 1)).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0,
          bottom: 0.1,
          left: 0,
        })
      );
      break;
    case 7:
      fig1.datum(hierarchyData).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .legend(false)
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
      );

      break;
    case 8:
      fig1.datum(hierarchyData25).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .legend(false)
      );
      fig1.datum(articleData25).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .details(false)
      );
      break;
    case 9:
      break;
    case 10:
      break;
    case 11:
      break;
  }
}

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.95);
  steps
    // .style("margin-top", stepH / 2 + "px")
    .style("margin-bottom", stepH + "px");
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
  figures
    .selectAll("g")
    .filter(function () {
      d3.select("this").empty();
    })
    .selectAll("*")
    .remove();
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
    offset: 0.5,
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
