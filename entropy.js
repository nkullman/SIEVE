var tmargin = {top: 20, right: 10, bottom: 20, left: 40},
    twidth = 500 - tmargin.left - tmargin.right,
    theight = 100 - tmargin.top - tmargin.bottom;

var fieldHeight = 25;
var fieldWidth = 100;
var buttonWidth = 25
var colnames = ['Site','Vaccine Group','Placebo Group','Full Data'];

var jointRow, averageRow, canvas, rowsGrp;

function generateTable(){
 
  canvas = d3.selectAll("#group")
      .append("svg")
      .attr("class","tablesvg")
      .attr("dy",500)
      .attr("width", twidth + tmargin.left + tmargin.right+buttonWidth)
      .attr("height", theight + tmargin.top + tmargin.bottom);
  canvas.append("g")
      .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");
  
  // Draw Title
  var title = canvas.append("g");
    
  title.append("rect")
    .attr("x",buttonWidth)
    .attr("width", 4*fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","black");

  title.append("text")
    .attr("x",twidth/2)
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
  var ent_data = sites.map(function(d, i)
  {
    return ["Env " + envmap[d].hxb2Pos,
      entropies.vaccine[i],
      entropies.placebo[i],
      entropies.full[i]];
  });
  if(sites.length > 0){
    var avg_data = ["Average Entropy", d3.mean(entropies.vaccine).toFixed(2),
                            d3.mean(entropies.placebo).toFixed(2),
                            d3.mean(entropies.full).toFixed(2)];
  } else {
     var avg_data = ["Average Entropy", 0.00,
                            0.00,
                            0.00];
  }
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
    var site = selected_sites[i];
		selected_sites.splice(i, 1);
    var bar = d3.select("#sitebar" + site);
    var yval = overview_yscale(i);
			bar.classed("selected",false)
				.attr('opacity', 0.5)
				.attr("y", yval )
				.attr("height", height - yval);
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
  var site = selected_sites[i];
  // 37 is (arbitrary) magic number for a pretty zoom extent
  var s = 37;
  // the location of the translation is off
  var t = [-((site/vaccine.sequence.length)*(width)*(s-1) -
          (width+margin.left)/(s*2)), 0];
  // transition not smooth. needs help.
  siteselSVG.transition().call(zoom.translate(t).scale(s).event);
}