/** Parse sieve analysis input files.
 * Expected input files:
 * 	FASTA file with vaccine ID and AA sequence
 * 	FASTA file with breakthrough sequences and IDs
 * 	CSV with seqID:treatment (vaccine/placebo) treatment
 * 	CSV with sequence mismatches (relative to vaccine) for each seqID */

/** 2D-array (of chars) representing AAs at each position in the sequence
 * for the vaccine and each sequence ID */
var sequences;
/** Object (dictionary) of sequence IDs with AA sequence (char array),
 * vac/plac, and mismatch (boolean array) */
var seqID_lookup;
/** Object with vaccine ID and AA sequence */
var vaccine;
/** Object with conservation and hxb2 info for each position */
var envmap;

d3.text("env.aa.92TH023.fasta", function(vacdata) {
	dovacparsing(vacdata);
	d3.csv("rv144_trt_lookup.csv", function(trt_lookup_data) {
		createdictionary(trt_lookup_data);
		d3.csv("rv144.env.mismatch.distance.csv", function(mmdata) {
			addmmtodict(mmdata);
			d3.text("rv144.env.aa.fasta", function(seqdata) {
				doseqparsing(seqdata);
				d3.csv("env.map.csv", function(mapdata){
					makeenvmap(mapdata);
					sequences = transpose(sequences);
					
					generateVis();
					
				});
			});
		});
	});
});

/** After having read in FASTA file containing vaccine ID and AA sequence,
 * make vaccine AA sequence first row in sequences matrix.
 * add data to vaccine object */
function dovacparsing(vacdata){
	var lines = vacdata.split('\n');
	// add vaccine ID to vaccine object
	vaccine = {};
	vaccine.ID = lines[0].substr(1);
	// add vaccine sequence (char array) to vaccine object and sequences matrix
	var vacseq = lines[1].split("");
	vaccine.sequence = vacseq;
	sequences = new Array(vacseq);
}

/** Create dictionary using sequence IDs and add treatment info (vaccine/placebo)
 */
function createdictionary(trt_lookup_data) {
	seqID_lookup = d3.nest()
		.key(function(d) {return d.sampleID;})
		.rollup(function(d) {
			if (d[0].treatment.toUpperCase().startsWith("P")){
				return { "vaccine": false };
			} else {
				return { "vaccine": true };
			}
		})
		.map(trt_lookup_data);
}

/** Add mismatch data to corresponding entry in SeqID_lookup array
 */
function addmmtodict(mmdata) {
	for (var i = 0; i < mmdata.length; i++) {
		// convert each entry to an array
		var mm = d3.values(mmdata[i]);
		// remove the sequence ID from the array
		var seqID = mm.splice(mm.length-1,1)[0];
		// convert mm array from string to int
		mm = stringArrToIntArr(mm);
		// add mm to seqID
		seqID_lookup[seqID].mismatch = mm;
	}
}

/** Store AA sequences (as char arrays) as rows in sequences matrix.
 * Add AA sequences to corresponding objects in seqID_lookup array. */
function doseqparsing(seqdata) {
	var lines = seqdata.split('\n');
	for (var i = 0; i < lines.length; i += 0) {
		if (!lines[i].startsWith(">") || lines[i].length === 0) { i++; }
		else {
			var seqID = lines[i].substr(1).trim(/(\r\n|\n|\r)/gm);
			var seq = lines[i+1].split("");
			seqID_lookup[seqID].sequence = seq;
			sequences.push(seq);
			i += 2;
		}
	}
}

/** Store HBX2 and conservation data in an object with keys for each AA position index
 */
function makeenvmap(mapdata) {
	envmap = d3.nest()
		.key(function(d) {return d.posIndex;})
		.rollup(function(d) {
			return { "hxb2Pos": d[0].hxb2Pos,
					 "hxb2aa": d[0].hxb2aa,
					 "conservation": d[0].conservation };
			
		})
		.map(mapdata);
}

/** Convert an array of strings to integers */
function stringArrToIntArr(array){
	var result = array;
	for (var i = 0; i < result.length; i++){
		result[i] = parseInt(result[i]);
	}
	return result;
}

/** Transpose 2D array */
function transpose(array) {
  return array[0].map(function (_, c) { return array.map(function (r) { return r[c]; }); });
}

/** With data in hand, make the visualization */
function generateVis(){
	console.log(sequences);
	console.log(vaccine);
	console.log(seqID_lookup);
	console.log(envmap);
}