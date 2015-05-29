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
var barchartmargin = {top: 15, right: 100, bottom: 10, left: 50},
	barchartwidth = 250,
	barchartheight = 70;
var pcutoff = .3; //largest p-value to plot at all
		
var plac_scale = d3.scale.linear()
	.range([0, barwidth]);
var vac_scale = d3.scale.linear()
	.range([0, barwidth]);
	
var selected_sites = [];

var mouse_down = false;
var shift_down = false;

			

// clear selecting mode even if you release your mouse elsewhere.
d3.select(window).on("mouseup", function(){ mouse_down = false; });
// maintain record of shift depression
d3.select(window).on("keydown", function () {shift_down = d3.event.shiftKey || d3.event.metaKey; });
d3.select(window).on("keyup", function () {shift_down = d3.event.shiftKey || d3.event.metaKey; });
		
/** Generate visualization */
function generateVis(){
	
	plac_scale.domain([0, numplac]);
	vac_scale.domain([0, numvac]);
	
	generateSiteSelector();
	drawPyramid([]);
  generateTable();
}

function generateSiteSelector() {
  window.margin =  {top: 10, right: 20, bottom: 30, left: 20};
  window.width = 780 - margin.left - margin.right;
  window.width = 500 - margin.left - margin.right;
  window.height =  110 - margin.top - margin.bottom;
  
  window.xScale = d3.scale.linear()
    .domain([0, vaccine.sequence.length-1])
    .range([0, width]);
	
  window.yScale = d3.scale.linear()
    .domain([0, 1])
    .range([height, 0]);
	
	window.xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");
			
	window.sitebarwidth = xScale.range()[1] / d3.max(xScale.domain());
			// = totalwidth/numbars
	
	window.zoom = d3.behavior.zoom().x(xScale).scaleExtent([1,100]).on("zoom", refresh);
	
	var siteselSVG = d3.select("#overview").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.attr("id", "siteselSVG")
		.append("g")
		.attr("id", "siteselSVGg")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		.call(zoom);
		
	siteselSVG.append("rect")
		.attr("class", "overlay")
		.attr("transform", "translate(" + (-margin.left) + ", " + (-margin.top) + ")")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		
	window.sitebars = siteselSVG.selectAll(".sitebars")
	    .data(vaccine.sequence)
    
	sitebars.enter().append("rect")
    .attr("class","sitebars")
	  .attr("x", function (d,i) { return xScale(i) - sitebarwidth/2; })
		.attr("y", yScale(1))
		.attr("width", sitebarwidth)
		.attr("height", height - yScale(1))
		.attr("fill", function (d) {
			return aacolor(d);
		})
		.attr("opacity", 0.5)
		.on("mouseover", function(d, i) { this.f = bar_mousedover; this.f(d,i); })
		.on("mousedown", function(d, i) { mouse_down = true; this.f = bar_mousedover; this.f(d, i); });
		
	siteselSVG.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height + 5) + ")")
		.call(xAxis);
	
	function refresh() {
		if (!shift_down) {
			var t = d3.event.translate;
			var s = d3.event.scale;
			
			if (t[0] > 0)  { t[0] = 0; }
			if (t[0] < -(width*s - width)) { t[0] = -(width*s - width); }
	
			zoom.translate(t);
			
			sitebars.attr("transform", "translate(" + d3.event.translate[0] +", 0)scale(" + d3.event.scale + ", 1)");
			siteselSVG.select(".x.axis").call(xAxis.scale(xScale));
		}
	}
	
	function bar_mousedover(d, i) {
		if (!mouse_down || !shift_down) { return; }
		
		var bar = d3.select(this);
		if (!bar.classed("selected")) { // if not selected
		
			// add to and sort array
			selected_sites.push(i);
			selected_sites.sort();
			
			// change up it and set selected to true
			bar.classed("selected",true)
				.attr("opacity", 1)
				.attr("y", yScale(1.25));
				
		} else { // if already selected
			// remove from array
			var index = selected_sites.indexOf(i);
			selected_sites.splice(index, 1);
			// reset formatting, set selected to false
			bar.attr('opacity', 0.5)
				.attr("y", yScale(1))
				.classed("selected",false);
		}
		update_AAsites(selected_sites);
		updatePyramid(selected_sites);
    updateTable(selected_sites);
	}
}