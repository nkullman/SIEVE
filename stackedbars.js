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
	
function create_AAsite_div(site)
{
	//Create a div to put a AA site chart then put the chart inside
	var location = d3.select("#sites")
		.append("div")
		.attr("id", site)
		.attr("class", "AAsite");
	create_AAsite_chart(location, site);
}

function create_AAsite_chart(location, site)
{
	//Create a viz of two stacked horizontal stacked bar charts.
	//Passed the location to append viz and the index of the site of interest
	var vacnest = d3.nest()
	//count aas of each type at this site
		.key(function(d) { return d; })
		.rollup(function(d) { return d.length; })
		.entries(sequences[0].values[site].filter(function(d) {
			return d != vaccine.sequence[site];
		}));
	var placnest = d3.nest()
		.key(function(d, i) { return d; })
		.rollup(function(d) { return d.length; })
		.entries(sequences[1].values[site].filter(function(d) {
			return d!= vaccine.sequence[site];
		}));
	
	var svg = location.append("svg")
		.attr("width", barchartwidth + barchartmargin.left + barchartmargin.right)
		.attr("height", barchartheight + barchartmargin.top + barchartmargin.bottom)
		.append("g")
			.attr("transform", "translate(" + barchartmargin.left + "," + barchartmargin.top + ")");
	
	create_stacked_bar(svg, vacnest, barchartheight/3)
	create_stacked_bar(svg, placnest, 2*barchartheight/3)
}

function create_stacked_bar(svg, nest, yloc)
{
	var bar = svg.append("g")
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