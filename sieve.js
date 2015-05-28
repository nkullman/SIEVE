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

			

//clear selecting mode even if you release your mouse elsewhere.
d3.select(window).on("mouseup", function(){ mouse_down = false; });
		
/** Generate visualization */
function generateVis(){
	plac_scale.domain([0, numplac]);
	vac_scale.domain([0, numvac]);
	generateSiteSelector();
  drawPyramid([]);
  generateTable();
	
}

function generateSiteSelector() {
  window.margin =  {top: 10, right: 10, bottom: 100, left: 20};
  window.margin2 = {top: 150, right: 10, bottom: 20, left: 20};
  window.width = 825 - margin.left - margin.right;
  window.height =  200 - margin.top - margin.bottom;
  window.height2 = 200 - margin2.top - margin2.bottom;
  
  window.xScale = d3.scale.linear()
    .domain([0, vaccine.sequence.length-1])
    .range([0, width]);
  window.x2Scale = d3.scale.linear()
    .domain(xScale.domain())
    .range([0, width]);
  window.yScale = d3.scale.linear()
    .domain([0, 1])
    .range([height, 0]);
  window.y2Scale = d3.scale.linear()
    .domain(yScale.domain())
    .range([height2, 0]);
	window.xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");
	window.x2Axis = d3.svg.axis()
	window.x2Axis = d3.svg.axis()
			.scale(x2Scale)
			.orient("bottom");

	window.x2brush = d3.svg.brush()
			.x(x2Scale)
			.on("brush", brushed);
			
	window.sitebarwidth = xScale.range()[1] / d3.max(xScale.domain());
			// = totalwidth/numbars
	
	var siteselSVG = d3.select("#overview").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.attr("id", "siteselSVG");
		
	siteselSVG.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
			.attr("width", width)
			.attr("height", height);
	// focus group
	var focus = siteselSVG.append("g")
		.attr("class", "focus")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	// context group
	var context = siteselSVG.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
		
	// append focus drawings (we could use y-dimension for an encoding)
	var focusbars = focus.selectAll(".sitebar")
	    .data(vaccine.sequence)
	  .enter().append("rect")
	  	.attr("class", "focus sitebar")
	    .attr("transform", function (d,i) { return "translate(" + (xScale(i) - sitebarwidth/2) +  ",0)"; })
		.attr("width", sitebarwidth)
		.attr("height", height - yScale(1))
		.attr("fill", function (d) {
			return aacolor(d);
		})
		.attr("opacity", 0.5)
		.on("mouseover", bar_mousedover)
		.on("mousedown", function(d,i) { mouse_down = true; this.f = bar_mousedover; this.f(d,i);});
	// append focus axis
	focus.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height + 5) + ")")
		.call(xAxis);
	
	// append context drawings
	var contextbars = context.selectAll(".sitebar")
	    .data(pvalues)
	  .enter().append("rect")
	  	.attr("class", "context sitebar")
	    .attr("x", function (d,i) { return x2Scale(i) - sitebarwidth/2; })
		.attr("y", y2Scale(1))
		.attr("width", sitebarwidth)
		.attr("height", height2 - y2Scale(1))
		.attr("fill", "black")
		.attr("opacity", function(d) {
			if (d < .05)
			{
				return 1;
			} else  if (d < pcutoff) {
				return pcutoff-d;
			} else {
				return 0;
			}
		});
	// append context axis
	context.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height2 + 2) + ")")
		.call(x2Axis);
	// append context brush
	context.append("g")
		.attr("class", "x brush")
		.call(x2brush)
		.selectAll("rect")
		.attr("y", -6)
		.attr("height", height2 + 7);
		
	var sitelist_svg = d3.select("#overview").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", 0);
		
	// draw charts for initial (default) selection
	selected_sites = [];
	update_AAsites(selected_sites);
	updatePyramid(selected_sites);
	//update_sitelisttext(selected_sites);

	
	function brushed() {
		var minextent = 10,
			maxextent = 50;
		var extent0 = x2brush.extent();
		window.extent1;
		// if dragging, preserve width
		if (d3.event.mode === "move") {
			var d0 = Math.round(extent0[0]),
				d1 = Math.round(extent0[1]);
			extent1 = [d0, d1];
		}
		// otherwise, if resizing, round both sides
		else {
			extent1 = extent0.map(function(d) {return Math.round(d); });
			// if too small, increase both sides by one until we reach min extent
			if (extent1[1] - extent1[0] < minextent){
				while (extent1[1] - extent1[0] < minextent) {
					if (extent1[1] + 1 <= vaccine.sequence.length) { extent1[1]++; }
					if (extent1[0] - 1 >= 0) { extent1[0]--; }
				}
			}
			// if too big, decrease both sides until we reach max extent
			if (extent1[1] - extent1[0] > maxextent){
				while (extent1[1] - extent1[0] > maxextent) {
					extent1[1]--;
					extent1[0]++;
				}
			}
			
			// in case empty when rounded, use floor & ceil instead
			/*if (extent1[0] >= extent1[1]) {
				extent1[0] = Math.floor(extent0[0]);
				extent1[1] = Math.ceil(extent0[1]);
			}*/
		}
		
		// redefine xScale's domain, barwidth, brush's extent
		xScale.domain(extent1);
		sitebarwidth = (xScale.range()[1] - xScale.range()[0]) / (extent1[1] - extent1[0]);
		d3.select(this).call(x2brush.extent(extent1));
		// redraw bars
		var newfocusbars = focus.selectAll(".sitebar") // selection
			.data(vaccine.sequence.slice(extent1[0], extent1[1] + 1));
			
		newfocusbars // updaters
			.attr("class", function(d,i) {
				  if (selected_sites.indexOf(i + extent1[0]) === -1) { return "focus sitebar"; }
				  else { return "focus sitebar selected";}
			})
			.attr("transform", function (d,i) { 
				if (!d3.select(this).classed("selected")) {
					return "translate(" + (xScale(extent1[0] + i) - sitebarwidth/2) +  "," + yScale(1) + ")";
				} else {
					return "translate(" + (xScale(extent1[0] + i) - sitebarwidth/2) +  "," + yScale(1.25) + ")";
				}
			})
			.attr("width", sitebarwidth)
			.attr("fill", function(d) { return aacolor(d);} )
			.attr("opacity", function (d,i) { 
				if (!d3.select(this).classed("selected")) {
					return 0.5;
				} else {
					return 1;
				}
			})
    		.on("mouseover", function(d, i) { this.f = bar_mousedover; this.f(d, extent1[0] + i); })
			.on("mousedown", function(d, i) { mouse_down = true; this.f = bar_mousedover; this.f(d,extent1[0] + i);})
			.on("mouseup", function() {mouse_down = false; });
			
		newfocusbars.exit()	 //exiters
			.attr("transform", function (d,i) { return "translate(" + (xScale(extent1[0] + i) - sitebarwidth/2) +  ",0)"; })
			.remove();
			
		newfocusbars.enter().append("rect") //enterers
	  		.attr("class", function(d,i) {
				  if (selected_sites.indexOf(i + extent1[0]) === -1) { return "focus sitebar"; }
				  else { return "focus sitebar selected";}
			})
	    	.attr("transform", function (d,i) { 
				if (!d3.select(this).classed("selected")) {
					return "translate(" + (xScale(extent1[0] + i) - sitebarwidth/2) +  ",0)";
				} else {
					return "translate(" + (xScale(extent1[0] + i) - sitebarwidth/2) +  "," + yScale(1.25) + ")";
				}
			})
			.attr("width", sitebarwidth)
			.attr("height", height - yScale(1))
			.attr("fill", function (d) { return aacolor(d); })
			.attr("opacity", function (d,i) { 
				if (!d3.select(this).classed("selected")) {
					return 0.5;
				} else {
					return 1;
				}
			})
    		.on("mouseover", function(d, i) { this.f = bar_mousedover; this.f(d, extent1[0] + i); })
			.on("mousedown", function(d, i) { mouse_down = true; this.f = bar_mousedover; this.f(d,extent1[0] + i);});
			
		// redraw axis
		focus.select(".x.axis").call(xAxis);
	}
	
	function bar_mousedover(d, i) {
		if (!mouse_down) { return; }
		
		var bar = d3.select(this);
		if (!bar.classed("selected")) { // if not selected
		
			// add to and sort array
			selected_sites.push(i);
			selected_sites.sort();
			
			// change up it and set selected to true
			bar.classed("selected",true)
				.attr("opacity", 1)
				//.attr("y", yScale(1.25));
				.attr("transform", "translate(" + (xScale(i) - sitebarwidth/2) + "," + yScale(1.25) + ")");
				
		} else { // if already selected
			// remove from array
			var index = selected_sites.indexOf(i);
			selected_sites.splice(index, 1);
			// reset formatting, set selected to false
			bar.attr('opacity', 0.5)
				//.attr("y", yScale(1))
				.attr("transform", "translate(" + (xScale(i) - sitebarwidth/2) + ",0)")
				.classed("selected",false);
		}
		update_AAsites(selected_sites);
		updatePyramid(selected_sites);
    updateTable(selected_sites);
	}
}