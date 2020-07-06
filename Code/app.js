const svgWidth = 660;
const svgHeight = 460;

const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Calculate chart width and height
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append SVG group
const chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Initial params
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis const upon click on axis label
function renderYAxes(newYScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d=>newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function renderTexts(txtGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  txtGroup.transition()
    .duration(1000)
    .attr("x", d=>newXScale(d[chosenXAxis]))
    .attr("y", d=>newYScale(d[chosenYAxis]))
  return txtGroup;
}

// function used for updating x-scale const upon click on axis label
function xScale(healthData, chosenXaxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXaxis]*0.8),
        d3.max(healthData, d => d[chosenXaxis]*1.2)
      ])
      .range([0, width]);
    return xLinearScale;
}
function yScale(healthData, chosenYaxis) {
    // create scales
    const yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d[chosenYaxis])*0.8, d3.max(healthData, d=>d[chosenYaxis])*1.2 ])
      .range([height, 0]);
    return yLinearScale;
}

// function used for updating tooltip for circles group
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup){
  let xLabel = ""
  let yLabel = ""
  if (chosenXaxis === "poverty"){
    xLabel = "Poverty: ";
  }
  else if (chosenXaxis === "age"){
    xLabel = "Age: ";
  }
  else{
    xLabel = "Income: $";
  }
  if (chosenYaxis === "healthcare"){
    yLabel = "Healthcare: "
  }
  else if (chosenYaxis === "smokes"){
    yLabel = "Smokes: "
  }
  else{
    yLabel = "Obesity: "
  }
  const toolTip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([80, -60])
                    .html(function(d){
                      if (chosenYaxis === "smokes" || chosenYaxis === "obesity") {
                        if (chosenXaxis === "poverty"){
                          return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}%<br>${yLabel}${d[chosenYaxis]}%`)
                        }
                        return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}<br>${yLabel}${d[chosenYaxis]}%`)
                      }
                      else if (chosenXaxis === "poverty"){
                        return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}%<br>${yLabel}${d[chosenYaxis]}`)
                      }
                      else{
                        return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}<br>${yLabel}${d[chosenYaxis]}`)
                      }  
                    })
  
  circlesGroup.call(toolTip);
  circlesGroup.on("mouseover", function(data){
    toolTip.show(data, this);
    d3.select(this).style("stroke", "black");
    
  })
  circlesGroup.on("mouseout", function(data, index){
    toolTip.hide(data, this)
    d3.select(this).style("stroke", "white");
  })
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const healthData = await d3.csv("assets/data/data.csv");

    // parse data to interger from string
    healthData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    })

    // xLinearScale function after csv import
    let xLinearScale = xScale(healthData, chosenXaxis);

    // yLinearScale function after csv import
    let yLinearScale = yScale(healthData, chosenYaxis)

    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append X-axis
    let xAxis = chartGroup.append("g")
                        .classed("x-axis", true)
                        .attr("transform", `translate(0, ${height})`)
                        .call(bottomAxis)
    
    let yAxis = chartGroup.append("g")
                        .classed("y-axis", true)
                        .call(leftAxis)
    
    let crlTxtGroup = chartGroup.selectAll("mycircles")
                      .data(healthData)
                      .enter()
                      .append("g")
    
    let circlesGroup = crlTxtGroup.append("circle")
                            .attr("cx", d=>xLinearScale(d[chosenXaxis]))
                            .attr("cy", d=>yLinearScale(d[chosenYaxis]))
                            .classed("stateCircle", true)
                            .attr("r", 8)
                            .attr("opacity", "1");

    let txtGroup = crlTxtGroup.append("text")
                              .text(d=>d.abbr)
                              .attr("x", d=>xLinearScale(d[chosenXaxis]))
                              .attr("y", d=>yLinearScale(d[chosenYaxis])+3)
                              .classed("stateText", true)
                              .style("font-size", "7px")
                              .style("font-weight", "800")

     // Create group for  3 x- axis labels
     const xlabelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);
    
    // Create group for  3 y- axis labels
    const ylabelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);

    const povertyLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("value", "poverty") // value to grab for event listener
                                .classed("active", true)
                                .classed("aText", true)
                                .text("In Poverty (%)");

    const ageLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "age") // value to grab for event listener
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Age (Median)");

    const incomeLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "income") // value to grab for event listener
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Household Income (Median)");
    
    const healthCareLabel = ylabelsGroup.append("text")
                                .attr("y", 0 - 20)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "healthcare")
                                .classed("active", true)
                                .classed("aText", true)
                                .text("Lacks Healthcare (%)");
    
    const smokeLabel = ylabelsGroup.append("text")
                                .attr("y", 0 - 40)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "smokes")
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Smokes (%)");
                                
    const obesityLabel = ylabelsGroup.append("text")
                                .attr("y", 0 - 60)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "obesity")
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Obese (%)");

     // updateToolTip function after csv import
     circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        console.log(`${value} click`)
        if (value !== chosenXaxis) {

            // replaces chosenXAxis with value
            chosenXaxis = value;
            console.log(chosenXaxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXaxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

             // updates texts with new x values
            txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

            // changes classes to change bold text
            if (chosenXaxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXaxis === "age"){
              povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
            else{
              povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
          // update tooltip with new info after changing x-axis 
          circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup); 
      }})
// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
// get value of selection
const value = d3.select(this).attr("value");
console.log(`${value} click`)
if (value !== chosenYaxis) {

    // replaces chosenXAxis with value
    chosenYaxis = value;
    console.log(chosenYaxis)

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(healthData, chosenYaxis);

    // updates x axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

     // updates texts with new x values
    txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

    // changes classes to change bold text
    if (chosenYaxis === "healthcare") {
      healthCareLabel
            .classed("active", true)
            .classed("inactive", false);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", false)
            .classed("inactive", true);
    }
    else if (chosenYaxis === "smokes"){
      healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
      smokeLabel
          .classed("active", true)
          .classed("inactive", false);
      obesityLabel
          .classed("active", false)
          .classed("inactive", true);
    }
    else{
      healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", true)
            .classed("inactive", false);  
    }
     // update tooltip with new info after changing y-axis 
     circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup); 
  }})

})()