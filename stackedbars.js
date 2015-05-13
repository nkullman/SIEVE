var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barwidth = 200,
	barheight = 20;


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