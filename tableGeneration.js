var colnames = ['Site (HXB2)','Vaccine','Placebo','Combined'];
var sortType = [1,1,1,1];

var showEntropies = true;
d3.select("#tableToggleText").on("click",toggleTableDisplay);

function generateTable(sites){
 d3.select(".table-zn table").remove();
 if (showEntropies) { generateEntropyTable(sites); }
 else { generateDistanceTable(sites); }
 if (sites.length > 0) updateTable(selected_sites);
}

function updateTable(sites){
  if (showEntropies) { updateEnropyTable(sites); }
  else { updateDistanceTable(sites); }
}

function generateEntropyTable(sites) {
  var table = d3.select(".table-zn")
      .append("table")
      .attr("id","entropyTable")
      .style("width","100%");
  table.append("caption").text("Entropy Summary");
      
  var thead = table.append("thead");
  var tbody = table.append("tbody");
  // create table header
  thead.append("tr")
    .selectAll("th")
    .data(colnames)
    .enter()
    .append("th")
      .attr("id", function (d,i) {return "entropyHeader" + i;})
      .style("cursor","pointer")
      .on("click", function(k,i){
        var currSortType = sortType[i];
        sortType[i] *= -1;
        var rowsToSort = tbody.selectAll("tr.siteRow");
        rowsToSort.sort(function(a,b) {
          if (currSortType > 0) {return whichIsBigger(a[k],b[k]);}
          else{ return -whichIsBigger(a[k],b[k]);}
        })
      })
      .text(function(column) { return column + " ↕"; });
  // create average and joint rows.
  // text in data cells is empty, because there is no selection during table generation
  var avgRow = tbody.append("tr").attr("class", "entropy averageRow groupStatRow");
  var jtRow = tbody.append("tr").attr("class", "entropy jointRow groupStatRow");
  avgRow.append("td").attr("class", "rowHeader").text("Average");
  jtRow.append("td").attr("class", "rowHeader").text("Joint");
  var numCellsToMake = d3.range(3);
  avgRow.selectAll("td:not(.rowHeader)").data(numCellsToMake).enter()
    .append("td")
      .attr("class", "entropy")
      .attr("id", function (d){
        if (d === 0) return "vaccineAverage";
        else if (d === 1) return "placeboAverage";
        else return "combinedAverage";
      })
      .text("-");
  jtRow.selectAll("td:not(.rowHeader)").data(numCellsToMake).enter()
    .append("td")
      .attr("class", "entropy")
      .attr("id", function (d){
        if (d === 0) return "vaccineJoint";
        else if (d === 1) return "placeboJoint";
        else return "combinedJoint";
      })
      .text("-");
      
  // holder for table rows while selection emtpy
  tbody.append("tr").attr("class","entropyTempRow")
    .append("td")
      .attr("colspan","4")
      .style("text-align","center")
      .text("Data will populate when a selection is made");
      
  // prepend click-to-delete area
  table.selectAll("tr").insert("th",":first-child")
    .on("click",function (d,i){
      if (typeof d != 'undefined'){ removeOnClick(d,i); }
    })
    .text(function(d){
      if (typeof d != 'undefined'){ return "X"; }
      else{ return ""; }
    });
 
}


function updateEnropyTable(sites) {
  var table = d3.select("#entropyTable");
  var tbody = table.select("tbody");
    // if selection not empty...
  if (sites.length > 0){
    // remove tempRow,
    d3.select(".entropyTempRow").remove();
    // populate table,
    var entropyData = calculateEntropyData(sites);
    var rows = tbody.selectAll("tr.siteRow").data(entropyData, function(d) { return d[colnames[0]];});
    rows.enter()
      .append("tr")
        .attr("class","siteRow")
        .attr("id", function(d) {
          return "siteRow-" + d[colnames[0]];
        })
        .insert("th",":first-child")
          .attr("class","deleteTableRowTrigger")
          .style("cursor","pointer")
          .on("click",function (d){
            if (typeof d != 'undefined'){ removeOnClick(d); }
          })
          .text(function(d){
            if (typeof d != 'undefined'){ return "X"; }
            else{ return ""; }
          });
    rows.exit().remove();
    var cells = rows.selectAll("td")
      .data(function(row){
        return colnames.map(function(column) {
          return row[column];
        })
      })
      .enter()
      .append("td")
        .text(function(d){
          return d;
        });
    // add on-click-zoom to each site row
    tbody.selectAll(".siteRow").select("td")
      .attr("class","siteRowSiteID")
      .style("cursor","pointer")
      .on("click", function(d){
        onClickChangeView(d);
    });
    // and replace average/joint row filler with actual values
    var avgEntropyData = calculateAverageEntropyData(entropyData);
    d3.select(".entropy#vaccineAverage").text(avgEntropyData[0]);
    d3.select(".entropy#placeboAverage").text(avgEntropyData[1]);
    d3.select(".entropy#combinedAverage").text(avgEntropyData[2]);
    
    var jointEntropyData = calculateJointEntropyData(sites);
    d3.select("#vaccineJoint").text(jointEntropyData[0]);
    d3.select("#placeboJoint").text(jointEntropyData[1]);
    d3.select("#combinedJoint").text(jointEntropyData[2]);
    
    // sort rows by site
    tbody.selectAll("tr.siteRow").sort(function(a,b) {
      return whichIsBigger(a[colnames[0]], b[colnames[0]]);
    });
    
  } else {
    // new strategy for zero-length site selection
    d3.select(".table-zn").html("");
    generateTable(sites);
  }
}

function calculateEntropyData(sites){
    return sites.map(function(d) {
      var result = {};
      result[colnames[0]] = envmap[d].hxb2Pos;
      result[colnames[1]] = entropies.vaccine[d];
      result[colnames[2]] = entropies.placebo[d];
      result[colnames[3]] = entropies.full[d];
      return result;
  });
}

function calculateAverageEntropyData(entropyData){
  return [
      d3.mean(entropyData.map(function(d){return +d.Vaccine;})).toFixed(2),
      d3.mean(entropyData.map(function(d){return +d.Placebo;})).toFixed(2),
      d3.mean(entropyData.map(function(d){return +d.Combined;})).toFixed(2)
    ];
}

function calculateJointEntropyData(sites){
  return [
      jointentropy(sites,sequences.vaccine,numvac).toFixed(2),
      jointentropy(sites,sequences.placebo,numplac).toFixed(2),
      jointentropy(sites,sequences_raw,numvac+numplac).toFixed(2)
    ];
}

function generateDistanceTable(sites) {
  var table = d3.select(".table-zn")
      .append("table")
      .attr("id","distanceTable")
      .style("width","100%");
  table.append("caption").text("Distance Summary");
      
  var thead = table.append("thead");
  var tbody = table.append("tbody");
  // create table header
  thead.append("tr")
    .selectAll("th")
    .data(colnames)
    .enter()
    .append("th")
      .attr("id", function (d,i) {return "distanceHeader" + i;})
      .style("cursor","pointer")
      .on("click", function(k,i){
        var currSortType = sortType[i];
        sortType[i] *= -1;
        var rowsToSort = tbody.selectAll("tr.siteRow");
        rowsToSort.sort(function(a,b) {
          if (currSortType > 0) {return whichIsBigger(a[k],b[k]);}
          else{ return -whichIsBigger(a[k],b[k]);}
        })
      })
      .text(function(column) { return column + " ↕"; });
  // create average and joint rows
  // text in data cells is empty, because there is no selection during table generation
  var avgRow = tbody.append("tr").attr("class", "distance averageRow groupStatRow");
  avgRow.append("td").attr("class", "rowHeader").text("Average");
  var numCellsToMake = d3.range(3);
  avgRow.selectAll("td:not(.rowHeader)").data(numCellsToMake).enter()
    .append("td")
      .attr("class", "distance")
      .attr("id", function (d){
        if (d === 0) return "vaccineAverage";
        else if (d === 1) return "placeboAverage";
        else return "combinedAverage";
      })
      .text("-");
      
  // holder for table rows while selection emtpy
  tbody.append("tr").attr("class","distanceTempRow")
    .append("td")
      .attr("colspan","4")
      .style("text-align","center")
      .text("Data will populate when a selection is made");
      
  // prepend click-to-delete area
  table.selectAll("tr").insert("th",":first-child")
    .on("click",function (d,i){
      if (typeof d != 'undefined'){ removeOnClick(d,i); }
    })
    .text(function(d){
      if (typeof d != 'undefined'){ return "X"; }
      else{ return ""; }
    });
 
}

function updateDistanceTable(sites) {
  var table = d3.select("#distanceTable");
  var tbody = table.select("tbody");
    // if selection not empty...
  if (sites.length > 0){
    // remove tempRow,
    d3.select(".distanceTempRow").remove();
    // populate table,
    var distanceData = calculateDistanceData(sites);
    var rows = tbody.selectAll("tr.siteRow").data(distanceData, function(d) { return d[colnames[0]];});
    rows.enter()
      .append("tr")
        .attr("class","siteRow")
        .attr("id", function(d) {
          return "siteRow-" + d[colnames[0]];
        })
        .insert("th",":first-child")
          .attr("class","deleteTableRowTrigger")
          .style("cursor","pointer")
          .on("click",function (d){
            if (typeof d != 'undefined'){ removeOnClick(d); }
          })
          .text(function(d){
            if (typeof d != 'undefined'){ return "X"; }
            else{ return ""; }
          });
    rows.exit().remove();
    var cells = rows.selectAll("td")
      .data(function(row){
        return colnames.map(function(column) {
          return row[column];
        })
      })
      .enter()
      .append("td")
        .text(function(d){
          return d;
        });
    // add on-click-zoom to each site row
    tbody.selectAll(".siteRow").select("td")
      .attr("class","siteRowSiteID")
      .style("cursor","pointer")
      .on("click", function(d){
        onClickChangeView(d);
      });
    // and replace average row filler with actual values
    var avgDistanceData = calculateAverageDistanceData(distanceData);
    d3.select(".distance#vaccineAverage").text(avgDistanceData[0]);
    d3.select(".distance#placeboAverage").text(avgDistanceData[1]);
    d3.select(".distance#combinedAverage").text(avgDistanceData[2]);
       
    // sort rows by site
    tbody.selectAll("tr.siteRow").sort(function(a,b) {
      return whichIsBigger(a[colnames[0]],b[colnames[0]])
    });
    
  } else {
    // new strategy for zero-length site selection
    d3.select(".table-zn").html("");
    generateTable(sites);
  }
}

function calculateDistanceData(sites){
    return sites.map(function(d) {
      
      // obtaining mismatch counts
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
      
      // writing mismatch data
      var result = {};
      result[colnames[0]] = envmap[d].hxb2Pos;
      result[colnames[1]] = mmcountvaccine;
      result[colnames[2]] = mmcountplacebo;
      result[colnames[3]] = mmcountfull;
      return result;
  });
}

function calculateAverageDistanceData(distanceData){
  return [
      d3.mean(distanceData.map(function(d){return +d.Vaccine;})).toFixed(2),
      d3.mean(distanceData.map(function(d){return +d.Placebo;})).toFixed(2),
      d3.mean(distanceData.map(function(d){return +d.Combined;})).toFixed(2)
    ];
}

// HXB2 site names are strings, since they may include letters
// this function does better than a string comparison for >, <, =
// since it first computes the numeric values of the string 
function whichIsBigger(a,b){
  // determine the numerical value of the arguments
  var firstNum, secondNum;
  if (!isNaN(+a)){
    firstNum = +a;
  } else {
    firstNum = +a.substring(0,a.length-1);
  }
  if (!isNaN(+b)){
    secondNum = +b;
  } else {
    secondNum = +b.substring(0,b.length-1);
  }
  // arguments' numeric values stored
  // return normal sort returns
  if (firstNum === secondNum) {
    // if numeric values are the same, there are three possible situations:
    // -1: the second input is larger bc it has a later letter appended to it
    //  1: the first input is larger bc it has a later letter appended to it
    //  0: the inputs have the same exact value
    if (a > b) return 1;
    else if (a < b) return -1;
    return 0;
  } else {
    // if numeric values are not the same, then we sort the larger of the numeric values
    if (firstNum > secondNum) return 1;
    else return -1; // (firstNum < secondNum). It is impossible to have equality here (would have been captured in outer if)
  }
}
  

	function removeOnClick(d) {
    var site = refmap[d["Site (HXB2)"]];
    var idx = selected_sites.indexOf(site);
		selected_sites.splice(idx, 1);
    var bar = d3.select("#sitebar" + site);
    var yval = overview_yscale(idx);
			bar.classed("selected",false)
				.attr('opacity', 0.5)
				.attr("y", yval )
				.attr("height", height - yval);
    update_AAsites(selected_sites);
		updatePyramid(selected_sites);
    updateTable(selected_sites);
	}

function toggleTableDisplay(){
  showEntropies = !showEntropies;
  generateTable(selected_sites);
}

function onClickChangeView(d){
  var site = refmap[d["Site (HXB2)"]];
  // 37 is (arbitrary) magic number for a pretty zoom extent
  var s = 37;
  // the location of the translation is off
  var t = [-((site/vaccine.sequence.length)*(width)*(s-1) -
          (width+margin.left)/(s*2)), 0];
  // transition not smooth. needs help.
  siteselSVGg.transition().call(zoom.translate(t).scale(s).event);
}