var mismatchmode = 0 //0 = pyramid, 1 = box plot

var pyramid_margin = {
      top: 50,
      right: 20,
      bottom: 24,
      left: 25,
      middle: 20
};

var pyramid_width = 400,
    pyramid_height = 150;

// CREATE SVG
var pyramid_svg = d3.select('#group').append('svg')
      .attr('width', pyramid_margin.left + pyramid_width + pyramid_margin.right)
      .attr('height', pyramid_margin.top + pyramid_height + pyramid_margin.bottom)
      // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
      .append('g')
        .attr('transform', translation(pyramid_margin.left, pyramid_margin.top));

function updatePyramid(sites){
    var possiblecounts = [];
    for(var patient in seqID_lookup){
      if(seqID_lookup[patient].mismatch != undefined){
        var mmcount = 0;
        for(var i = 0; i < sites.length; i++){
            mmcount += seqID_lookup[patient].mismatch[sites[i]]; 
        }
      }
      possiblecounts.push(mmcount);
    }
    var mincounts = d3.min(possiblecounts);
    var maxcounts = d3.max(possiblecounts);
    var skipcount = Math.ceil((maxcounts-mincounts)/16);
    var tickvals = d3.range(mincounts,maxcounts+1).filter(function(d,i){return (i % skipcount === 0)});
    var mdata = [];
    
    for(var i = 0; i < d3.max(possiblecounts)+1; i++){
        mdata.push({mismatches:i.toString(), vaccine:0, placebo:0});
        }
    for(var patient in seqID_lookup){
        if(seqID_lookup[patient].mismatch != undefined){
          mmcount = 0;
          for(var i = 0; i < sites.length; i++){
              mmcount += seqID_lookup[patient].mismatch[sites[i]]; 
          }
          if(seqID_lookup[patient].vaccine){
              mdata[mmcount].vaccine += 1;
          } else {
              mdata[mmcount].placebo += 1;
          }
        }  
    }
  var maxValue = Math.max(
    d3.max(mdata, function(d) { return d.vaccine/numvac; }),
    d3.max(mdata, function(d) { return d.placebo/numplac; })
  );
  if (mismatchmode == 0)
  {
    // the width of each side of the chart
  var regionWidth = pyramid_width/2 - pyramid_margin.middle;

    // these are the x-coordinates of the y-axes
  var pointA = regionWidth,
        pointB = pyramid_width - regionWidth;
    
  var xScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, regionWidth])
      .nice();
   
  var yScale = d3.scale.ordinal()
      .domain(d3.range(mincounts,maxcounts+1))
      .rangeRoundBands([pyramid_height,0],0.1);

  var yAxisLeft = d3.svg.axis()
      .scale(yScale)
      .orient('right')
      .tickValues(tickvals)
      .tickSize(4,0)
      .tickPadding(pyramid_margin.middle-4);

  var yAxisRight = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .tickValues(tickvals)
      .tickSize(4,0)
      .tickFormat('');
      
  var xAxisRight = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(5)
      .tickFormat(d3.format(''));

  var xAxisLeft = d3.svg.axis()
      .scale(xScale.copy().range([pointA, 0]))
      .orient('bottom')
      .ticks(5)
      .tickFormat(d3.format(''));
      
  pyramid_svg.select(".axis.y.left")
            .transition()
            .call(yAxisLeft)
            .selectAll('text')
            .style('text-anchor', 'middle');
            
  pyramid_svg.select('.axis.y.right')
            .transition()
            .call(yAxisRight);
            
  pyramid_svg.transition()
            .select('.axis.x.left')
            .call(xAxisLeft);
  
  pyramid_svg.select('.axis.x.right')
            .transition()
            .call(xAxisRight);
            
  var leftBars = pyramid_svg.select('.lgroup')
                           .selectAll('.bar.left')
                           .data(mdata,id);
  leftBars.exit().remove();
  
  var rightBars = pyramid_svg.select('.rgroup')
                            .selectAll('.bar.right')
                            .data(mdata,id);
  rightBars.exit().remove();
  leftBars.enter().append('rect')
        .attr('class','bar left')
        .attr('x', 0)
        .attr('y', function(d) {return yScale(d.mismatches); })
        .attr('width', function(d) {return xScale(d.vaccine / numvac); })
        .attr('height', yScale.rangeBand())
        .style("fill","red");
        
  rightBars.enter().append('rect')
        .attr('class','bar right')
        .attr('x', 0)
        .attr('y', function(d) {return yScale(d.mismatches); })
        .attr('width', function(d) {return xScale(d.vaccine / numvac); })
        .attr('height', yScale.rangeBand())
        .style("fill","steelblue");
  leftBars.transition()
          .attr('y', function(d) {return yScale(d.mismatches); })
          .attr('width', function(d) {return xScale(d.vaccine / numvac); })
          .attr('height', yScale.rangeBand());


  rightBars.transition()
           .attr('y', function(d) {return yScale(d.mismatches); })
           .attr('width', function(d) { return xScale(d.placebo / numplac); })
           .attr('height', yScale.rangeBand()); 
  }        
}
function drawPyramid(sites){
    var possiblecounts = [];
    for(var patient in seqID_lookup){
      if(seqID_lookup[patient].mismatch != undefined){
        mmcount = 0;
        for(var i = 0; i < sites.length; i++){
            mmcount += seqID_lookup[patient].mismatch[sites[i]]; 
        }
      }
      possiblecounts.push(mmcount);
    }
    
    mmdata = [];
    for(var i = 0; i < sites.length+1; i++){
        mmdata.push({mismatches:i.toString(), vaccine:0, placebo:0});
        }
    for(var patient in seqID_lookup){
        if(seqID_lookup[patient].mismatch != undefined){
          mmcount = 0;
          for(var i = 0; i < sites.length; i++){
              mmcount += seqID_lookup[patient].mismatch[sites[i]]; 
          }
          if(seqID_lookup[patient].vaccine){
              mmdata[mmcount].vaccine += 1;
          } else {
              mmdata[mmcount].placebo += 1;
          }
        }
        
    }
        
    // the width of each side of the chart
    var regionWidth = pyramid_width/2 - pyramid_margin.middle;

    // these are the x-coordinates of the y-axes
    var pointA = regionWidth,
        pointB = pyramid_width - regionWidth; 
    
    // the xScale goes from 0 to the width of a region
    //  it will be reversed for the left x-axis
    var xScale = d3.scale.linear()
      .domain([0, 1])
      .range([0, regionWidth])
      .nice();

    var xScaleLeft = d3.scale.linear()
      .domain([0, 1])
      .range([regionWidth, 0]);

    var xScaleRight = d3.scale.linear()
      .domain([0, 1])
      .range([0, regionWidth]);

    var yScale = d3.scale.ordinal()
      .domain(mmdata.map(function(d) { return d.mismatches; }))
      .rangeRoundBands([pyramid_height,0], 0.1);

    var yAxisLeft = d3.svg.axis()
      .scale(yScale)
      .orient('right')
      .ticks(18)
      .tickSize(4,0)
      .tickPadding(pyramid_margin.middle-4);

    var yAxisRight = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(18)
      .tickSize(4,0)
      .tickFormat('');

    var xAxisRight = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(5)
      .tickFormat(d3.format(''));

    var xAxisLeft = d3.svg.axis()
      .scale(xScale.copy().range([pointA, 0]))
      .orient('bottom')
      .ticks(5)
      .tickFormat(d3.format(''));

    var leftBarGroup = pyramid_svg.append('g')
      .attr('class', 'lgroup')
      .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = pyramid_svg.append('g')
      .attr('class', 'rgroup')
      .attr('transform', translation(pointB, 0));

    pyramid_svg.append('g')
      .attr('class', 'axis y left')
      .attr('transform', translation(pointA, 0))
      .call(yAxisLeft)
      .selectAll('text')
      .style('text-anchor', 'middle');

    pyramid_svg.append('g')
      .attr('class', 'axis y right')
      .attr('transform', translation(pointB, 0))
      .call(yAxisRight);
     
     // draw title
    pyramid_svg.append("text")
      .attr("x",pyramid_width/2)
      .attr("y",-30)
      .style("text-anchor","middle")
      .style("font-size","15px")
      .text("Distribution of Mismatch Counts Across Selected Sites");
    // labels etc.  
    pyramid_svg.append('text')
      .text("Vaccine Group")
      .attr('x',0)
      .attr('y',0);
    pyramid_svg.append('text')
      .text("Placebo Group")
      .attr('x',330)
      .attr('y',0);
      
    pyramid_svg.append("text")
      .text("Number of Mismatches")
      .attr("x",pyramid_width/2)
      .attr("y",-2)
      .style("text-anchor","middle");

    pyramid_svg.append('g')
      .attr('class', 'axis x left')
      .attr('transform', translation(0, pyramid_height))
      .text("Vaccine Group")
      .call(xAxisLeft);

    pyramid_svg.append('g')
      .attr('class', 'axis x right')
      .attr('transform', translation(pointB, pyramid_height))
      .call(xAxisRight);

    leftBarGroup.selectAll('.bar.left')
      .data(mmdata)
      .enter().append('rect')
        .attr('class', 'bar left')
        .attr('x', 0)
        .attr('y', function(d) {return yScale(d.mismatches); })
        .attr('width', function(d) { return xScale(d.vaccine / numvac); })
        .attr('height', yScale.rangeBand())
        .style("fill","red");

    rightBarGroup.selectAll('.bar.right')
      .data(mmdata)
      .enter().append('rect')
        .attr('class', 'bar right')
        .attr('x', 0)
        .attr('y', function(d) { return yScale(d.mismatches); })
        .attr('width', function(d) { return xScale(d.placebo / numplac); })
        .attr('height', yScale.rangeBand()).style("fill","steelblue");
    }
function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';
  }
  
 function id(d){
   return d.mismatches;
 }