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

var margin =  {top: 20, right: 20, bottom: 30, left: 20};
var width = 800 - margin.left - margin.right;
var height =  110 - margin.top - margin.bottom;
		
var plac_scale = d3.scale.linear()
	.range([0, barwidth]);
var vac_scale = d3.scale.linear()
	.range([0, barwidth]);
var pval_scale = d3.scale.log()
	.domain([.1,1.1])
	.range([0, .95*height]);
var entropy_scale = d3.scale.linear()
	.range([.95*height, 0])
	.domain([-1, 0]); //will compute domain when scale is selected the first time.

var selected_sites = [];

var mouse_down = false;
var shift_down = false;
var last_updated;
var yscale_mode = 0; //0 = pval, 1 = entropy, -1 = constant

			

// clear selecting mode even if you release your mouse elsewhere.
d3.select(window).on("mouseup", function(){ last_updated = undefined; mouse_down = false; })
// maintain record of shift depression
	.on("keydown", function () {shift_down = d3.event.shiftKey || d3.event.metaKey; })
	.on("keyup", function () {shift_down = d3.event.shiftKey || d3.event.metaKey; });

d3.select("#clear_selection_button").on("click", clear_selection);

d3.select("#hxb2_select").on("keypress", hxb2_selection);
d3.select("#pvalue_select").on("keypress", pvalue_selection);
d3.select("#yscale_selector").on("input", yscale_selection);

function overview_yscale(site)
{
	switch (yscale_mode)
	{
	case 0:
		return pval_scale(pvalues[site]+.1);
	case 1:
		return entropy_scale(entropies.full[site]);
	default:
		return 0;
	}
}
		
/** Generate visualization */
function generateVis(){
	
	plac_scale.domain([0, numplac]);
	vac_scale.domain([0, numvac]);
	
	generateSiteSelector();
	drawPyramid([]);
  generateTable();
}

function generateSiteSelector() {
	
	var update_throttled = _.throttle(update_charts, 500);
  
  window.xScale = d3.scale.linear()
    .domain([0, vaccine.sequence.length-1])
    .range([0, width]);
	
	window.xAxis = d3.svg.axis()
			.scale(xScale)
      .tickFormat(function(d,i){return envmap[d].hxb2Pos})
			.orient("bottom");
			
	window.sitebarwidth = xScale.range()[1] / d3.max(xScale.domain());
			// = totalwidth/numbars
	
	window.zoom = d3.behavior.zoom().x(xScale).scaleExtent([1,100]).on("zoom", refresh);
	
	var siteselSVGfieldset = d3.select("#overview").append("fieldset")
		.attr("class", "selectionfieldset");
		
	siteselSVGfieldset.append("legend")
		.attr("border", "1px black solid")
		.append("text")
			.text("Vaccine sequence: " + vaccine.ID);
	
	window.siteselSVG = siteselSVGfieldset.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.attr("id", "siteselSVG")
		.append("g")
		.attr("id", "siteselSVGg")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		.call(zoom);
		
	siteselSVG.on("mouseout", function() {d3.select("#tooltip").remove(); });
		
	siteselSVG.append("rect")
		.attr("class", "overlay")
		.attr("transform", "translate(" + (-margin.left) + ", " + (-margin.top) + ")")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom);
		
	window.sitebars = siteselSVG.selectAll(".sitebars")
	    .data(vaccine.sequence);
    
	sitebars.enter().append("rect")
    	.attr("class","sitebars")
		.attr("id", function (d,i) { return "sitebar" + i;})
	  	.attr("x", function (d,i) { return xScale(i) - sitebarwidth/2; })
		.attr("y", function (d,i) {return overview_yscale(i);} )
		.attr("width", sitebarwidth)
		.attr("height", function (d,i) {return height - overview_yscale(i);})
		.attr("fill", function (d) {
			return aacolor(d);
		})
		.attr("opacity", 0.5);
		
	window.foregroundbars = siteselSVG.selectAll(".foregroundbars")
		.data(vaccine.sequence);
		
	foregroundbars.enter().append("rect")
		.attr("class", "fgrdbars")
		.attr("id", function (d,i) { return "fgrdbar" + i;})
		.attr("x", function (d,i) { return xScale(i) - sitebarwidth/2; })
		.attr("y", -height/5)
		.attr("width", sitebarwidth)
		.attr("height", 6*height/5)
		.attr("fill", "white")
		.attr("opacity", 0)
		.on("mouseover", function(d, i) { this.f = bar_mousedover; this.f(d,i); })
		.on("mousedown", function(d, i) { mouse_down = true; selection_start = i; this.f = bar_mousedover; this.f(d, i); })
		.on("mouseout", function() {d3.select("#tooltip").remove();})
		.on("mouseup", function(d, i) {
			if (typeof(last_updated) != "undefined" && last_updated != i)
			{
				//bar_mousedover wasn't called on the final rectangle. Call it now.
				//This works because this is called before window gets the mouseup event (and last_updated is cleared)
				this.f = bar_mousedover;
				this.f(d,i);
			}
		});
		
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
			foregroundbars.attr("transform", "translate(" + d3.event.translate[0] +", 0)scale(" + d3.event.scale + ", 1)");
			siteselSVG.select(".x.axis").call(xAxis.scale(xScale));
		}
	}
	
	function bar_mousedover(d, i) {
		var update_array = [];
		siteselSVG.append("text")
			.attr("id", "tooltip")
			.attr("x", margin.left + width)
			.attr("y", -margin.top/2)
			.attr("text-anchor", "end")
			.text("HXB2 Pos: " + envmap[i].hxb2Pos +
					" // p-value: " + pvalues[i].toPrecision(2));
		
		if (!mouse_down || !shift_down) { return; }
		
		if (i > last_updated)
		{
			update_array = d3.range(last_updated+1, i+1); //returns interval (last_updated, i]
		} else if (i < last_updated)
		{
			update_array = d3.range(i, last_updated); //[i, last_updated)
		} else {
			//initial selection
			update_array = [i];
		}
		
		
		update_array.forEach(function(j) {
		var bar = d3.select("#sitebar"+j);
		if (!bar.classed("selected")) { // if not selected
		
			// add to and sort array
			selected_sites.splice(_.sortedIndex(selected_sites, j), 0, j);
			
			// up it and set selected to true
			bar.classed("selected",true)
				.attr("opacity", 1)
				.attr("y", -height/5)
				.attr("height", height/5);
				
		} else { // if already selected
			// remove from array
			var index = _.sortedIndex(selected_sites, j);
			selected_sites.splice(index, 1);
			// reset formatting, set selected to false
			var yval = overview_yscale(j);
			bar.classed("selected",false)
				.attr('opacity', 0.5)
				.attr("y", function (d) { return yval;} )
				.attr("height", function (d) {return height - yval;});
		}
		});
		
		update_throttled();
		last_updated = i;
	}
	function update_charts()
	{
		update_AAsites(selected_sites);
		updatePyramid(selected_sites);
		updateTable(selected_sites);
	}
}

function clear_selection()
{
	for (var i = 0; i < selected_sites.length; i++) {
		var site = selected_sites[i];
    	var bar = d3.select("#sitebar" + site);
    	var yval = overview_yscale(site);
		bar.classed("selected",false)
			.attr('opacity', 0.5)
			.attr("y", yval )
			.attr("height", height - yval);
	}
	selected_sites = [];	
	update_AAsites([]);
	updatePyramid([]);
	updateTable([]);
}

function hxb2_selection()
{
	if (d3.event.which == 13)
	{
		_.flatten(this.value.split(",")
			.map(function(d)
			{
				var arr = d.split("-")
					.map(function(e)
					{ //convert hxb2 pos to index
						return hxb2map[e];
					});
				if (arr.length == 1)
				{
					return arr;
				} else {
					return d3.range(arr[0], arr[1]+1);
				}
			}))
			.forEach(function(d)
			{
				var index = _.sortedIndex(selected_sites, d);
				if (selected_sites[index] == d)
				{ //already selected
					return;
				} else {
					selected_sites.splice(index, 0, d);
					
					d3.select("#sitebar" + d).classed("selected",true)
						.attr("opacity", 1)
						.attr("y", -height/5)
						.attr("height",height/5);
				}
			});
		this.value = "";
		update_AAsites(selected_sites);
		updatePyramid(selected_sites);
		updateTable(selected_sites);
	}
}

function pvalue_selection()
{
	if (d3.event.which == 13)
	{
		var threshold = this.value;
		d3.selectAll(".sitebars")
			.each(function(d, i)
			{
				var bar = d3.select(this);
				if (pvalues[i] < threshold && !bar.classed("selected"))
				{
					bar.classed("selected", true)
						.attr("opacity", 1)
						.attr("y", -height/5)
						.attr("height", height/5);
					selected_sites.splice(_.sortedIndex(selected_sites, i), 0, i);
				} else if (pvalues[i] >= threshold && bar.classed("selected"))
				{
    				var yval = overview_yscale(i);
					bar.classed("selected", false)
						.attr("opacity", .5)
						.attr("y", yval )
						.attr("height", height - yval);
					selected_sites.splice(_.sortedIndex(selected_sites, i), 1);
				}
			});
		this.value = "";
		update_AAsites(selected_sites);
		updatePyramid(selected_sites);
		updateTable(selected_sites);
	}
}

function yscale_selection()
{
	switch (d3.event.target.value)
	{
	case "pvalue":
		yscale_mode = 0;
		break;
  case "qvalue":
    yscale_mode = 2;
	case "entropy":
		yscale_mode = 1;
		if (entropy_scale.domain()[0] == -1)
		{ //first time selection
			entropy_scale.domain([0, _.max(entropies.full)]);
		}
		break;
	case "constant":
		yscale_mode = -1;
		break;
	}
	
	d3.selectAll(".sitebars")
		.filter(function(d, i) { return i != selected_sites[_.sortedIndex(selected_sites, i)]; })
		.transition(500)
		.attr("y", function(d, i) { return overview_yscale(i); })
		.attr("height", function(d, i) {return height - overview_yscale(i);});
}
