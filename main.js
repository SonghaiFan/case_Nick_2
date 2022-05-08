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
  .dim_color("key")
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
  id: d3.range(1, 1000),
});

function stepTrigger(index) {
  switch (index) {
    case 0:
      article.style("margin-left", "5%");
      fig1.datum(articleData.filter((d) => false)).call(idUnitChart);
      break;
    case 1:
      article.style("margin-left", "5%");
      fig1
        .datum(articleData.slice(0, 1))
        .call(idUnitChart.details(true).label(false));
      break;
    case 2:
      article.style("margin-left", "calc(50% - 35rem/2)");
      fig1.datum(dumyData).call(idUnitChart.details(false));
      break;
    case 3:
      fig1.datum(articleData).call(idUnitChart.details(true).label(false));
      break;
    case 4:
      article.style("margin-left", "calc(50% - 35rem/2)");
      fig1.datum(articleData).call(idUnitChart.details(false).label(false));
      break;
    case 5:
      article.style("margin-left", "5%");
      fig1.datum(hierarchyData.filter((d) => false)).call(
        keyUnitChart
          .margin({
            top: 0.3,
            right: 0,
            bottom: 0.3,
            left: 0.6,
          })
          .legend(true)
      );
      fig1
        .datum(articleData.filter((d) => d.id == 1))
        .call(idUnitChart.details(true).label(true));
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(0)");
      break;
    case 6:
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
        .call(
          keyUnitChart
            .margin({
              top: 0.3,
              right: 0,
              bottom: 0.3,
              left: 0.6,
            })
            .legend(true)
        );
      break;
    case 7:
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(-500px)");
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
    case 8:
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(-980px)");
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
        .call(
          keyUnitChart
            .margin({
              top: 0.3,
              right: 0,
              bottom: 0.3,
              left: 0.6,
            })
            .legend(true)
        );
      break;
    case 9:
      fig1
        .select(".in_svg_text_div")
        .transition()
        .duration(750)
        .style("transform", "translateY(-1588px)");
      fig1.datum(hierarchyData.filter((d) => d.id == 1)).call(
        keyUnitChart
          .margin({
            top: 0.3,
            right: 0,
            bottom: 0.3,
            left: 0.6,
          })
          .legend(true)
      );
      break;
    case 10:
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
    case 11:
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
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
      article.style("margin-left", "5%");
      break;
    case 12:
      article.style("margin-left", "calc(50% - 35rem/2)");
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
      break;
    case 13:
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
    case 14:
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
    case 15:
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
    case 16:
      fig1
        .datum(hierarchyData25.filter((d) => d.group_or_issue == "group"))
        .call(keyBarChartVertical);
      break;
    case 17:
      fig1
        .datum(hierarchyData25.filter((d) => d.group_or_issue == "issue"))
        .call(keyBarChartVertical);
      break;
    case 18:
      fig1.datum(hierarchyData25).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(false)
      );
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
      article.style("margin-left", "calc(50% - 35rem/2)");
      break;
    case 19:
      article.style("margin-left", "20%");
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
      fig1.datum(hierarchyData25).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
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
      fig1
        .select(".figureLayer3")
        .selectAll("path")
        .transition()
        .duration(1200)
        .delay((d) => d.id)
        .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2);
      break;
    case 20:
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
      fig1.datum(hierarchyData25.filter((d) => d.id == 1)).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1
        .datum(hierarchyData25.filter((d) => d.id == 1))
        .call(aSankeyChartText.lite(true));
      fig1
        .datum(hierarchyData25.filter((d) => d.id == 1))
        .call(aSankeyChartLink.lite(true));
      fig1
        .select(".figureLayer3")
        .selectAll("path")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
        .filter((d) => d.id == 1)
        .attr("stroke-dashoffset", 0);
      break;
    case 21:
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
      fig1.datum(hierarchyData25.filter((d) => d.id <= 2)).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 2))
        .call(aSankeyChartText);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 2))
        .call(aSankeyChartLink);
      fig1
        .select(".figureLayer3")
        .selectAll("path")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
        .filter((d) => d.id <= 2)
        .attr("stroke-dashoffset", 0);
      break;
    case 22:
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
      fig1.datum(hierarchyData25.filter((d) => d.id <= 3)).call(
        keyUnitChart.margin({
          top: 0.1,
          right: 0.6,
          bottom: 0.1,
          left: 0.1,
        })
      );
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 3))
        .call(aSankeyChartText);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 3))
        .call(aSankeyChartLink);
      fig1
        .select(".figureLayer3")
        .selectAll("path")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
        .filter((d) => d.id <= 3)
        .attr("stroke-dashoffset", 0);
      break;
    case 23:
      fig1.datum(hierarchyData25.filter((d) => d.id <= 4)).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
      fig1.datum(articleData25.filter((d) => d.id <= 4)).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(true)
      );
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 4))
        .call(aSankeyChartText);
      fig1
        .datum(hierarchyData25.filter((d) => d.id <= 4))
        .call(aSankeyChartLink);
      fig1
        .select(".figureLayer3")
        .selectAll("path")
        .transition()
        .duration(1200)
        .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
        .filter((d) => d.id <= 4)
        .attr("stroke-dashoffset", 0);
      break;
    case 24:
      fig1.datum(hierarchyData25).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(false)
          .dim_color("key")
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
      fig1
        .select(".figureLayer3")
        .selectAll("path")
        .transition()
        .duration(1200)
        .delay((d) => d.id)
        .attr("stroke-dashoffset", 0);
      article.style("margin-left", "20%");
      break;
    case 25:
      fig1.select(".figureLayer2").selectAll("*").remove();
      fig1.select(".figureLayer3").selectAll("*").remove();
      fig1.select(".figureLayer4").selectAll("*").remove();
      fig1.select(".xAxisLayer").selectAll("*").remove();
      fig1.select(".yAxisLayer").selectAll("*").remove();
      fig1.datum(characteristicsData.orderby("publisher").dedupe("id")).call(
        idUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .lite(false)
      );
      fig1.datum(characteristicsData.orderby("publisher")).call(
        keyUnitChart
          .margin({
            top: 0.1,
            right: 0.6,
            bottom: 0.1,
            left: 0.1,
          })
          .dim_color("publisher")
          .color_domain(characteristicsData.array("publisher"))
          .color_range([
            "rgb(252, 219, 57)",
            "rgb(3, 185, 118)",
            "rgb(250, 195, 211)",
          ])
          .lite(false)
      );
      article.style("margin-left", "calc(50% - 35rem/2)");
      break;
    case 26:
      // fig1.select(".figureLayer").selectAll("*").remove();
      fig1.datum(characteristicsData).call(
        aBarChartHorizontal
          .margin({
            top: 0.1,
            right: 0.1,
            bottom: 0.1,
            left: 0.45,
          })
          .dim_x("publisher")
          .dim_color("publisher")
          .dim("key")
          .measure_y("value")
          .color_domain(characteristicsData.array("publisher"))
          .color_range([
            "rgb(252, 219, 57)",
            "rgb(3, 185, 118)",
            "rgb(250, 195, 211)",
          ])
          .smooth(true)
      );
      break;
    case 27:
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
    case 28:
      fig1.datum(characteristicsDataAgg).call(
        aBarChartHorizontalKey
          .margin({
            top: 0.1,
            right: 0.1,
            bottom: 0.1,
            left: 0.45,
          })
          .dim_x("key")
          .dim_color("publisher")
          .measure_y("value")
          // .color_range(["rgb(255, 250, 240)"])
          .smooth(true)
          .stack(true)
      );
      break;
    case 29:
      fig1
        .datum(characteristicsDataAgg)
        .call(
          aBarChartHorizontalKey
            .dim_x("key")
            .dim_color("publisher")
            .color_range([
              "rgb(252, 219, 57)",
              "rgb(3, 185, 118)",
              "rgb(250, 195, 211)",
            ])
            .measure_y("value")
            .smooth(true)
            .stack(false)
        );
      break;
    case 30:
      fig1.select(".figureLayer1").selectAll("rect").style("opacity", 0.2);

      fig1.select(".figureLayer1").selectAll(".Fairfax").style("opacity", 1);
      break;
    case 31:
      fig1.select(".figureLayer1").selectAll("rect").style("opacity", 0.2);

      fig1.select(".figureLayer1").selectAll(".News").style("opacity", 1);
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
