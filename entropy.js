var tmargin = {top: 20, right: 10, bottom: 20, left: 40},
    twidth = 600 - tmargin.left - tmargin.right,
    theight = 100 - tmargin.top - tmargin.bottom;

var fieldHeight = 25;
var fieldWidth = 105;
var buttonWidth = 25
var colnames = ['Site','Vaccine Group','Placebo Group','Full Data'];

var jointRow, averageRow, canvas, rowsGrp;

function generateTable(){
 
  canvas = d3.select("#group")
      .append("svg")
      .attr("class","tablesvg")
      .attr("dy",2)
      .attr("width", twidth + tmargin.left + tmargin.right+buttonWidth)
      .attr("height", theight + tmargin.top + tmargin.bottom);
  canvas.append("g")
      .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

  var title = canvas.append("g");
    
  title.append("rect")
    .attr("x",buttonWidth)
    .attr("width", 4*fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","black");

  title.append("text")
    .attr("x",+(4*fieldWidth-1 + tmargin.left)/2)
    .attr("y",fieldHeight/2+4)
    .attr("text-anchor","middle")
    .style("fill","white")
    .style("font-size","15px")
    .text("Entropy Summary");
      
  // define groups for header and rows for the individual sites  
  var headerGrp = canvas.append("g").attr("class", "headerGrp");
  rowsGrp = canvas.append("g").attr("class","rowsGrp");

  var header = headerGrp.selectAll("g")
    .data(colnames)
    .enter().append("g")
    .attr("class", "header")
    .attr("transform", function (d, i){
      return "translate(" +(i * fieldWidth + buttonWidth) + "," + (fieldHeight + 1) + ")";
    });
  header.append("rect")
    .attr("width", fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","grey")
    .style("opacity",0.5);
    
  header.append("text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .text(String);

  jointRow = canvas.append("g").attr("class","joints");
  averageRow = canvas.append("g").attr("class","averages");
}
function updateTable(sites){
  canvas.attr("height",theight+(sites.length+4)*(fieldHeight+1)  );
  var vaccine_entropies = sites.map(function(i) {
    return jointentropy([i], sequences.vaccine, numvac);
  });
  var placebo_entropies = sites.map(function(i) {
    return jointentropy([i], sequences.placebo, numplac);
  });
  var combined_entropies = sites.map(function(i) {
    return jointentropy([i], sequences_raw, numplac+numvac);
  });
  var ent_data = sites.map(function(d, i)
  {
    return ["Env " + envmap[d].hxb2Pos,
      vaccine_entropies[i].toFixed(2),
      placebo_entropies[i].toFixed(2),
      combined_entropies[i].toFixed(2)];
  });
  var avg_data = ["Average Entropy", mean(vaccine_entropies).toFixed(2),
                            mean(placebo_entropies).toFixed(2),
                            mean(combined_entropies).toFixed(2)];
  var jts_data = gen_joint_entropies(sites);
  // creates the aggregate rows
  var avgEnter = averageRow.selectAll("g")
    .data(avg_data)
    .enter().append("g")
    .attr("class","averageCell")
    .attr("transform",function(d,i){
      return "translate(" + (i * fieldWidth + buttonWidth) + "," + (fieldHeight + 1)*2 + ")";
    });

  avgEnter.append("rect")
    .attr("width", fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","grey")
    .style("opacity",0.3);
    
  avgEnter.append("text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .text(String);
  
  averageRow.selectAll("text").remove();
  
  averageRow.selectAll("g")
    .data(avg_data)
    .append("text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .text(String);


  
  var jtEnter = jointRow.selectAll("g")
    .data(jts_data)
    .enter().append("g")
    .attr("class","jointCell")
    .attr("transform",function(d,i){
      return "translate(" + (i * fieldWidth + buttonWidth) + "," + (fieldHeight + 1)*3 + ")";
    });

  jtEnter.append("rect")
    .attr("width", fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","grey")
    .style("opacity",0.3);

  jtEnter.append("text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
  .text(String);  
  
  jointRow.selectAll("text").remove();
  
  jointRow.selectAll("g")
    .data(jts_data)
    .append("text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .text(String);
  
  
  //creates all the site specific rows
  var rows = rowsGrp.selectAll(".row")
   .data(sites);
  
  rows.attr("class","row")
    .attr("height",25)
    .attr("width",500)
    .attr("transform",function(d,i){
      return "translate(0," + (i+4)*(fieldHeight+1) + ")";
    });
  
  var rowsEnter = rows.enter().append("g")
    .attr("class","row")
    .attr("transform",function(d,i){
      return "translate(0," + (i+4)*(fieldHeight+1) + ")";
    });
  
  rows.exit()
    .transition()
    .style("opacity",0)
    .remove();

  // creates remove button for every row
  rows.selectAll(".button").remove();
  rows.append("rect")
    .attr("class","button")
    .attr("x",1)
    .attr("y",1)
    .attr("title","Remove this site from the selection.")
    .attr("height",buttonWidth-2)
    .attr("width",buttonWidth-2)
    .style("fill","red")
    .style("opacity",0.5)
    .on("mouseover",function(){d3.select(this).style("opacity",1)})
    .on("mouseout",function(){d3.select(this).style("opacity",0.5)})
    .on("click",removeOnClick);
    
  // creates cells for every row
  var cells = rows.selectAll(".cell")
    .data(function(d,i){return ent_data[i];});
  var cellsEnter = cells.enter().append("g")
		.attr("class", "cell")
		.attr("transform", function (d, i){
			return "translate(" + (i * fieldWidth + buttonWidth) + ",0)";
		});
    
  cellsEnter.append("rect")
		.attr("width", fieldWidth-1)
		.attr("height", fieldHeight)
    .style("fill", "grey")
    .style("opacity",0)
    .transition()
    .style("opacity",0.1);	
		
	cellsEnter.append("text")
		.attr("x", fieldWidth / 2)
		.attr("y", fieldHeight / 2)
		.attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",0)
    .transition()
    .style("opacity",1)
		.text(String);
  
  cells.exit().transition().remove();
  
  cells.selectAll("text")
    .transition()
    .style("opacity",0)
    .remove();
  
  cells.append("text")
		.attr("x", fieldWidth / 2)
		.attr("y", fieldHeight / 2)
		.attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",0)
    .transition()
    .style("opacity",1)
		.text(String);
    
  // Sets up rectangle which highlights the moused over row
  // Clicking will shift the selection bar to that site
  rows.append("rect")
    .attr("class","select button")
    .attr("x",26)
    .attr("y",1)
    .attr("height",fieldHeight-1)
    .attr("width",fieldWidth*4)
    .style("fill","green")
    .style("opacity",0)
    .on("mouseover",function(d){d3.select(this).style("opacity",0.1)})
    .on("mouseout",function(d){d3.select(this).style("opacity",0)})
    .on("click",onClickChangeView); 
}

	function removeOnClick(d, i) {
		var index = selected_sites.indexOf(d);
		selected_sites.splice(index, 1);
    d3.selectAll(".selected")
      .classed("selected",function(e,j){
        if(j == i){
          return false;
        } else {
          return true;
        }
      })
    var newfocusbars = d3.select(".focus").selectAll(".sitebar") // selection
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
		update_AAsites(selected_sites);
		updatePyramid(selected_sites);
    updateTable(selected_sites);
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

function gen_joint_entropies(sites){
  var joint_entropies = ["Joint Entropy",jointentropy(sites,sequences.vaccine,numvac).toFixed(2),
                          jointentropy(sites,sequences.placebo,numplac).toFixed(2),
                          jointentropy(sites,sequences_raw,numvac+numplac).toFixed(2)];
  return joint_entropies;
}

function onClickChangeView(d,i){
    var focus = d3.select(".focus");
    var diff = extent1[1] - extent1[0];
    extent1[0] = selected_sites[i] - Math.floor(diff/2)
    extent1[1] = selected_sites[i] + Math.ceil(diff/2)
  	xScale.domain(extent1);
		sitebarwidth = (xScale.range()[1] - xScale.range()[0]) / (extent1[1] - extent1[0]);
		d3.select(".brush").call(x2brush.extent(extent1));
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
