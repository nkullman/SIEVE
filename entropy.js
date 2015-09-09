var fieldHeight = 25;
var fieldWidth = 90;
var buttonWidth = 15

var tmargin = {top: 20, right: 0, bottom: 20, left: 0},
    twidth = 4*fieldWidth + buttonWidth,
    theight = 100 - tmargin.top - tmargin.bottom;

var colnames = ['Site (HXB2)','Vaccine','Placebo','Combined'];

var jointRow, averageRow, canvas, rowsGrp;
var showEntropies = true;

function generateTable(){
 
  canvas = d3.select(".table-zn")
      .append("svg")
      .attr("class","tablesvg")
      .attr("dy",500)
      /*.attr("width", twidth + tmargin.left + tmargin.right)
      .attr("height", theight + tmargin.top + tmargin.bottom)*/
      .attr("viewBox", "0 0 " + (twidth + tmargin.left + tmargin.right) + " " + (theight + tmargin.top + tmargin.bottom))
      .attr('preserveAspectRatio',"xMinYMin meet");
  canvas.append("g")
      .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");
  
  // Draw Title
  var title = canvas.append("g");
    
  title.append("rect")
    .attr("class","entropy title bar")
    .attr("x",buttonWidth)
    .attr("width", 2*fieldWidth-1)
    .attr("height", fieldHeight)
    .style("fill","black");
  
   title.append("rect")
    .attr("class","mismatch title bar")
    .attr("x",buttonWidth + 2*fieldWidth)
    .attr("width", 2*fieldWidth)
    .attr("height", fieldHeight)
    .style("fill","grey");

  title.append("text")
    .attr("x",buttonWidth + fieldWidth)
    .attr("y",.8*fieldHeight)
    .attr("text-anchor","middle")
    .style("fill","white")
    .style("font-size","18px")
    .text("Entropy");
    
  title.append("text")
    .attr("x",fieldWidth*3 + buttonWidth)
    .attr("y",.8*fieldHeight)
    .attr("text-anchor","middle")
    .style("fill","white")
    .style("font-size","18px")
    .text("Mismatches");
  
  title.append("rect")
    .attr("x",buttonWidth)
    .attr("width", 2*fieldWidth-1)
    .attr("height", fieldHeight)
    .style("opacity",0)
    .on("click",displayEntropies);
  
  title.append("rect")
    .attr("x",buttonWidth + 2*fieldWidth)
    .attr("width", 2*fieldWidth-1)
    .attr("height", fieldHeight)
    .style("opacity",0)
    .on("click",displayMismatchCounts);
  
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
  /*canvas.attr("height",theight+(sites.length+4)*(fieldHeight+1));*/
  canvas.attr("viewBox", "0 0 " + (twidth + tmargin.left + tmargin.right) + " " + (theight+(sites.length+4)*(fieldHeight+1)));
  
  // Data in this section is a list of length sites.length
  // each element is another list of length 4, corresponding to the rows
  // each element of that list is a length 2, corresponding to either
  // entropy or mismatch count
  
  // generating entropy data for table
  var ent_data = sites.map(function(d, i)
  {
    // obtaining mismatchcounts
    var mmcountfull = 0;
    var mmcountvaccine = 0;
    var mmcountplacebo = 0;
    for(var participant in seqID_lookup){
      if(seqID_lookup[participant].mismatch != undefined){
        var is_mismatch = seqID_lookup[participant].mismatch[d];
        mmcountfull +=is_mismatch;
        if(seqID_lookup[participant].vaccine){
          mmcountvaccine += is_mismatch;
        } else {
          mmcountplacebo += is_mismatch;
        }
      }
    }
    return [[envmap[d].hxb2Pos, envmap[d].hxb2Pos],
      [entropies.vaccine[d],mmcountvaccine],
      [entropies.placebo[d],mmcountplacebo],
      [entropies.full[d],mmcountfull]];
  });
  // average data
  var avg_data;
  if(sites.length > 0){
    var temp = d3.range(sites.length);
    var avg_data = [["Average","Average"], 
                    [d3.mean(temp.map(function(d){return ent_data[d][1][0]})).toFixed(2),
                      d3.mean(temp.map(function(d){return ent_data[d][1][1]})).toFixed(2)],
                    [d3.mean(temp.map(function(d){return ent_data[d][2][0]})).toFixed(2),
                      d3.mean(temp.map(function(d){return ent_data[d][2][1]})).toFixed(2)],
                    [d3.mean(temp.map(function(d){return ent_data[d][3][0]})).toFixed(2),
                      // this was returning the sum of the two averages. Quick fix implemented below
                      /*d3.mean(temp.map(function(d){return ent_data[d][3][1]})).toFixed(2)*/
                      0]];
                      avg_data[3][1] = ((numplac*avg_data[2][1]+numvac*avg_data[1][1])/(numvac+numplac)).toFixed(2);
  } else {
     var avg_data = [["Average","Average"], 
                     [0.00,0.00],
                     [0.00,0.00],       
                     [0.00,0.00]];
  }
  
  // joint data
  var jts_data = gen_joint_entropies(sites);
  
  // generating mismatch data for table
  var mismatch_data = sites.map(function(d)
  {
    var mmcountfull = 0;
    var mmcountvaccine = 0;
    var mmcountplacebo = 0;
    for(var participant in seqID_lookup){
      if(seqID_lookup[participant].mismatch != undefined){
        var is_mismatch = seqID_lookup[participant].mismatch[d];
        mmcountfull +=is_mismatch;
        if(seqID_lookup[participant].vaccine){
          mmcountvaccine += is_mismatch;
        } else {
          mmcountplacebo += is_mismatch;
        }
      }
    }
    return ["Env " + envmap[d].hxb2Pos,mmcountvaccine,mmcountplacebo,mmcountfull];
  })
  
  
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
    
/*   avgEnter.append("text")
    .attr("class","average ent text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .text(function(d){return d[0];});
    
  avgEnter.append("text")
    .attr("class","average mm text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .text(function(d){return d[1];}); */
  
  averageRow.selectAll("text").remove();
  
  averageRow.selectAll("g")
    .data(avg_data)
    .append("text")
    .attr("class","entropy text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .style("opacity",entropyTextOpacity())
    .text(function(d){return d[0];});
  
  averageRow.selectAll("g")
    .data(avg_data)
    .append("text")
    .attr("class","mismatch text")
    .attr("x",fieldWidth/2)
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",mismatchTextOpacity())
    .text(function(d){return d[1];});


  
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
  
  jointRow.selectAll("text").remove();
  
  jointRow.selectAll("g")
    .data(jts_data)
    .append("text")
    .attr("class","entropy text")
    .attr("x",fieldWidth/2)
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",entropyTextOpacity())
    .text(function(d){return d[0];});
  
  jointRow.selectAll("g")
    .data(jts_data)
    .append("text")
    .attr("class","mismatch text")
    .attr("y", fieldHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor","middle")
    .attr("x",fieldWidth/2)
    .style("opacity",mismatchTextOpacity())
    .text(function(d){return d[1];});
  
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
    .attr("class", "entropy text")
		.attr("x", fieldWidth / 2)
		.attr("y", fieldHeight / 2)
		.attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",entropyTextOpacity())
		.text(function(d){return d[0];});
  
  cellsEnter.append("text")
    .attr("class","mismatch text")
    .attr("x", fieldWidth / 2)
		.attr("y", fieldHeight / 2)
		.attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",mismatchTextOpacity())
		.text(function(d,i){return d[1];});
  
  cells.exit().transition().remove();
  
  cells.selectAll("text")
    .transition()
    .style("opacity",0)
    .remove();
  
  cells.append("text")
    .attr("class","entropy text")
		.attr("x", fieldWidth / 2)
		.attr("y", fieldHeight / 2)
		.attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",entropyTextOpacity())
		.text(function(d){return d[0];});
    
  cells.append("text")
    .attr("class","mismatch text")
		.attr("x", fieldWidth / 2)
		.attr("y", fieldHeight / 2)
		.attr("dy", ".35em")
    .attr("text-anchor","middle")
    .style("opacity",mismatchTextOpacity())
		.text(function(d){return d[1];});
    
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
  var joint_entropies = [["Joint","N/A"],
                         [jointentropy(sites,sequences.vaccine,numvac).toFixed(2),"N/A"],
                         [jointentropy(sites,sequences.placebo,numplac).toFixed(2),"N/A"],
                         [jointentropy(sites,sequences_raw,numvac+numplac).toFixed(2),"N/A"]];
  return joint_entropies;
}

function entropyTextOpacity(){
  if(showEntropies){
    return 1;
  } else {
    return 0;
  }
}

function mismatchTextOpacity(){
  if(showEntropies){
    return 0;
  } else {
    return 1;
  }
}

function displayEntropies(){
  showEntropies = true;
  canvas.select(".entropy.title.bar")
    .style("fill","black");
  canvas.select(".mismatch.title.bar")
    .style("fill","grey");
  canvas.selectAll(".mismatch.text")
    .transition()
    .style("opacity",0);
  canvas.selectAll(".entropy.text")
    .transition()
    .style("opacity",1);
}

function displayMismatchCounts(){
  showEntropies = false;
  canvas.select(".mismatch.title.bar")
    .style("fill","black");
  canvas.select(".entropy.title.bar")
    .style("fill","grey");
  canvas.selectAll(".entropy.text")
      .transition()
      .style("opacity",0);
  canvas.selectAll(".mismatch.text")
    .transition()
    .style("opacity",1);
}

function onClickChangeView(d,i){
  var site = selected_sites[i];
  // 37 is (arbitrary) magic number for a pretty zoom extent
  var s = 37;
  // the location of the translation is off
  var t = [-((site/vaccine.sequence.length)*(width)*(s-1) -
          (width+margin.left)/(s*2)), 0];
  // transition not smooth. needs help.
  siteselSVGg.transition().call(zoom.translate(t).scale(s).event);
}