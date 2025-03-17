import define1 from "./f780586a85a07fa7@363.js";

function _1(md){return(
md`# CSCE-679-Data-Visualization-Assignment2`
)}

function _2(md){return(
md`By Tanay Patankar, UIN 534002324`
)}

function _3(md){return(
md`First, we import d3 and a function to show the legend`
)}

function _d3(require){return(
require('d3@7')
)}

function _6(md){return(
md`Then, we read the csv file using d3`
)}

function _temperaturedata(d3){return(
d3.csv('https://raw.githubusercontent.com/xiameng552180/CSCE-679-Data-Visualization-Assignment2/refs/heads/main/temperature_daily.csv')
)}

function _8(md){return(
md`Then, we define a function to process and format data. This groups the data by year and months and gets the maximum max temp and min minimum temperature for every month. Along with this, I also store an array of the daily min and max temps, which will be used in Task 2`
)}

function _formatData(d3){return(
function formatData(data) {
  data.forEach(row => {
    row.max_temperature = parseInt(row.max_temperature, 10);  // Convert max_temperature to int
    row.min_temperature = parseInt(row.min_temperature, 10);  // Convert min_temperature to int
  });
  var processedData = d3.rollups(
    data,
    v => ({
      max_temp: d3.max(v, d => d.max_temperature),
      min_temp: d3.min(v, d => d.min_temperature),
      daily_temps: v.map(d => ({
        max_temp: d.max_temperature,
        min_temp: d.min_temperature
      }))
    }),
    d => new Date(d.date).getUTCFullYear(),
    d => new Date(d.date).getUTCMonth() + 1 // Months are 0-indexed
  ).flatMap(([year, months]) =>
    months.map(([month, temps]) => ({
      year,
      month,
      max_temp: temps.max_temp,
      min_temp: temps.min_temp,
      daily_temps: temps.daily_temps
    }))
  );
  return processedData;
}
)}

function _10(md){return(
md`# Level 1 challenge: Year/Month Heatmap
On clicking any cell in the heatmap, the heatmap toggles to show either the max temp data or the min temp data. This also updates the title and the label. There is an accomodation in the legend to have differing scales for min and max heatmaps. This is not used, and a constant scale of 0-40 is used, as present in the assignment GitHub example.`
)}

function _11(formatData,temperaturedata,d3,DOM,legend)
{
  const width = 800;
  const height = 600;
  const margin = { left: 60, top: 70, right: 20, bottom: 80 };
  const processedData = formatData(temperaturedata)

  // Create the SVG container
  const svg = d3.select(DOM.svg(width, height))
    .attr("width", width)
    .attr("height", height);

  // Create the chart area with margins
  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Define scales for x (year) and y (month)
  const x = d3.scaleBand()
    .domain(processedData.map(d => d.year))  // Group by year
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

  const y = d3.scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])  // Months (1-12)
    .range([0, height - margin.top - margin.bottom])  // Reversed so Jan is at top
    .padding(0.1);

  // Add x axis (Year) at the top
  chartArea.append("g")
    .attr("transform", `translate(0,0)`)  // Shift to the top
    .call(d3.axisTop(x))  // Changed from axisBottom to axisTop
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("dx", "2em")
    .attr("dy", "0em")
    .attr("transform", "rotate(-45)");

  // Add y axis (Month) on the left
  chartArea.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d3.timeFormat("%B")(new Date(0, d - 1))));  // Display month names

  // // Function to have a different ranges for min and max temperature ranges
  // // Create a color scale for temperature range (yellow to red spectrum)
  // const mincolor = d3.scaleLinear()
  //   .domain([d3.min(processedData, d => d.min_temp), d3.max(processedData, d => d.min_temp)])
  //   .interpolate(() => d3.interpolateYlOrRd);

  // const maxcolor = d3.scaleLinear()
  //   .domain([d3.min(processedData, d => d.max_temp), d3.max(processedData, d => d.max_temp)])
  //   .interpolate(() => d3.interpolateYlOrRd);

    // Create a color scale for temperature range (yellow to red spectrum)
  const mincolor = d3.scaleLinear()
    .domain([0,40])
    .interpolate(() => d => d3.interpolateRdYlBu(1 - d));

  const maxcolor = d3.scaleLinear()
    .domain([0,40])
    .interpolate(() => d => d3.interpolateRdYlBu(1 - d));

  // Create a tooltip
  const tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // Tooltip functions
  const mouseover = function(event, d) {
    tooltip.style("opacity", 1)
      .html(`Date: ${d.year}-${String(d.month).padStart(2, '0')}<br>Max: ${d.max_temp}°C<br>Min: ${d.min_temp}°C`)
      .style("left", (event.pageX + 1) + "px")
      .style("top", (event.pageY - 1) + "px");
  };

  const mousemove = function(event) {
    tooltip.style("left", (event.pageX + 1) + "px")
      .style("top", (event.pageY - 1) + "px");
  };

  const mouseleave = function() {
    tooltip.style("opacity", 0);
  };

  // Logic for toggling between min and max temp heatmaps
  let maxBarsVisible = false;
  let minBarsVisible = true;
    
  const toggleBars = function() {
    // Toggle visibility of max temperature bars
    maxBarsVisible = !maxBarsVisible;
    chartArea.selectAll(".maxTempBar")
      .style("visibility", maxBarsVisible ? "visible" : "hidden");
  
    // Toggle visibility of min temperature bars
    minBarsVisible = !minBarsVisible;
    chartArea.selectAll(".minTempBar")
      .style("visibility", minBarsVisible ? "visible" : "hidden");

    // Toggle the Title text
    chartArea.select("#title-text")
      .text(`Yearly Temperature Heatmap (${maxBarsVisible ? "Max Temp" : "Min Temp"})`);

    // Toggle the legend for min temp
    chartArea.select("#minlegend")
      .style("visibility", minBarsVisible ? "visible" : "hidden");

    // Toggle the legend for max temp
    chartArea.select("#maxlegend")
      .style("visibility", maxBarsVisible ? "visible" : "hidden");
  };

  // Add bars for max temperature
  chartArea.selectAll(".maxTempBar")
    .data(processedData)
    .enter()
    .append("rect")
      .attr("class", "maxTempBar")
      .attr("x", d => x(d.year))  // Position by year
      .attr("y", d => y(d.month))  // Position by month (from top to bottom)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())  // Make the height equal to the band size
      .style("fill", d => maxcolor(d.max_temp))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", toggleBars)  // Add click event for toggling bars
      .append("title")
        .text(d => `Max Temp: ${d.max_temp}°C`)
        .style("visibility", "hidden");

  // Add bars for min temperature
  chartArea.selectAll(".minTempBar")
    .data(processedData)
    .enter()
    .append("rect")
      .attr("class", "minTempBar")
      .attr("x", d => x(d.year))  // Position by year
      .attr("y", d => y(d.month))  // Position by month (from top to bottom)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())  // Make the height equal to the band size
      .style("fill", d => mincolor(d.min_temp))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", toggleBars)  // Add click event for toggling bars
      .append("title")
        .text(d => `Min Temp: ${d.min_temp}°C`);


  // Append the custom legend to the chart area
  chartArea.append("g")
    .attr("transform", "translate(0,450)")
    .attr("id", "minlegend")
      .append(() => legend(mincolor, "Minimum Temperature", d3.format(".1f")));

  chartArea.append("g")
    .attr("transform", "translate(0,450)")
    .style("visibility", "hidden")
    .attr("id", "maxlegend")
      .append(() => legend(maxcolor, "Maximum Temperature", d3.format(".1f")));

  // Add the title of the heatmap
  chartArea.append("text")
    .attr("x", 400)
    .attr("y", -50) // Adjust based on margin
    .attr("text-anchor", "middle")
    .attr("id", "title-text")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#000") // Ensure text color is visible
    .text("Yearly Temperature Heatmap (Min Temp)");
  
  return svg.node();
}


function _12(md){return(
md`# Level 2 Challenge: Improvement of the Year/Month Heatmap`
)}

function _13(formatData,temperaturedata,d3,DOM,legend)
{
  const width = 800;
  const height = 600;
  const margin = { left: 60, top: 70, right: 20, bottom: 80 };
  const filteredProcessedData = formatData(temperaturedata).filter(d => d.year >= 2008);

  // Create the SVG container
  const svg = d3.select(DOM.svg(width, height))
    .attr("width", width)
    .attr("height", height);

  // Create the chart area with margins
  const chartArea = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Define scales for x (year) and y (month)
  const x = d3.scaleBand()
    .domain(filteredProcessedData.map(d => d.year))  // Group by year
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

  const y = d3.scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])  // Months (1-12)
    .range([0, height - margin.top - margin.bottom])  // Reversed so Jan is at top
    .padding(0.1);

  // Add x axis (Year) at the top
  chartArea.append("g")
    .attr("transform", `translate(0,0)`)  // Shift to the top
    .call(d3.axisTop(x))  // Changed from axisBottom to axisTop
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("dx", "2em")
    .attr("dy", "0em")
    .attr("transform", "rotate(-45)");

  // Add y axis (Month) on the left
  chartArea.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d3.timeFormat("%B")(new Date(0, d - 1))));  // Display month names

  // Create a color scale for temperature range (yellow to red spectrum)
  const mincolor = d3.scaleLinear()
    .domain([0,40])
    .interpolate(() => t => d3.interpolateRdYlBu(1 - t));

  const maxcolor = d3.scaleLinear()
    .domain([0,40])
    .interpolate(() => t => d3.interpolateRdYlBu(1 - t));

  // Create a tooltip
  const tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // Tooltip functions
  const mouseover = function(event, d) {
    tooltip.style("opacity", 1)
      .html(`Date: ${d.year}-${String(d.month).padStart(2, '0')}<br>Max: ${d.max_temp}°C<br>Min: ${d.min_temp}°C`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  };

  const mousemove = function(event) {
    tooltip.style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  };

  const mouseleave = function() {
    tooltip.style("opacity", 0);
  };

  // Logic for toggling between min and max temp heatmaps
  let maxBarsVisible = false;
  let minBarsVisible = true;
    
  const toggleBars = function() {
    // Toggle visibility of max temperature bars
    maxBarsVisible = !maxBarsVisible;
    chartArea.selectAll(".maxTempBar")
      .style("visibility", maxBarsVisible ? "visible" : "hidden");
  
    // Toggle visibility of min temperature bars
    minBarsVisible = !minBarsVisible;
    chartArea.selectAll(".minTempBar")
      .style("visibility", minBarsVisible ? "visible" : "hidden");

    // Toggle the Title text
    chartArea.select("#title-text")
      .text(`Yearly Temperature Heatmap (${maxBarsVisible ? "Max Temp" : "Min Temp"})`);

    // Toggle the legend for min temp
    chartArea.select("#minlegend")
      .style("visibility", minBarsVisible ? "visible" : "hidden");

    // Toggle the legend for max temp
    chartArea.select("#maxlegend")
      .style("visibility", maxBarsVisible ? "visible" : "hidden");
    
  };

  // Add bars for max temperature
  chartArea.selectAll(".maxTempBar")
    .data(filteredProcessedData)
    .enter()
    .append("rect")
      .attr("class", "maxTempBar")
      .attr("x", d => x(d.year))  // Position by year
      .attr("y", d => y(d.month))  // Position by month (from top to bottom)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())  // Make the height equal to the band size
      .style("fill", d => maxcolor(d.max_temp))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", toggleBars)  // Add click event for toggling bars
      .append("title")
        .text(d => `Max Temp: ${d.max_temp}°C`)
        .style("visibility", "hidden");

  // Add bars for min temperature
  chartArea.selectAll(".minTempBar")
    .data(filteredProcessedData)
    .enter()
    .append("rect")
      .attr("class", "minTempBar")
      .attr("x", d => x(d.year))  // Position by year
      .attr("y", d => y(d.month))  // Position by month (from top to bottom)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())  // Make the height equal to the band size
      .style("fill", d => mincolor(d.min_temp))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", toggleBars)  // Add click event for toggling bars
      .append("title")
        .text(d => `Min Temp: ${d.min_temp}°C`);


  // Append the custom legend to the chart area
  chartArea.append("g")
    .attr("transform", "translate(0,450)")
    .attr("id", "minlegend")
      .append(() => legend(mincolor, "Minimum Temperature", d3.format(".1f")));

  chartArea.append("g")
    .attr("transform", "translate(0,450)")
    .style("visibility", "hidden")
    .attr("id", "maxlegend")
      .append(() => legend(maxcolor, "Maximum Temperature", d3.format(".1f")));

  chartArea.append("text")
    .attr("x", 400)
    .attr("y", -50) // Adjust based on margin
    .attr("text-anchor", "middle")
    .attr("id", "title-text")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#000") // Ensure text color is visible
    .text("Yearly Temperature Heatmap (Min Temp)");

    // Add graphs inside heatmap cells
  chartArea.selectAll(".heatmap-cell")
    .data(filteredProcessedData)
    .enter()
    .append("g")
    .attr("class", "heatmap-cell") // Create a class for every cell
    .attr("transform", d => `translate(${x(d.year)}, ${y(d.month)})`) // Move the class to the correct cell location
    .each(function(d) {
      // Define scales for the graph within the cell
      const graphX = d3.scaleLinear()
        .domain([0, d.daily_temps.length - 1])
        .range([0, x.bandwidth()]); // Fit within cell width
  
      const graphY = d3.scaleLinear()
        .domain([0,40]) // Data range for the line graphs
        .range([y.bandwidth(), 0]); // Fit within cell height (invert y-axis)
  
      // Append path for max temperature graph
      d3.select(this)
        .append("path")
        .datum(d.daily_temps) // Bind daily temperatures data
        .attr("d", d3.line()
          .x((_, i) => graphX(i)) // Index based plotting
          .y(t => graphY(t.max_temp))
          )
        .attr("fill", "none")
        .attr("stroke", "#34a253") // Green color
        .attr("stroke-width", 1);
  
      // Append path for min temperature graph
      d3.select(this)
        .append("path")
        .datum(d.daily_temps) // Bind daily temperatures data
        .attr("d", d3.line()
          .x((_, i) => graphX(i)) // Index based plotting
          .y(t => graphY(t.min_temp))
          )
        .attr("fill", "none")
        .attr("stroke", "#9ecae1") // Blueish grey color
        .attr("stroke-width", 1);
    });
  
  return svg.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  const child1 = runtime.module(define1);
  main.import("legend", child1);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer("temperaturedata")).define("temperaturedata", ["d3"], _temperaturedata);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer("formatData")).define("formatData", ["d3"], _formatData);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer()).define(["formatData","temperaturedata","d3","DOM","legend"], _11);
  main.variable(observer()).define(["md"], _12);
  main.variable(observer()).define(["formatData","temperaturedata","d3","DOM","legend"], _13);
  return main;
}
