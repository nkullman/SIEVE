/** Parse sieve analysis input files.
 * Expected input files:
 * 	FASTA file with vaccine ID and AA sequence
 * 	FASTA file with breakthrough sequences and IDs
 * 	CSV with seqID:treatment (vaccine/placebo) treatment
 * 	CSV with sequence mismatches (relative to vaccine) for each seqID */

/** 2D-array (of chars) representing AAs at each position in the sequence
 * for the vaccine and each sequence ID */
var sequences_raw = [];
/** Object holding a 2D-array of sequences for both the vaccine and placebo groups */
var sequences = {"vaccine":[], "placebo":[]};
/** Dictionary with sequence IDs as keys and entries for:
 * 		AA sequence (char array),
 * 		distances (dictionary with array for each distance measure)
 * 		vaccine/placebo status (boolean) */
var seqID_lookup = {};
/** Object with vaccine ID and AA sequence */
var vaccine = {};
/** Array with conservation and reference info for each position */
var display_idx_map;
/* Lookup table with index for each hxb2 position*/
var refmap = {};
/** Number of people in the vaccine group */
var numvac = 0;
/** Number of people in the placebo group */
var numplac = 0;
/** Dictionary with wite-level statistics to display in navigation chart.
 * 	Entries are dictionaries for each distance measurement, within which are
 * 		entries that hold a site statistic and its array of values */
var siteStats = {/*EX: vxmatch_site:{placDist: [], vacDist: [], sieve_statistic: [], pval: [], qval: []}*/};
/** Appropriate scale for each of the stats above */
var statScales = {};
/** Associated axes to above */
var statAxes = {};
/** Array of p-values */
var pvalues =[];
/** Array of absolute value of t-stats */
var tvalues =[];
/** Array of Entropy Values */
var entropies = {full:[],vaccine:[],placebo:[]};
/**  Object with nests of distances for each distance method */
var dists;
/** Datasets available for analysis */
var availableDatasets;
/** Initial values for study name, protein, immunogen, and distance measure */
var studyname,
	protein,
	immunogen,
	dist_metric;
	
/* Load page with initial dataset */
d3.csv("data/sieve_toc.csv", function (toc){
	// store available data in the table of contents
	availableDatasets = toc;
	// use this data to populate the dropdown list in the 
	populateOtherDatasetsDropdown();
	
	var initialDataset;
	// see if a dataset was specified in URL
	var urlStudyString = getParameterByName("study"),
		urlProteinString = getParameterByName("protein"),
		urlImmunogenString = getParameterByName("immunogen"),
		urlDistString = getParameterByName("dist");
	
	if (urlStudyString !== "" || urlProteinString !== "" || urlImmunogenString !== "" || urlDistString !== ""){
		// If it was, we will attempt to use it as our initial view
		// We will pare down the array of availableDatasets to only those that match the inputs
		var potentialDatasets = availableDatasets;
		// First, the study name
		if (urlStudyString !== ""){
			potentialDatasets = potentialDatasets.filter(function(e,i,arr){
				return e.study.toUpperCase() === urlStudyString.toUpperCase();
			});
			if (potentialDatasets.length > 0) {
				// if there is at least one match, then the study name is valid and we use it
				studyname = urlStudyString.toUpperCase();
				// next level of hierarchy is the protein name
				if (urlProteinString !== "") {
					potentialDatasets = potentialDatasets.filter(function(e,i,arr){
						return e.protein.toLowerCase() === urlProteinString.toLowerCase();
					});
					if (potentialDatasets.length > 0){
						protein = urlProteinString.toLowerCase();
						// next level of hierarchy is the immunogen
						if (urlImmunogenString !== ""){
							potentialDatasets = potentialDatasets.filter(function(e,i,arr){
								return e.immunogen.toUpperCase() === urlImmunogenString.toUpperCase();
							});
							if (potentialDatasets.length > 0){
								// the immunogen provided is valid, and we use it
								immunogen = urlImmunogenString.toUpperCase();
								// last level of hierarchy is the distance measure 
								if (urlDistString !== ""){
									potentialDatasets = potentialDatasets.filter(function(e,i,arr){
										return e.distance_method.toLowerCase() === urlDistString.toLowerCase();
									});
									if (potentialDatasets.length > 0){
										// the distance method is a match
										dist_metric = urlDistString.toLowerCase();
										// all input specifications are met. Take the remaining potential dataset as our default
										initialDataset = potentialDatasets[0];
									} else {
										// the distance method specified was not recognized. Take a default
										initialDataset = availableDatasets.filter(function(e,i,arr){
											return e.immunogen.toUpperCase() === immunogen && e.protein.toLowerCase() === protein && e.study.toUpperCase() === studyname;
										})[0];
										dist_metric = initialDataset.distance_method;
										alert("The distance measure provided was not recognized. Using the first available distance measure for study " + studyname + ", protein " + protein + ", and immunogen " + immunogen);
									}
								} else {
									// no distance measure was provided. Choose one by default
									initialDataset = availableDatasets.filter(function(e,i,arr){
										return e.immunogen.toUpperCase() === immunogen && e.protein.toLowerCase() === protein && e.study.toUpperCase() === studyname;
									})[0];
									dist_metric = initialDataset.distance_method;
									alert("A distance measure was not specified. Using the first available for study " + studyname + ", protein " + protein + ", and immunogen " + immunogen);
								}
							} else {
								// the immunogen provided was not valid. use the first availableDataset with the study and protein logged
								initialDataset = availableDatasets.filter(function(e,i,arr){
									return e.protein.toLowerCase() === protein && e.study.toUpperCase() === studyname;
								})[0];
								immunogen = initialDataset.immunogen;
								dist_metric = initialDataset.distance_method;
								alert("The immunogen provided is not supported. Showing the first dataset for study " + studyname + " and protein " + protein)
							}
						} else{
							// no immunogen was provided. load the first availableDataset whose study and protein match what we've recorded
							initialDataset = availableDatasets.filter(function(e,i,arr){
								return e.protein.toLowerCase() === protein && e.study.toUpperCase() === studyname;
							})[0];
							immunogen = initialDataset.immunogen;
							dist_metric = initialDataset.distance_method;
							alert("An immunogen was not specified. Showing the first dataset for study " + studyname + " and protein " + protein);
						}
					} else {
						// study name is valid but protein is not.
						// Take the first availableDataset whose study is a match
						initialDataset = availableDatasets.filter(function(e,i,arr){
							return e.study.toUpperCase() === studyname;
						})[0];
						protein = initialDataset.protein;
						immunogen = initialDataset.immunogen;
						dist_metric = initialDataset.distance_method;
						alert("The specified protein is not supported. Showing the first dataset for study " + studyname);
					}
				} else {
					// the protein string was empty, load the first availableDataset whose study matched what we recorded
					initialDataset = availableDatasets.filter(function(e,i,arr){
						return e.study.toUpperCase() === studyname;
					})[0];
					protein = initialDataset.protein;
					immunogen = initialDataset.immunogen;
					dist_metric = initialDataset.distance_method;
					alert("A protein was not specified. Showing the first dataset for study " + studyname);
				}
			} else {
				// study name was invalid. Use as the initial view the first dataset available
				initialDataset = availableDatasets[0];
				studyname = initialDataset.study;
				protein = initialDataset.protein;
				immunogen = initialDataset.immunogen;
				dist_metric = initialDataset.distance_method;
				alert("The study provided is not supported. A default sieve analysis dataset will be loaded.")
			}
		} else {
			// the study name was not specified in the URL. Use the default initial view
			initialDataset = availableDatasets[0];
			studyname = initialDataset.study;
			protein = initialDataset.protein;
			immunogen = initialDataset.immunogen;
			dist_metric = initialDataset.distance_method;
			alert("No study was specified, so a default sieve analysis dataset will be loaded.")
		}
	} else {
		// otherwise, just pick the first row from the table of contents
		initialDataset = availableDatasets[0];
		studyname = initialDataset.study;
		protein = initialDataset.protein;
		immunogen = initialDataset.immunogen;
		dist_metric = initialDataset.distance_method;
	}
	
	// define object containing all required files' names
	var inputFiles = getInputFilenames(studyname, protein, immunogen, dist_metric);
	parseInput(inputFiles);
});


function parseInput(inputFiles){

d3.csv(inputFiles.treatmentFile, function(assigndata)
{
	parseTreatmentFile(assigndata);
	d3.text(inputFiles.sequenceFastaFile, function(fastadata)
	{
		doseqparsing(fastadata);
		d3.csv(inputFiles.distanceFile, function(distdata)
		{
			dodistparsing(distdata);
			d3.csv(inputFiles.resultsFile, function(resultdata)
			{
				parseResultsFile(resultdata);
				
				// Transpose data for easier access
				sequences_raw = transpose(sequences_raw);
				sequences.vaccine = transpose(sequences.vaccine);
				sequences.placebo = transpose(sequences.placebo);
				// calculate entropies
				for(var i=0; i < sequences_raw.length; i++){
					entropies.full.push(jointentropy([i],sequences_raw,numvac+numplac).toFixed(2));
				}
				for(var i=0; i < sequences.vaccine.length; i++){
					entropies.vaccine.push(jointentropy([i],sequences.vaccine,numvac).toFixed(2));
				}
				for(var i=0; i < sequences.placebo.length; i++){
					entropies.placebo.push(jointentropy([i],sequences.placebo,numplac).toFixed(2));
				}
				// If loaded URL contains sites, add them to the current selection
				var urlSiteString = getParameterByName("sites");
				if (urlSiteString !== ""){
					// get sites identified by reference strand
					var urlSites = urlSiteString.split(",");
					// convert sites back to 0-based index
					//(our working index instead of the reference index)
					urlSites.forEach(function(d,i){
						urlSites[i] = refmap[urlSites[i]];
					})
					while(urlSites.length > 0){
						selected_sites.push(urlSites.pop());
					}
				}
				
				// Build the visualization
				generateVis();
					
			});
		});
	});	
});
}

function parseTreatmentFile(assigndata){
	seqID_lookup = d3.nest()
		.key(function(d) {return d.ptid;})
		.rollup(function(d) {
			if (d[0].treatment.toUpperCase().startsWith("P")){
				return { "distance": {}, "sequence": [], "vaccine": false };
			} else {
				return { "distance": {}, "sequence": [], "vaccine": true };
			}
		})
		.map(assigndata.filter(function(d){return !d.treatment.toLowerCase().startsWith("ref");}));
}

function doseqparsing(fastadata) {
	var fastaSequences = fastadata.split(/[;>]+/);
	for (var i = 0; i < fastaSequences.length; i++) {
		if (fastaSequences[i].length !== 0) {
			var seqID = fastaSequences[i].substring(0,fastaSequences[i].indexOf("\n")).trim(/[\n\r]/g, '');
			var seq = fastaSequences[i].substring(fastaSequences[i].indexOf("\n") + 1, fastaSequences[i].length);
			seq = seq.replace(/[\n\r]/g, '');
			seq = seq.split("");
			sequences_raw.push(seq);
			if (seqID.startsWith("reference"))
			{
				vaccine.ID = seqID.substring(seqID.lastIndexOf('|')+1, seqID.length);
				vaccine.sequence = seq;
			} else if ((seqID in seqID_lookup) && seqID_lookup[seqID].vaccine) {
				seqID_lookup[seqID].sequence = seq;
				sequences.vaccine.push(seq);
				numvac++;
			} else if (seqID in seqID_lookup) {
				seqID_lookup[seqID].sequence = seq;
				sequences.placebo.push(seq);
				numplac++;
			}
		}
	}
}

function dodistparsing(distdata)
{
	dists = d3.nest()
		.key(function(d) {return d.distance_method;})
		.rollup(function(data)
			{
				return d3.nest()
					.key(function(d) { return d.ptid; })
					.rollup(function(d) { return d.map(function(a) {return a.distance;}); })
					.entries(data);
			})
		.entries(distdata);
	display_idx_map = distdata.filter(function (d)
		{
			return d.ptid == distdata[0].ptid && d.distance_method == distdata[0].distance_method;
		}).map(function(d) {return d.display_position;});
	display_idx_map.forEach(function(d, i) {refmap[d] = i;});
	
	var distMethodSelector = d3.select("#distMethod_selector");
	dists.forEach(function(d,i){
		var newOption = distMethodSelector.append("option")
			.attr("value", d["key"])
			.attr("id","yscale-selection-option-" + d["key"])
			.text(d["key"]);
		if (i === 0){ newOption.attr("selected","selected"); }
	})
}

function parseResultsFile(resultdata){
	
	var statsToDisplay = Object.keys(resultdata[0]).filter(function(d,i){ return i > 2; })
	siteStats = d3.nest()
		.key(function(d) {return d.distance_method;})
		.rollup(function(d){
			var result = {};
			for (var statidx in statsToDisplay){
				var stat = statsToDisplay[statidx];
				result[stat] = d.map(function(a){return +a[stat];});
			}
			return result;
		})
		.map(resultdata);
		
	var yScaleSelector = d3.select("#yscale_selector");
	statsToDisplay.forEach(function(d){
		var newOption = yScaleSelector.append("option")
			.attr("value", d)
			.attr("id","yscale-selection-option-" + d)
			.text(d);
		// hard coded for now. Will data always contain a pvalue?
		// answer is yes if we decide to build in a simple pval generator
		if (d === "pvalue"){ newOption.attr("selected","selected"); }
	})
		
	for (var metric in siteStats)
	{
		statScales[metric] = {};
		statAxes[metric] = {};
		
		for (var stat in siteStats[metric])
		{			
			//test if the stat name is some variant of
			//p-value or q-value
			if (/^[pq][\s-]?val/i.test(stat))
			{
				statScales[metric][stat] = d3.scale.log()
					.domain([d3.min(siteStats[dist_metric][stat]), 1])
					.range([0, .95*height])
					.nice();
				statAxes[metric][stat] =
					{"left":d3.svg.axis()
						.scale(statScales[metric][stat])
						.orient("left")
						.ticks(5, "g"),
					"right":d3.svg.axis()
						.scale(statScales[metric][stat])
						.orient("right")
						.ticks(5, "g")};
				if (/^p/i.test(stat))
				{ //Try to set the default stat to pvalue
					yscale_mode = stat;
				}
			} else {
				statScales[metric][stat] = d3.scale.linear()
					.range([.95*height, 0])
					.domain([-1,0]);
				statAxes[metric][stat] =
					{"left":d3.svg.axis()
						.scale(statScales[metric][stat])
						.orient("left")
						.ticks(5),
					"right":d3.svg.axis()
						.scale(statScales[metric][stat])
						.orient("right")
						.ticks(5)};
			}
			if (yscale_mode === undefined)
			{ //No pvalue, set stat to arbitrary value
				for (var key in statScales[metric]) break;
				yscale_mode = key;
			}
		}
	}
}

/** Transpose 2D array */
function transpose(array) {
  return array[0].map(function (_, c) { return array.map(function (r) { return r[c]; }); });
}

/**  */
function getInputFilenames(studyname, protein, immunogen, dist_metric){
	var result = {};
	result.treatmentFile = "data/" + studyname + "." + protein + "." + immunogen + ".trt.csv";
	result.sequenceFastaFile = "data/" + studyname + "." + protein + "." + immunogen + ".fasta";
	result.distanceFile = "data/" + studyname + "." + protein + "." + immunogen + "." + dist_metric + ".distance.csv";
	result.resultsFile = "data/" + studyname + "." + protein + "." + immunogen + "." + dist_metric + ".results.csv";
	return result;
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function populateOtherDatasetsDropdown (){
	var dataDropdown = d3.select("#otherDatasetsDropdownList")
	// for each element in availableDatasets
	availableDatasets.forEach(function(elm, idx){
		// get the URL we want to jump to
		var currURL = document.URL;
		if (currURL.indexOf("?") > -1){ currURL = currURL.substring(0,currURL.indexOf("?")); }
		var newStudyURL = currURL + "?" + 
					"study=" + elm.study + "&protein=" + elm.protein + "&immunogen=" + elm.immunogen + "&dist=" + elm.distance_method;
		// add it to the dropdown list
		dataDropdown.append("li")
		  .append("a")
		    .attr("href", newStudyURL)
			.text(elm.study + ", " + elm.protein + ", " + elm.immunogen + ", " + elm.distance_method);
		return;
	});
}