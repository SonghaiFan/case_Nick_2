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
      break;
    case 1:
      fig1.datum(articleData.filter((d) => false)).call(idUnitChart);
      fig1.datum(hierarchyData.filter((d) => false)).call(keyUnitChart);
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      break;
    case 2:
      fig1.datum(hierarchyData.filter((d) => false)).call(keyUnitChart);
      fig1.datum(articleData.filter((d) => d.id == 1)).call(idUnitChart);
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
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
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
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
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
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
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      break;
    case 6:
      fig1.datum(hierarchyData).call(
        keyBarChartStackedVertical.smooth(false).margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.6,
        })
      );
      fig1.select(".figureLayer2").selectAll("*").remove();
      fig1.datum(articleData).call(
        idUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
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
      fig1.datum(articleData).call(
        idUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      break;
    case 8:
      fig1.datum(articleData25).call(
        idUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
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
      fig1.datum(hierarchyData25).call(keyUnitChart.lite(false));
      fig1.datum(articleData25).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(false)
      );
      fig1.datum(hierarchyData25).call(keyBarChartVertical);
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      break;
    case 12:
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      fig1.datum(articleData25).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
      fig1.datum(hierarchyData25).call(keyUnitChart.lite(true));
      fig1.datum(hierarchyData25).call(
        aSankeyChartNode.margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.45,
        })
      );
      fig1.datum(hierarchyData25).call(
        aSankeyChartText.lite(false).margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.45,
        })
      );
      fig1.datum(hierarchyData25).call(
        aSankeyChartLink.lite(false).margin({
          top: 0.1,
          right: 0.1,
          bottom: 0.1,
          left: 0.45,
        })
      );
      break;
    case 13:
      fig1.datum(articleData25.filter((d) => d.id == 1)).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
      fig1.datum(hierarchyData25.filter((d) => d.id == 1)).call(keyUnitChart);
      fig1
        .datum(hierarchyData25.filter((d) => d.id == 1))
        .call(aSankeyChartText.lite(true));
      fig1
        .datum(hierarchyData25.filter((d) => d.id == 1))
        .call(aSankeyChartLink.lite(true));
      d3.selectAll(".article1")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", 0);
      break;
    case 14:
      fig1.datum(articleData25.filter((d) => d.id <= 2)).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
      fig1.datum(hierarchyData25.filter((d) => d.id <= 2)).call(keyUnitChart);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 2))
        .call(aSankeyChartText);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 2))
        .call(aSankeyChartLink);
      d3.selectAll(".article2")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", 0);
      break;
    case 15:
      fig1.datum(articleData25.filter((d) => d.id <= 3)).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
      fig1.datum(hierarchyData25.filter((d) => d.id <= 3)).call(keyUnitChart);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 3))
        .call(aSankeyChartText);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 3))
        .call(aSankeyChartLink);
      d3.selectAll(".article3")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", 0);
      break;
    case 16:
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 4))
        .call(keyUnitChart.lite(true));
      fig1.datum(articleData25.filter((d) => d.id <= 4)).call(
        idUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 4))
        .call(aSankeyChartText);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 4))
        .call(aSankeyChartLink);
      d3.selectAll(".article4")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", 0);
      break;
    case 17:
      fig1
        .datum(hierarchyData25)
        .call(
          keyUnitChart
            .lite(false)
            .color_domain(colorValue.array("key"))
            .color_range(colorValue.array("color"))
        );
      fig1.datum(articleData25).call(
        idUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1.datum(hierarchyData25).call(aSankeyChartText);
      fig1.datum(hierarchyData25).call(aSankeyChartLink);
      d3.selectAll(".linksGroup")
        .selectAll("path")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", 0);
      break;
    case 18:
      // fig1.select(".figureLayer1").selectAll("*").remove();
      fig1.select(".figureLayer2").selectAll("*").remove();
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      fig1.datum(characteristicsData.dedupe("id")).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .lite(false)
      );
      fig1.datum(characteristicsData).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          })
          .color_domain(characteristicsData.array("key"))
          .color_range(["rgb(255, 250, 240)"])
          .lite(false)
      );
      break;
    case 19:
      fig1.select(".figureLayer").selectAll("*").remove();
      fig1
        .datum(characteristicsData)
        .call(
          aBarChartHorizontal
            .dim_x("publisher")
            .dim_color("publisher")
            .dim("key")
            .measure_y("value")
            .smooth(true)
        );
      break;
    case 20:
      fig1
        .datum(characteristicsData)
        .call(
          aBarChartHorizontal
            .dim_x("key")
            .dim_color("publisher")
            .dim("key")
            .measure_y("value")
            .smooth(true)
        );
      break;
    case 21:
      fig1
        .datum(characteristicsDataAgg)
        .call(
          aBarChartHorizontalKey
            .dim_x("key")
            .dim_color("publisher")
            .measure_y("value")
            .smooth(true)
            .stack(true)
        );
      break;
    case 22:
      fig1
        .datum(characteristicsDataAgg)
        .call(
          aBarChartHorizontalKey
            .dim_x("key")
            .dim_color("publisher")
            .measure_y("value")
            .smooth(true)
            .stack(false)
        );
      break;
  }
}

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.85);
  steps
    .style("margin-top", stepH / 2 + "px")
    .style("margin-bottom", stepH / 2 + "px");
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
