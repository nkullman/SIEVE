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
var sequences = {"vaccine":{}, "placebo":{}};
/** Object (dictionary) of sequence IDs with AA sequence (char array),
 * vac/plac, and mismatch (boolean array) */
var seqID_lookup = {};
/** Object with vaccine ID and AA sequence */
var vaccine = {};
/** Array with conservation and hxb2 info for each position */
var display_idx_map;
/* Lookup table with index for each hxb2 position*/
var refmap = {};
/** Number of people in the vaccine group */
var numvac = 0;
/** Number of people in the placebo group */
var numplac = 0;
/** Array of p-values */
var pvalues =[];
/** Array of absolute value of t-stats */
var tvalues =[];
/** Array of Entropy Values */
var entropies = {full:[],vaccine:[],placebo:[]};
d3.csv("data/VTN502.trt.csv", function(assigndata)
{
	parseTreatmentFile(assigndata);
	d3.text("data/VTN502.gag.MRK.fasta", function(fastadata)
	{
		doseqparsing(fastadata);
		d3.csv("data/VTN502.gag.MRK.vxmatch_site.distance.csv", function(distdata)
		{
			dodistparsing(distdata);
			d3.csv("data/TVN502.gag.MRK.vxmatch_site.results.csv", function(resultdata)
			{
					
			});
		});
	});	
});

function parseTreatmentFile(assigndata){
	seqID_lookup = d3.nest()
		.key(function(d) {return d.ptid;})
		.rollup(function(d) {
			if (d[0].treatment.toUpperCase().startsWith("P")){
				numplac++;
				return { "mismatch": [], "sequence": [], "vaccine": false };
			} else {
				numvac++;
				return { "mismatch": [], "sequence": [], "vaccine": true };
			}
		})
		.map(assigndata.filter(function(d){return !d.treatment.toLowerCase().startsWith("ref");}));
}

function doseqparsing(seqdata) {
	var lines = seqdata.split('\n');
	for (var i = 0; i < lines.length; ) {
		if (!lines[i].startsWith(">") || lines[i].length === 0) { i++; }
		else {
			var seqID = lines[i].substr(1).trim(/(\r\n|\n|\r)/gm);
			var seq = lines[i+1].split("");
			while (seq[seq.length-1].charCodeAt(0) < 32) { seq.pop(); }
			seqID_lookup[seqID].sequence = seq;
			sequences_raw.push(seq);
			if (seqID.startsWith("reference"))
			{
				vaccine.sequence = seq;
			} else if (seqID_lookup[seqID].vaccine) {
				sequences.vaccine.push(seq);
				numvac++;
			} else {
				sequences.placebo.push(seq);
				numplac++;
			}
			i += 2;
		}
	}
}

function dodistparsing(distdata)
{
	d3.nest()
		.key(function(d) {return d.ptid;})
		.rollup(function(d)
			{
				return {dists:d.map(function(a) {return a.distance})};
			})
		.entries(distdata);
	display_idx_map = distdata.filter(function (d)
		{
			return d.ptid == distdata[0].ptid;
		}).map(function(d) {return d.display_position;});
		
}

/** Transpose 2D array */
function transpose(array) {
  return array[0].map(function (_, c) { return array.map(function (r) { return r[c]; }); });
}