var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barwidth = 200,
	barheight = 20,
	barpadding = .1;
var barchartmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barchartwidth = 250,
	barchartheight = 50;

var nplac = 75; //TODO: write these as part of text parsing
var nvac = 56;
	
var plac_scale = d3.scale.linear()
	.range([0, barwidth])
	.domain([0, nplac]);

var vac_scale = d3.scale.linear()
	.range([0, barwidth])
	.domain([0, nvac]);
	
var group_scale = d3.scale.ordinal()
	.domain(["PLACEBO","VACCINE"])
	.rangeRoundPoints([0,barchartheight]);

function create_AAsite_chart(location, site)
{
	//Create a viz of two stacked horizontal stacked bar charts.
	//Passed the location to append viz and the index of the site of interest
	var nest = d3.nest()
	//count aas of each type at this site
		.key(function(d, i) { return seqID[i]; }) //TODO: should return vac/plac
		.key(function(d, i) { return d[i]; })
		.rollup(function(d) { return d.length; })
		.entries(seqID_aa[site]); //TODO: should filter out matches of vaccine seq
	
	var svg = location.append("svg")
		.attr("width", barchartwidth + barchartmargin.left + barchartmargin.right)
		.attr("height", barchartheight + barchartmargin.top + barchartmargin.bottom)
		.append("g")
			.attr("transform", "translate(" + barchartmargin.left + "," + barchartmargin.top + ")");
}

function create_stacked_bar(location, nest, num_patients)
{
	var scale = d3.scale.linear()
		.range([0, barwidth])
		.domain([0, num_patients]);
	var axis = d3.svg.axis()
		.scale(scale)
		.orient("bottom");
	var svg = location.append("svg")
		.attr("width", barwidth + barmargin.left + barmargin.right)
		.attr("height", barheight + barmargin.top + barmargin.bottom)
		.append("g")
			.attr("transform", "translate(" + barmargin.left + "," + barmargin.top + ")");
	var sum = 0;
	nest.forEach(function(d)
	{
		d.x0 = sum;
		sum += d.values;
		d.x1 = sum;
	});
	
	svg.selectAll("rect")
		.data(nest)
		.enter().append("rect")
		.attr("x", function(d) {return scale(d.x0);})
		.attr("height", barheight)
		.attr("width", function(d) {return scale(d.x1) - scale(d.x0);})
		.style("fill", function(d) {return aacolor(d.key);});
		
	return svg;
}