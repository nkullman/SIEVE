 plot_margin = {
      top: 10,
      right: 20,
      bottom: 40,
      left: 20,
      middle: 20
};

var plot_width = 200,
    plot_height = 190;

var box_width = 70,
    box_height = 170;

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
  // Draw box plot for the first time
  var leftmargin = 70;
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
  
  var yscale = d3.scale.linear()
    .domain([0, Math.max(d3.max(distData[0]), d3.max(distData[1]))])
    .range([box_height, 0])
    .nice();
  
  var xscale = d3.scale.ordinal()
    .domain([0, 1])
    .rangeRoundPoints([20, 100]);
  
  var yaxis = d3.svg.axis()
    .scale(yscale)
    .orient("left");
  
  var xaxis = d3.svg.axis()
    .scale(xscale)
    .orient("bottom")
    .tickFormat(function(d) { return ["Vaccine Group<br>(N="+numvac+")", "Placebo Group<br>(N="+numplac+")"][d]; });
  
  boxplot_svg.selectAll(".box")
    .data(distData)
    .enter().append("g")
      .attr("class", "box")
      .attr("transform", function(d, i) {return translation(xscale(i)+leftmargin,0); })
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
      .attr("y", yscale(q3))
      .attr("x", -box_width/2)
      .attr("height", yscale(q1)-yscale(q3))
      .attr("width", box_width);
      
    box.append("line")
      .attr("class", "median")
      .attr("y1", yscale(q2))
      .attr("y2", yscale(q2))
      .attr("x1", -box_width/2)
      .attr("x2", box_width/2);
    
    box.append("line")
      .attr("class", "outer25 high")
      .attr("y1", yscale(q3))
      .attr("y2", yscale(q4));
    box.append("line")
      .attr("class", "outer25 low")
      .attr("y1", yscale(q0))
      .attr("y2", yscale(q1));
    box.append("line")
      .attr("class", "whisker low")
      .attr("y1", yscale(q0))
      .attr("y2", yscale(q0))
      .attr("x1", -box_width/2)
      .attr("x2", box_width/2);
      box.append("line")
      .attr("class", "whisker high")
      .attr("y1", yscale(q4))
      .attr("y2", yscale(q4))
      .attr("x1", -box_width/2)
      .attr("x2", box_width/2);
      
      var boxplotpoint = box.selectAll(".boxplotpoint")
        .data(data)
        .enter().append("circle")
          .attr("class", "boxplotpoint")
          .attr("cy", function(d) {return yscale(d) + Math.random()*(box_width/8)-(box_width/16);})
          .attr("cx", function(d) {return xscale(d) - box_width/2 + Math.random()*(box_width/8);})
          .attr("r", box_width/16);
  }
  
  boxplot_svg.append("g")
    .attr("transform", translation(leftmargin-box_width/2, 0))
    .attr("class", "ybox axis")
    .call(yaxis)
    .append("text")
      .attr("text-anchor", "end")
      .attr("y", -leftmargin/2)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Number of Mismatches");
  
  boxplot_svg.append("g")
    .attr("class", "xbox axis")
    .attr("transform", translation(leftmargin, yscale.range()[0]+10))
    .call(xaxis);
    
}

function updateBoxplot(sites){

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
    
  var yscale = d3.scale.linear()
    .domain([0, Math.max(d3.max(distData[0]), d3.max(distData[1]))])
    .range([box_height, 0])
    .nice();
  
  var xscale = d3.scale.ordinal()
    .domain([0, 1])
    .rangeRoundPoints([20, 100]);
  
  var yaxis = d3.svg.axis()
    .scale(yscale)
    .orient("left");
  
  var xaxis = d3.svg.axis()
    .scale(xscale)
    .orient("bottom")
    .tickFormat(function(d) { return ["Vaccine Group<br>(N="+numvac+")", "Placebo Group<br>(N="+numplac+")"][d]; });
    
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
      .attr("y", yscale(q3))
      .attr("x", -box_width/2)
      .attr("height", yscale(q1)-yscale(q3))
      .attr("width", box_width);
      
    box.select(".median").transition()
      .attr("y1", yscale(q2))
      .attr("y2", yscale(q2))
      .attr("x1", -box_width/2)
      .attr("x2", box_width/2);
    
    box.select(".outer25.high").transition()
      .attr("y1", yscale(q3))
      .attr("y2", yscale(q4));
    box.select(".outer25.low").transition()
      .attr("y1", yscale(q0))
      .attr("y2", yscale(q1));
    box.select(".whisker.low").transition()
      .attr("y1", yscale(q0))
      .attr("y2", yscale(q0))
      .attr("x1", -box_width/2)
      .attr("x2", box_width/2);
    box.select(".whisker.high").transition()
      .attr("y1", yscale(q4))
      .attr("y2", yscale(q4))
      .attr("x1", -box_width/2)
      .attr("x2", box_width/2);
      
      var boxplotpoint = box.selectAll(".boxplotpoint")
        .data(data);
      
      boxplotpoint
        .attr("cy",  function(d) {return yscale(d) + Math.random()*(box_width/8)-(box_width/16);})
      boxplotpoint.exit()
        .attr("opacity", 0)
        .remove();
      boxplotpoint.enter().append("circle")
          .attr("class", "boxplotpoint")
          .attr("cy",  function(d) {return yscale(d) + Math.random()*(box_width/8)-(box_width/16);})
          .attr("cx", function(d) {return xscale(d) - box_width/2 + Math.random()*(box_width/8);})
          .attr("r", box_width/16);
    }
  
}

function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';
}
  
function id(d){
  return d.mismatches;
}
