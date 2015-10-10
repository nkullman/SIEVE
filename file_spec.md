#(1) Sequence alignment file
 - Alignment of breakthrough and vaccine immunogen sequences from the trial
 - Filename: `STUDY.PROTEIN.REF.fasta`
 - Should contain all breakthrough sequences and at least one immunogen sequence (a.k.a. reference sequence)
 - A trial with multiple immunogens for a single protein could have an alignment with >1 reference sequence (e.g. `>reference|gag|MRK`. However, the correct one to use for each analysis would depend on the name of the reference specified in the `Treatment assignment` file
 - There should only be one sequence per infected participant. Only sequences listed in the `Treatment assignment` file will be loaded for the analysis.
 - Each sequence has a sequence ID that is the string following `>` (for example `>AA3045`) and it should be the index in the `Treatment assignment file`
 - File should also contain a reference sequence that corresponds to the display positions used below (e.g. `>HXB2`)
 
#(2) Treatment assignment file
 - Contains seqIDs from the `Sequence alignment` and treatment assignments
 - Filename: `STUDY.PROTEIN.REF.trt.csv`
 - File is a CSV with two columns: seqID and treatment
 - Treatment should be `vaccine` or `placebo` or `reference` to indicate the reference sequence for the analysis
 - Though treatment assignments are shared between analyses of different proteins and references, there is one file per analysis due to the identification of the reference sequence in this file.

#(3) Distance file
 - A CSV file containing distances to the reference for each sequence
 - Columns: seqID, start_position, display_pos, distance_method, distance
 - Filename: `STUDY.PROTEIN.REF.dist.csv`
 - May contain multiple distances per sequence, one for each method (CSV contains 1 distance per row, N_methods x N_seqIds total rows)
 - The display_pos column will be used to specify translations of the start positions into a refernce sequence coordinate e.g. HXB2 (for HIV it would always be HXB2, but for Dengue or some other trial, it could be something else). If this column doesn't exist it could simply be 1-based indexing of the start_position.
 - Missing or non-definable distances will have the string value "NAN" in the CSV file
 - Optionally, if this file is missing then calculate a mismatch distance (`Long term TODO`)
 
#(4) Results file
 - A CSV file containing sieve analysis results (i.e. a statistic comparing the treatment groups, a p-value and optionally, a q-value)
 - Columns: distance_method, display_position, start_position, placebo_distance, vaccine_distance, sieve_statistic, pvalue, qvalue
 - Rows: 1 row per site per distance method
 - Filename: `STUDY.PROTEIN.REF.result.csv`
 - The sieve_statistic is the magnitude of the treatment effect (e.g. t-statistic) at each site
 - Missing or non-definable statistics will have the string value "NAN" in the CSV file
 - Optionally, additional columns could specify additional statistics, as these could be displayed instead of the p-value in the top plot (`Long term TODO`)
 - Optionally, if this file is missing then compute a tstatistic comparing the two treatment groups and report unadjusted p-values.
