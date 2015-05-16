var aacolor = d3.scale.ordinal()
	.range(['#CCFF00','#FFFF00','#FF0000','#FF0066','#00FF66','#FF9900','#0066FF',
		'#66FF00','#6600FF','#33FF00','#00FF00','#CC00FF','#FFCC00','#FF00CC',
		'#0000FF','#FF3300','#FF6600','#99FF00','#00CCFF','#00FFCC'])
	.domain(['A','C','D','E','F','G','H','I','K','L','M',
		'N','P','Q','R','S','T','V','W','Y']);
		
/** With data in hand, make the visualization */
function generateVis(){
	generateSiteSelector();
}

function generateSiteSelector() {
	var width = 960,
	    height = 500;
	
	var randomX = d3.random.normal(width / 2, 80),
	    randomY = d3.random.normal(height / 2, 80);
	
	var data = d3.range(2000).map(function() {
	  return [
	    randomX(),
	    randomY()
	  ];
	});
	
	//
	var xScale = d3.scale.ordinal()
		.domain(d3.range(vaccine.sequence.length))
		.rangeBands([0,width], 0.05);
		
	var yScale = d3.scale.linear()
		.domain([0, 1])
		.range([height, 0]);
	/*
	var exScale = d3.scale.linear()
	    .domain([0, width])
	    .range([0, width]);
	
	var eyScale = d3.scale.linear()
	    .domain([0, height])
	    .range([height, 0]);*/
	
	var svg = d3.select("#overview").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .call(d3.behavior.zoom().x(xScale).y(eyScale).scaleExtent([1, 8]).on("zoom", zoom));
	
	svg.append("rect")
	    .attr("class", "overlay")
	    .attr("width", width)
	    .attr("height", height);
	
	/*var circle = svg.selectAll("circle")
	    .data(data)
	  .enter().append("circle")
	    .attr("r", 2.5)
	    .attr("transform", transform);*/
		
	var rectangle = svg.selectAll("rect")
		.data(vaccine.sequence)
		.enter().append("rect")
		  .attr("x", function (d,i) { return xScale(i); })
		  .attr("y", yScale(0) );
	
	/*function zoom() {
	  circle.attr("transform", transform);
	}
	
	function transform(d) {
	  return "translate(" + exScale(d[0]) + "," + eyScale(d[1]) + ")";
	}*/
	
	function zoom() {
	  rectangle.attr("transform", transform);
	}
	
	function transform(d, i) {
	  return "translate(" + xScale(i) + "," + yScale(0) + ")";
	}
}