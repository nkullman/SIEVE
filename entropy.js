var tmargin = {top: 20, right: 10, bottom: 20, left: 40},
    width = 500 - tmargin.left - tmargin.right,
    height = 100 - tmargin.top - tmargin.bottom;
    
var fieldHeight = 25;
var fieldWidth = 113;

var colnames = ['Site','Vaccine Group','Placebo Group','Full Data'];

function generateTable(){
  var canvas = d3.selectAll("#overview")
      .append("svg")
      .attr("class","tablesvg")
      .attr("dy",500)
      .attr("width", width + tmargin.left + tmargin.right)
      .attr("height", height + tmargin.top + tmargin.bottom)
    .append("g")
      .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

  var title = canvas.append("g");
    
  title.append("rect")
    .attr("width", 4*fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","black");

  title.append("text")
    .attr("x",(4*fieldWidth-1)/2)
    .attr("y",fieldHeight/2+4)
    .attr("text-anchor","middle")
    .style("fill","white")
    .style("font-size","15px")
    .text("Entropy Summary");
      
  // define groups for header and rows for the individual sites  
  var headerGrp = canvas.append("g").attr("class", "headerGrp");
  var rowsGrp = canvas.append("g").attr("class","rowsGrp");

  var header = headerGrp.selectAll("g")
    .data(colnames)
    .enter().append("g")
    .attr("class", "header")
    .attr("transform", function (d, i){
      return "translate(" + i * fieldWidth + "," + (fieldHeight + 1) + ")";
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
  canvas  = d3.select(".tablesvg");
  canvas.attr("height",height+(sites.length+4)*(fieldHeight+1)  );
  var ent_data = gen_entropy_data(sites);
  var avg_data = gen_average_entropies(sites);
  var jts_data = gen_joint_entropies(sites);
  // creates the aggregate rows
  var averageRow = d3.select(".averages");
  var jointRow = d3.select(".joints");
  var avgEnter = averageRow.selectAll("g")
    .data(avg_data)
    .enter().append("g")
    .attr("class","averageCell")
    .attr("transform",function(d,i){
      return "translate(" + i * fieldWidth + "," + (fieldHeight + 1)*2 + ")";
    })

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
      return "translate(" + i * fieldWidth + "," + (fieldHeight + 1)*3 + ")";
    })

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
  var rows = canvas.select(".rowsGrp").selectAll(".row")
   .data(sites);
  
  rows.attr("class","row")
    .attr("height",25)
    .attr("width",500)
    .attr("transform",function(d,i){
      return "translate(0," + (i+4)*(fieldHeight+1) + ")";
    })
    .on("click",function(d,i){console.log(sites[i]);});
  
  var rowsEnter = rows.enter().append("g")
    .attr("class","row")
    .attr("transform",function(d,i){
      return "translate(0," + (i+4)*(fieldHeight+1) + ")";
    });
  
  rows.exit()
    .transition()
    .style("opacity",0)
    .remove();
  
  // creates cells for every row
  var cells = rows.selectAll(".cell")
    .data(function(d,i){return ent_data[i];});
  var cellsEnter = cells.enter().append("g")
		.attr("class", "cell")
		.attr("transform", function (d, i){
			return "translate(" + i * fieldWidth + ",0)";
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
}

 
 function gen_entropy_data(sites){
  var sitewise = [];
  for(var i = 0; i < sites.length; i ++){
    sitewise.push(["Env " + envmap[sites[i]].hxb2Pos,
                jointentropy([sites[i]],sequences.vaccine,numvac).toFixed(2),
                jointentropy([sites[i]],sequences.placebo,numplac).toFixed(2),
                jointentropy([sites[i]],sequences_raw,numvac+numplac).toFixed(2)])
  }
  return sitewise;
}

function gen_average_entropies(sites){
  var vaccine_entropies = [];
  var placebo_entropies = [];
  var combined_entropies = [];
  for(var i = 0; i < sites.length; i ++){
    vaccine_entropies.push(jointentropy([sites[i]],sequences.vaccine,numvac));
    placebo_entropies.push(jointentropy([sites[i]],sequences.placebo,numplac));
    combined_entropies.push(jointentropy([sites[i]],sequences_raw,numvac+numplac));
  }
  var average_entropies = ["Average Entropy", mean(vaccine_entropies).toFixed(2),
                            mean(placebo_entropies).toFixed(2),
                            mean(combined_entropies).toFixed(2)];
  return average_entropies;
}

function gen_joint_entropies(sites){
  var joint_entropies = ["Joint Entropy",jointentropy(sites,sequences.vaccine,numvac).toFixed(2),
                          jointentropy(sites,sequences.placebo,numplac).toFixed(2),
                          jointentropy(sites,sequences_raw,numvac+numplac).toFixed(2)];
  return joint_entropies;
}
