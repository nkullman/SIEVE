var plot_margin = {
      top: 30,
      right: 20,
      bottom: 40,
      left: 20,
      middle: 20
};

var plot_width = 300,
    plot_height = 150;

var box_width = 225,
    box_height = 50;

// CREATE SVG
var boxplot_svg = d3.select('.group-box-bar-plot').append('svg')
      .attr("version", "1.1")
      .attr('viewBox', "0 0 " + (plot_margin.left + plot_width + plot_margin.right) + " " + (plot_margin.top + plot_height + plot_margin.bottom))
      .attr('preserveAspectRatio',"xMinYMin meet")
      .attr("class", "svg-content")
      // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
      .append('g')
        .attr('transform', translation(plot_margin.left, plot_margin.top));

function drawBoxplot(sites)
{
  //Create box plot for the first time (instead of updating as in updatePyramid())
  var leftmargin = 75;
  var distData = [[],[]];
  var participantDistances = dists[0].values;
    
  for(var participantIdx = 0; participantIdx < participantDistances.length; participantIdx++){
    if (seqID_lookup[participantDistances[participantIdx].key] !== undefined){
      var distTot = d3.sum(sites.map(function(d) { return +participantDistances[participantIdx].values[d]; }));
      if (seqID_lookup[participantDistances[participantIdx].key].vaccine)
      {
        distData[0].push(distTot);
      } else {
        distData[1].push(distTot);
      }
    }
  }
  
  var xscale = d3.scale.linear()
    .domain([0, Math.max(d3.max(distData[0]), d3.max(distData[1]))])
    .range([0, box_width])
    .nice();
  
  var yscale = d3.scale.ordinal()
    .domain([0, 1])
    .rangeRoundPoints([20, 100]);
  
  var xaxis = d3.svg.axis()
    .scale(xscale)
    .orient("bottom");
  
  var yaxis = d3.svg.axis()
    .scale(yscale)
    .orient("left")
    .tickFormat(function(d) { return ["Vaccine Group", "Placebo Group"][d]; });
  
  boxplot_svg.selectAll(".box")
    .data(distData)
    .enter().append("g")
      .attr("class", "box")
      .attr("transform", function(d, i) {return translation(leftmargin, yscale(i)); })
      .each(create_box);
  function create_box(d, i)
  {
    var box = d3.select(this);
    var arr = d.sort(d3.ascending);
    var q1 = d3.quantile(arr, .25),
      q2 = d3.quantile(arr, .5),
      q3 = d3.quantile(arr, .75);
    
    var lower_cutoff = q2 - 1.5*(q3-q1);
    var upper_cutoff = q2 + 1.5*(q3-q1);
    
    var outliers = arr.splice(0, _.sortedIndex(arr, lower_cutoff-.25)) //remove and save lower outliers
    outliers = outliers.concat(arr.splice(_.sortedIndex(arr, upper_cutoff+.25), Infinity)) //remove upper outliers
    
    var data = d.concat(outliers);
    var q0 = arr[0];
    var q4 = arr[arr.length-1];
    
    box.append("rect")
      .attr("class", "middle50")
      .attr("x", xscale(q1))
      .attr("y", -box_height/2)
      .attr("width", xscale(q3-q1))
      .attr("height", box_height);
      
    box.append("line")
      .attr("class", "median")
      .attr("x1", xscale(q2))
      .attr("x2", xscale(q2))
      .attr("y1", -box_height/2)
      .attr("y2", box_height/2);
    
    box.append("line")
      .attr("class", "outer25 high")
      .attr("x1", xscale(q3))
      .attr("x2", xscale(q4));
    box.append("line")
      .attr("class", "outer25 low")
      .attr("x1", xscale(q0))
      .attr("x2", xscale(q1));
    box.append("line")
      .attr("class", "whisker low")
      .attr("x1", xscale(q0))
      .attr("x2", xscale(q0))
      .attr("y1", -box_height/2)
      .attr("y2", box_height/2);
      box.append("line")
      .attr("class", "whisker high")
      .attr("x1", xscale(q4))
      .attr("x2", xscale(q4))
      .attr("y1", -box_height/2)
      .attr("y2", box_height/2);
      
      var boxplotpoint = box.selectAll(".boxplotpoint")
        .data(data)
        .enter().append("circle")
          .attr("class", "boxplotpoint")
          .attr("cx", function(d) {return xscale(d) + Math.random()*(box_height/8)-(box_height/16);})
          .attr("cy", function(d) {return yscale(d) - box_height/2 + Math.random()*(box_height/8);})
          .attr("r", box_height/16);
  }
  
  boxplot_svg.append("g")
    .attr("transform", translation(leftmargin, yscale(1)+box_height/2+10))
    .attr("class", "xbox axis")
    .call(xaxis)
    .append("text")
      .attr("transform", translation(xscale.range()[1]/2, 30))
      .style("text-anchor", "middle")
      .text("Number of Mismatches");
  
  boxplot_svg.append("g")
    .attr("class", "ybox axis")
    .attr("transform", translation(leftmargin-10, 0))
    .call(yaxis);
}

function updatePyramid(sites){
  /*  Updates either the pyramid or the box plot, whichever mode is selected
      using data from the selected sites. In each case, smoothly translate the chart
      as sites are selected or deselected (though the stats are recomputed entirely each time)
      The relevant data in each case is the number of mismatches each participant has with the
      vaccine sequence at the selected sites.*/
      
    //update box plot
    var distData = [[],[]]; 
    //mmdata[0] = array of the count of mismatches for each vaccine-recieving participant in selected region
    //mmdata[1] = same for placebo participants    
    var participantDistances = dists[0].values;
    
    for(var participantIdx = 0; participantIdx < participantDistances.length; participantIdx++){
      if (seqID_lookup[participantDistances[participantIdx].key] !== undefined){
        var distTot = d3.sum(sites.map(function(d) { return +participantDistances[participantIdx].values[d]; }));
        if (seqID_lookup[participantDistances[participantIdx].key].vaccine)
        {
          distData[0].push(distTot);
        } else {
          distData[1].push(distTot);
        }
      }
    }
    
    var xscale = d3.scale.linear()
      .domain([0, Math.max(d3.max(distData[0]), d3.max(distData[1]))])
      .range([0, box_width])
      .nice(); 
    var yscale = d3.scale.ordinal()
      .domain([0, 1])
      .rangePoints([20, 100]);
    var xaxis = d3.svg.axis()
      .scale(xscale)
      .orient("bottom");
    var yaxis = d3.svg.axis()
      .scale(yscale)
      .orient("left")
      .tickFormat(function(d) { return ["Vaccine", "Placebo"][d]; });
    
    boxplot_svg.select(".xbox")
      .transition()
      .call(xaxis);
    boxplot_svg.select(".ybox")
      .transition()
      .call(yaxis);
    
    boxplot_svg.selectAll(".box")
      .data(distData)
      .each(update_box);
    
    function update_box(d, i)
    {  
      /*  Computes the necessary statistics and updates the
          box plot as necessary */
      var box = d3.select(this);
      var arr = d.sort(d3.ascending);
      var q1 = d3.quantile(arr, .25),
        q2 = d3.quantile(arr, .5),
        q3 = d3.quantile(arr, .75);
        
      var lower_cutoff = q2 - 1.5*(q3-q1);
      var upper_cutoff = q2 + 1.5*(q3-q1);
    
      var outliers = arr.splice(0, _.sortedIndex(arr, lower_cutoff-.25)) //remove and save lower outliers
      outliers = outliers.concat(arr.splice(_.sortedIndex(arr, upper_cutoff+.25), Infinity)) //remove upper outliers
    
      var data = d.concat(outliers);
      var q0 = arr[0];
      var q4 = arr[arr.length-1];
    
      
     box.select(".middle50").transition()
      .attr("x", xscale(q1))
      .attr("y", -box_height/2)
      .attr("width", xscale(q3-q1))
      .attr("height", box_height);
      
    box.select(".median").transition()
      .attr("x1", xscale(q2))
      .attr("x2", xscale(q2))
      .attr("y1", -box_height/2)
      .attr("y2", box_height/2);
    
    box.select(".outer25.high").transition()
      .attr("x1", xscale(q3))
      .attr("x2", xscale(q4));
    box.select(".outer25.low").transition()
      .attr("x1", xscale(q0))
      .attr("x2", xscale(q1));
    box.select(".whisker.low").transition()
      .attr("x1", xscale(q0))
      .attr("x2", xscale(q0))
      .attr("y1", -box_height/2)
      .attr("y2", box_height/2);
    box.select(".whisker.high").transition()
      .attr("x1", xscale(q4))
      .attr("x2", xscale(q4))
      .attr("y1", -box_height/2)
      .attr("y2", box_height/2);
      
      var boxplotpoint = box.selectAll(".boxplotpoint")
        .data(data);
      
      boxplotpoint
        .attr("cx",  function(d) {return xscale(d) + Math.random()*(box_height/8)-(box_height/16);})
      boxplotpoint.exit()
        .attr("opacity", 0)
        .remove();
      boxplotpoint.enter().append("circle")
          .attr("class", "boxplotpoint")
          .attr("cx",  function(d) {return xscale(d) + Math.random()*(box_height/8)-(box_height/16);})
          .attr("cy", function(d) {return yscale(d) - box_height/2 + Math.random()*(box_height/8);})
          .attr("r", box_height/16);
    }
  
  if (selected_sites.length === 0) {d3.selectAll(".bar.left,.bar.right").remove();}        
}
function drawPyramid(sites){
    drawBoxplot(sites);
}

function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';
}
  
function id(d){
  return d.mismatches;
}
