var aacolor = d3.scale.ordinal()
	.range(['#CCFF00','#FFFF00','#FF0000','#FF0066','#00FF66','#FF9900','#0066FF',
		'#66FF00','#6600FF','#33FF00','#00FF00','#CC00FF','#FFCC00','#FF00CC',
		'#0000FF','#FF3300','#FF6600','#99FF00','#00CCFF','#00FFCC','#000000'])
	.domain(['A','C','D','E','F','G','H','I','K','L','M',
		'N','P','Q','R','S','T','V','W','Y','-']);
var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barwidth = 200,
	barheight = 20,
	barpadding = .1;
var barchartmargin = {top: 15, right: 10, bottom: 10, left: 50},
	barchartwidth = 250,
	barchartheight = 70;
		
var plac_scale = d3.scale.linear()
	.range([0, barwidth]);
var vac_scale = d3.scale.linear()
	.range([0, barwidth]);
		
/** With data in hand, make the visualization */
function generateVis(){
	
	plac_scale.domain([0, numplac]);
	vac_scale.domain([0, numvac]);
	
	generateSiteSelector();
}

function generateSiteSelector() {
	var margin = {top: 10, right: 30, bottom: 30, left: 30},
	width = 500 - margin.left - margin.right,
	height = 90 - margin.top - margin.bottom;
		
	var xLinScale = d3.scale.linear()
		.domain([0, vaccine.sequence.length])
		.range([0, width + margin.right + margin.left]);
		
	var yScale = d3.scale.linear()
		.domain([0, 1])
		.range([height, 0]);
		
	var xLinAxis = d3.svg.axis()
		.scale(xLinScale)
		.orient("bottom");
		
	var linzoom = d3.behavior.zoom().x(xLinScale).scaleExtent([1,100]).on("zoom", linrefresh);
	
	var seqchart = d3.select("#overview").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.attr("id", "seqchart")
	  .append("g")
	  	.attr("id", "seqchartg")
		.attr("width", width + margin.right)
	    .attr("height", height + margin.bottom)
	  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .call(linzoom);
	
	seqchart.append("rect")
	    .attr("class", "overlay")
		.attr("transform", "translate(" + (-margin.left) + "," + (-margin.top) + ")")
	    .attr("width", width + margin.right + margin.left)
	    .attr("height", height + margin.bottom + margin.top);
		
	var barwidth = xLinScale.range()[1] / d3.max(xLinScale.domain()) - 0 * (d3.max(xLinScale.domain()) - 1);
			  // = totalwidth/numbars - barspacing*(numbars-1)
		
	var linsitebars = seqchart.selectAll(".linsitebars")
	    .data(vaccine.sequence)
	  .enter().append("rect")
	    .attr("x", function (d,i) { return xLinScale(i) - barwidth/2; })
		.attr("y", yScale(1))
		.attr("width", barwidth)
		.attr("height", height - yScale(1))
		.attr("fill", function (d) {
			return aacolor(d);
		});
		
	seqchart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height + 5) + ")")
		.call(xLinAxis);
	
	function linrefresh() {
		linsitebars.attr("transform", "translate(" + d3.event.translate[0]+", 0)scale(" + d3.event.scale + ", 1)");
		seqchart.select(".x.axis").call(xLinAxis);
	}
}