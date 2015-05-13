// 2D-array (chars) of sequence IDs x sequences 
var seqID_aa;
// Object storing sequence IDs, sequences, vac/plac, mismatch
var seqID;

// read in fastaFile, create 2D array and object w/ seqIDs
parseSeqIDFasta("rv144.env.aa.fasta");

// read in mismatch CSV, add mismatch seqs to seqID object
addSeqMismatch("rv144.env.mismatch.distance.csv");

// read in trt info, add to seqID object
addSeqTreatment("rv144_trt_lookup.csv");

// read in vaccine seq (and do what with it?)
getVaccineSeq("env.aa.92TH023.fasta");

function parseSeqIDFasta(fastafile) {
	
	d3.text(fastafile, function(rawdata) { 

		var lines = rawdata.split('\n');
		for (var i = 1; i < lines.length; i+=2) { lines[i] = lines[i].split(""); }
		console.log(lines);
		
		// store 2D-array of seqIDs and AAs (sequences)
		
		// create object w/keys: seqIDs, values: sequence, vac/plac

	});
}

function addSeqMismatch(filename) {
	
	d3.csv(filename, function(data) {
		
		// read in rows, add them to their entry in seqID object		
	});
}

function addSeqTreatment(filename) {
	
	d3.csv(filename, function(data) {
		
		// read in rows, add them to their entry in seqID object		
	});
}

function getVaccineSeq(vacfastafile) {
	
	d3.text(vacfastafile, function(rawdata) { 

		var lines = rawdata.split('\n');
		for (var i = 1; i < lines.length; i+=2) { lines[i] = lines[i].split(""); }
		console.log(lines);
		
		// add vaccine to first row of 2D seq array?
		// give it its own entry in the seqID object?

	});
}