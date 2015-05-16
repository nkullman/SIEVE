var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barwidth = 200,
	barheight = 20,
	barpadding = .1;
var barchartmargin = {top: 5, right: 10, bottom: 10, left: 50},
	barchartwidth = 250,
	barchartheight = 70;

var nplac = 66; //TODO: write these as part of text parsing
var nvac = 43;
	
var plac_scale = d3.scale.linear()
	.range([0, barwidth])
	.domain([0, nplac]);

var vac_scale = d3.scale.linear()
	.range([0, barwidth])
	.domain([0, nvac]);

var group_axis = d3.svg.axis()
	.scale(d3.scale.ordinal()
		.domain(["Vaccine", "Placebo"])
		.rangeRoundPoints([15,40]))
	.orient("left");

var mismatch_axis = d3.svg.axis()
	.scale(d3.scale.linear()
		.domain([0,100])
		.range([0, barwidth]))
	.orient("bottom")
	.ticks(5);

var sites_svg = d3.select("#sites")
	.append("svg")
	.attr("width", barchartwidth + barchartmargin.left + barchartmargin.right)
	.attr("height", 0);

function create_selected_AAsites(sites)
{
	var AAsites = sites_svg.selectAll(".AAsite")
		.data(sites, function(d) { return d; });
	sites_svg.transition()
		.attr("height", AAsites[0].length*(barchartheight + barchartmargin.top + barchartmargin.bottom));
	
	AAsites.transition()
		.attr("transform", AAsite_translate);
	
	AAsites.exit().transition()
		.attr("transform", function(d, i) { return AAsite_shrink(d,i+1); })
		.remove();
		
	AAsites.enter().append("g")
		.attr("class", "AAsite")
		.attr("transform", AAsite_shrink)
		.each(create_AAsite_chart)
		.transition()
		.attr("transform", AAsite_translate);
}

function create_AAsite_chart(site)
{
	//Create a viz of two stacked horizontal stacked bar charts.
	//Passed the location to append viz and the index of the site of interest
	var vacnest = d3.nest()
	//count aas of each type at this site
		.key(function(d) { return d; })
		.rollup(function(d) { return d.length; })
		.entries(sequences.vaccine[site].filter(function(d) {
			return d != vaccine.sequence[site];
		}));
	var placnest = d3.nest()
		.key(function(d, i) { return d; })
		.rollup(function(d) { return d.length; })
		.entries(sequences.placebo[site].filter(function(d) {
			return d!= vaccine.sequence[site];
		}));
	svg = d3.select(this);
	
	svg.append("g")
		.attr("class", "group axis")
		.call(group_axis);
	create_stacked_bar(svg, vacnest, vac_scale, 0);
	create_stacked_bar(svg, placnest, plac_scale, 25);
	svg.append("g")
		.attr("transform", "translate(10,55)")
		.attr("class", "mismatch axis")
		.call(mismatch_axis);
}

function create_stacked_bar(svg, nest, scale, yloc)
{
	var bar = svg.append("g")
		.attr("width", barwidth + barmargin.left + barmargin.right)
		.attr("height", barheight + barmargin.top + barmargin.bottom)
		.append("g")
			.attr("transform", "translate(" + barmargin.left + "," + (barmargin.top+yloc) + ")");
	var sum = 0;
	nest.forEach(function(d)
	{
		d.x0 = sum;
		sum += d.values;
		d.x1 = sum;
	});
	
	bar.selectAll("rect")
		.data(nest)
		.enter().append("rect")
		.attr("x", function(d) {return scale(d.x0);})
		.attr("height", barheight)
		.attr("width", function(d) {return scale(d.x1) - scale(d.x0);})
		.style("fill", function(d) {return aacolor(d.key);});
}

function AAsite_translate(d, i)
{
	return "translate(" + barchartmargin.left + "," + (i * (barchartheight + barchartmargin.top + barchartmargin.bottom) + barchartmargin.top) + ") scale(1,1)"; 
}

function AAsite_shrink(d, i)
{
	return "translate(" + barchartmargin.left + "," + (i * (barchartheight + barchartmargin.top + barchartmargin.bottom) + barchartmargin.top) + ") scale(1,0)";
}