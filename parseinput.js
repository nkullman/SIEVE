/** Parse sieve analysis input files.
 * Expected input files:
 * 	FASTA file with vaccine ID and AA sequence
 * 	FASTA file with breakthrough sequences and IDs
 * 	CSV with seqID:treatment (vaccine/placebo) treatment
 * 	CSV with sequence mismatches (relative to vaccine) for each seqID */

/** 2D-array (of chars) representing AAs at each position in the sequence
 * for the vaccine and each sequence ID */
var seqID_pos;
/** Object (dictionary) storing sequence IDs with keys for AA sequence (char array),
 * vac/plac, and mismatch (boolean array) */
var seqID_lookup;
/** Object storing vaccine information: ID and AA sequence */
var vaccine;


parseVaccineSeq("env.aa.92TH023.fasta");
parseSeqIDs_trt("rv144_trt_lookup.csv");
parseSeqMismatch("rv144.env.mismatch.distance.csv");
parseSeqIDFasta("rv144.env.aa.fasta");

/** Read in FASTA file containing vaccine ID and AA sequence.
 * Make vaccine AA sequence first row in seqID_aa matrix.
 * Add data to vaccine object */
function parseVaccineSeq(filename) {
	d3.text(filename, function(data) { 
		var lines = data.split('\n');
		// add vaccine ID to vaccine object
		vaccine = {};
		vaccine.ID = lines[0].substr(1);
		// add vaccine sequence (char array) to vaccine object and seqID_pos matrix
		var vacseq = lines[1].split("");
		vaccine.sequence = vacseq;
		seqID_pos = new Array(vacseq);
	});
}

/** Read in CSV containing sequence IDs and vac/plac info.
 * Store sequence IDs as keys for the objects in seqID_lookup array.
 */
function parseSeqIDs_trt(filename) {
	d3.csv(filename, function(data) {
		seqID_lookup = d3.nest()
			.key(function(d) {return d.sampleID;})
			.rollup(function(d) {
				if (d[0].treatment.toUpperCase().startsWith("P")){
					return { "vaccine": false };
				} else {
					return { "vaccine": true };
				}
			})
			.map(data);
	});
}

/** Read in CSV containing mismatch data for each sequence ID.
 * Store under corresponding entry in SeqID_lookup array
 */
function parseSeqMismatch(filename) {
	d3.csv(filename, function(data) {
		for (var i = 0; i < data.length; i++) {
			// convert each entry to an array
			var mm = d3.values(data[i]);
			// remove the sequence ID from the array
			var seqID = mm.splice(mm.length-1,1)[0];
			// convert mm array from string to int
			mm = stringArrToIntArr(mm);
			// add mm to seqID
			seqID_lookup.seqID.mismatch = mm;
		}
	});
}

/** Read in FASTA file containing AA sequences for each breakthrough sequence ID.
 * Store AA sequences (as char arrays) as rows in seqID_pos matrix.
 * Add AA sequences to corresponding objects in seqID_lookup array. */
function parseSeqIDFasta(fastafile) {
	d3.text(fastafile, function(rawdata) { 
		var lines = rawdata.split('\n');
		for (var i = 1; i < lines.length; i+=2) { lines[i] = lines[i].split(""); }
		console.log(lines);
		
		// add sequences (in order) to seqID_pos matrix		
		// add to seqID_lookup object w/keys: seqIDs; values: AA sequence
	});
}

function stringArrToIntArr(array){
	var result = array;
	for (var i = 0; i < result.length; i++){
		result[i] = parseInt(result[i]);
	}
	return result;
}