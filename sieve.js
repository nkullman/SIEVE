var aacolor = d3.scale.category20().domain(['A','C','D','E','F','G','H','I','K','L','M',
		'N','P','Q','R','S','T','V','W','Y']);
var barmargin = {top: 5, right: 10, bottom: 0, left: 10},
	barwidth = 200,
	barheight = 20,
	barpadding = .1;
var barchartmargin = {top: 15, right: 80, bottom: 10, left: 50},
	barchartwidth = 250,
	barchartheight = 70;
	
// The below will be read from file at some point
var studyname = "RV144",
	protein = "env";

var margin =  {top: 20, right: 50, bottom: 50, left: 50};
var width = 800 - margin.left - margin.right;
var height =  150 - margin.top - margin.bottom;
		
var plac_scale = d3.scale.linear()
	.range([0, barwidth]);
var vac_scale = d3.scale.linear()
	.range([0, barwidth]);
var pval_scale = d3.scale.log()
	.domain([.1, 1.1])
	.range([0, .95*height]);
var tval_scale = d3.scale.linear()
	.domain([-1,0]) // will compute domain when scale is selected the first time
	.range([.95*height, 0]);
var entropy_scale = d3.scale.linear()
	.range([.95*height, 0])
	.domain([-1, 0]); //will compute domain when scale is selected the first time.
var opacity_scale = d3.scale.linear()
	.domain([-1,0]) // will compute domain when navigation area is used the first time.
	.range([0.5,0])
	.clamp(true);

var selected_sites = [];

var mouse_down = false;
var shift_down = false;
var last_updated;
var yscale_mode = 0; //0 = pval, 1 = entropy, 2 = tstat, -1 = constant

var pval_scale_ticks = [0.01 + 0.1, 0.05 + 0.1, 0.2 + 0.1, 1 + 0.1];
function tval_scale_ticks(tval_scale_domain){
	var ticks = d3.range(0, tval_scale_domain[1]);
	ticks.push(tval_scale_domain[1]);
	if (ticks[0] < 0) ticks[0] = 0;
	return ticks;
}
function entropy_scale_ticks(entropy_scale_domain){
	var ticks = d3.range(0, entropy_scale_domain[1]);
	ticks.push(entropy_scale_domain[1]);
	return ticks;
}
var selaxistitle = "p-value";

// clear selecting mode even if you release your mouse elsewhere.
d3.select(window).on("mouseup", function(){ last_updated = undefined; mouse_down = false; })
// maintain record of shift depression
	.on("keydown", function () {shift_down = d3.event.shiftKey || d3.event.metaKey; })
	.on("keyup", function () {shift_down = d3.event.shiftKey || d3.event.metaKey; });


d3.select("#hxb2_select").on("keypress", hxb2_selection);
d3.select("#yscale_selector").on("input", yscale_selection);

function overview_yscale(site)
{
	/*	returns the y of a site bar based on the currently selected
		scale
	*/
	switch (yscale_mode)
	{
	case 0:
		return pval_scale(pvalues[site]+.1);
	case 1:
		return entropy_scale(entropies.full[site]);
	case 2:
		return tval_scale(tvalues[site]);
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
	/*	This throttling is very important to the function of the selection chart:
		If the script is busy processing the previous selection, it won't get the
		mousedover callback, so won't select every site. This function limits
		how often the script attempts to process the selected sites when making
		a sweep over the site selection chart.	*/
  
  d3.select(".analysisID").append("html").html(
	  "<h2>" + studyname + ": " + protein + " (" + vaccine.ID.trim() + ")</h2>");
  
  window.xScale = d3.scale.linear()
    .domain([0, vaccine.sequence.length-1])
    .range([0, width]);
	
	window.xAxis = d3.svg.axis()
			.scale(xScale)
      .tickFormat(function(d,i){return envmap[d].hxb2Pos})
			.orient("bottom");
			
	window.yAxisl = d3.svg.axis()
		.scale(pval_scale)
		.tickValues(pval_scale_ticks)
		.tickFormat(function(d) {return Math.round((d - 0.1)*100)/100;})
		.orient("left");
	window.yAxisr = d3.svg.axis()
		.scale(pval_scale)
		.tickValues(pval_scale_ticks)
		.tickFormat(function(d) {return Math.round((d - 0.1)*100)/100;})
		.orient("right");
			
	window.sitebarwidth = xScale.range()[1] / d3.max(xScale.domain());
			// = totalwidth/numbars
	
	window.zoom = d3.behavior.zoom().x(xScale).scaleExtent([1,100]).on("zoom", refresh);
	
	/* The protein nav area is already enclosed in a fieldset
	var overviewfieldset = d3.select("#overview").append("fieldset")
		.attr("class", "selectionfieldset");
		
	overviewfieldset.append("legend")
		.attr("border", "1px black solid")
		.append("text")
			.text("Vaccine sequence: " + vaccine.ID);*/
	
	window.siteselSVGg = d3.select(".protein-nav").append("svg")
	    /*.attr("width", width + margin.right + margin.left)
	    .attr("height", height + margin.top + margin.bottom)*/
		.attr('viewBox', "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
      	.attr('preserveAspectRatio',"xMinYMin meet")
		.attr("id", "siteselSVG")
		.append("g")
		.attr("id", "siteselSVGg")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
		.call(zoom);
		
	siteselSVGg.on("mouseout", function() {d3.select("#tooltip").remove(); });
		
	siteselSVGg.append("rect")
		.attr("class", "overlay")
		.attr("transform", "translate(" + (-margin.left) + ", " + (-margin.top) + ")")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom);
		
	window.sitebars = siteselSVGg.selectAll(".sitebars")
	    .data(vaccine.sequence);
    
	sitebars.enter().append("rect")
    	.attr("class","sitebars")
		.attr("id", function (d,i) { return "sitebar" + i;})
	  	.attr("x", function (d,i) { return xScale(i) - sitebarwidth/2; })
		.attr("y", function (d,i) {return overview_yscale(i);} )
		.attr("width", sitebarwidth)
		.attr("height", function (d,i) {return height - overview_yscale(i);})
		.attr("fill", function (d) {
			if (d == '-') return "#000000";
			else return aacolor(d);
		})
		.attr("opacity", 0.5);
		
	window.foregroundbars = siteselSVGg.selectAll(".foregroundbars")
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
		//bar_mousedover expects 'this' to be the element moused over
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
		
	siteselSVGg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height + 5) + ")")
		.call(xAxis);
	d3.select("#siteselSVG").append("text")
		.attr("class", "x axis label")
		.attr("text-anchor", "middle")
		.attr("x", (width + margin.left + margin.right)/2)
		.attr("y", (height + margin.top + .9*margin.bottom))
		.text("HXB2 position");
		
	d3.select("#siteselSVG").append("text")
		.attr("class", "clear-selection")
		.attr("text-anchor", "end")
		.attr("x", width + margin.left)
		.attr("y", (height + margin.top + .9*margin.bottom))
		.text("clear selection")
		.on("click", clear_selection)
		.style("text-decoration", "underline")
		.style("cursor", "pointer");
		
	siteselSVGg.append("g")
		.attr("class", "y axis l")
		.attr("transform", "translate(-5,0)")
		.call(yAxisl);
	siteselSVGg.append("text")
		.attr("class", "y axis label")
		.attr("text-anchor", "beginning")
		.attr("x", -margin.right)
		.attr("y", -margin.top/2)
		.text(selaxistitle);
	siteselSVGg.append("g")
		.attr("class", "y axis r")
		.attr("transform", "translate(" + (width+5) + ",0)")
		.call(yAxisr);
	
	function refresh() {
		if (!shift_down) {			
			var t = d3.event.translate;
			var s = d3.event.scale;
			
			if (t[0] > 0)  { t[0] = 0; }
			if (t[0] < -(width*s - width)) { t[0] = -(width*s - width); }
	
			zoom.translate(t);
			
			sitebars.attr("transform", "translate(" + d3.event.translate[0] +", 0)scale(" + d3.event.scale + ", 1)");
			foregroundbars.attr("transform", "translate(" + d3.event.translate[0] +", 0)scale(" + d3.event.scale + ", 1)");
			siteselSVGg.select(".x.axis").call(xAxis.scale(xScale));
			
			/* Rectangles were being drawn outside chart region (into margins of chart).
				The below corrects this by measuring a rectangle's distance from the current
				drawing midpoint and adjusting opacity accordingly. */
			var origSiteBarWidth = parseFloat(sitebars[0][0].getAttribute("width"));
			var visWindowStart = (0-d3.event.translate[0])/d3.event.scale;
			var visWindowEnd = visWindowStart + width/d3.event.scale; 
			var visWindowSpan = (visWindowEnd-visWindowStart);
			var visWindowMidpt = visWindowStart + visWindowSpan/2;
			// Change in viewing window of nav pane introduces new window span
			opacity_scale.domain([visWindowSpan/2, visWindowSpan/2 + .01*visWindowSpan]);
			// update opacity of sitebars based on drawing window
			sitebars.attr("opacity", function(d,i){
				var site_x_loc = parseFloat(sitebars[0][i].getAttribute("x")) + origSiteBarWidth/2;
				return opacity_scale(Math.abs(visWindowMidpt - site_x_loc));
			});
			
		}
	}
	
	function bar_mousedover(d, i) {
		/*	Callback when a bar in the selection chart is moused over
			Since this function will be throttled, it must keep track of the
			last time it was called and the assumption is if it was last called
			on item x, is now being called on y, and the mouse was never released
			between the two events, it should select everything between x and y.
			After building the new selection list, it calls all the update routines
			for the various charts. */
		var update_array = [];
		siteselSVGg.append("text")
			//even when the mouse isn't selected, update the legend with information
			//about the moused over site.
			.attr("id", "tooltip")
			.attr("x", margin.left + width)
			.attr("y", -margin.top/2)
			.attr("text-anchor", "end")
			.text(function () {
				if (yscale_mode === 0){ 
					return "HXB2 Pos: " + envmap[i].hxb2Pos +
						" // p-value: " + pvalues[i].toPrecision(2);
				} else if (yscale_mode === 1) {
					return "HXB2 Pos: " + envmap[i].hxb2Pos +
						" // entropy: " + entropies.full[i];
				} else if (yscale_mode === 2) {
					return "HXB2 Pos: " + envmap[i].hxb2Pos +
						" // t-stat: " + tvalues[i].toPrecision(2);
				} else {
					return "HXB2 Pos: " + envmap[i].hxb2Pos;
				}
			});
		
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
	/*	Remove everything from selection by lowering
		the bars in the overview and calling each chart's
		update routine */
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
	/*	Select by HXB2 position, callback routine for text entry */
	if (d3.event.which == 13) //Enter button pressed
	{
		/*	Remove whitespace, take each item in a comma separated list, convert to index
			and if it is a range (eg 4-7), replace it with an array (eg [4, 5, 6, 7])
			then flatten into one big array of sites.*/
		_.flatten(this.value.replace(/\s+/g,"").split(",")
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
					return d3.range(arr[0], arr[1]+1); //interval including endpoints
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

function yscale_selection()
{
	switch (d3.event.target.value)
	{
	case "pvalue":
		yscale_mode = 0;
		yAxisl.scale(pval_scale).tickValues(pval_scale_ticks)
			.tickFormat(function(d) {return Math.round((d - 0.1)*100)/100;});
		yAxisr.scale(pval_scale).tickValues(pval_scale_ticks)
			.tickFormat(function(d) {return Math.round((d - 0.1)*100)/100;});
		selaxistitle = "p-value";
		break;
	case "entropy":
		yscale_mode = 1;
		if (entropy_scale.domain()[0] == -1)
		{ //first time selection
			entropy_scale.domain([0, _.max(entropies.full)]);
		}
		
		yAxisl.scale(entropy_scale).tickValues(entropy_scale_ticks(entropy_scale.domain()))
			.tickFormat(function(d) {return Math.round(d*100)/100;});
		yAxisr.scale(entropy_scale).tickValues(entropy_scale_ticks(entropy_scale.domain()))
			.tickFormat(function(d) {return Math.round(d*100)/100;});
		selaxistitle = "entropy";
		break;
	case "tvalue":
		yscale_mode = 2;
		if (tval_scale.domain()[0] == -1){
			tval_scale.domain([0, Math.abs(d3.max([d3.min(tvalues),d3.max(tvalues)]))]);
		}
		yAxisl.scale(tval_scale).tickValues(tval_scale_ticks(tval_scale.domain()))
			.tickFormat(function(d) {return Math.round((d)*100)/100;});
		yAxisr.scale(tval_scale).tickValues(tval_scale_ticks(tval_scale.domain()))
			.tickFormat(function(d) {return Math.round((d)*100)/100;});
		selaxistitle = "t-stat";
		break;
	case "constant":
		yscale_mode = -1;
		yAxisl.scale(entropy_scale).tickValues(0);
		yAxisr.scale(entropy_scale).tickValues(0);
		selaxistitle = "";
		break;
	}
	
	d3.selectAll(".sitebars")
		.filter(function(d, i) { return i != selected_sites[_.sortedIndex(selected_sites, i)]; })
		.transition(500)
		.attr("y", function(d, i) { return overview_yscale(i); })
		.attr("height", function(d, i) {return height - overview_yscale(i);});
		
	siteselSVGg.select(".y.axis.l").transition().call(yAxisl);
	siteselSVGg.select(".y.axis.r").transition().call(yAxisr);
	d3.select(".y.axis.label").text(selaxistitle);
}