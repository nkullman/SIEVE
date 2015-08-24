#Sequence alignment file
 - Alignment of breakthrough and vaccine immunogen sequences from the trial
 - Filename: `study.protein.reference.aa.fasta`
 - Should contain all breakthrough sequences and at least one immunogen sequence (a.k.a reference sequence)
 - A trial with multiple immunogens for a single protein could have an alignment with >1 reference sequence. However, the correct one to use for each analysis would depend on the name of the reference specified in the `Treatment assignment` file
 - There should only be one sequence per infected participant. Only sequences listed in the `Treatment assignment` file will be loaded for the analysis.
 - Each sequence has a sequence ID that is the string following `>` (for example `>AA3045`) and it should be the index in the `Treatment assignment file`
 
 
#Treatment assignment file
 - Contains seqIDs from the `Sequence alignment` and treatment assignments
 - Filename: `study.trt.csv`
 - File is a CSV with two columns: seqID and treatment
 - Treatment should be `vaccine` or `placebo` or `reference` to indicate the reference sequence for the analysis

#Distance file
 - A file containing distances for each sequence to the reference, possibly using more than one metric.
 - 

#Results file
