"""
Generate data files and TOC file for the visualization.

Depends on vtn_sieve and pysieve (vtn_sieve is a private repository that cannot be shared)

See file specification at file_spec.md
"""

from pysieve import *
from vtn_sieve import *

studyClasses = [sieveVTN502, sieveVTN503, sieveVTN505, sieveRV144]
analysisClasses = [vxmatch_siteAnalysis]

for sc in studyClasses:
	"""For each study, loop over all analyses and produce files for each."""
	s = sc()
	for va in s.validAnalyses:
		s.loadData(**va)
		s.to_fasta()
		s.to_treatment_file()
		for ac in analysisClasses:
			a = ac(sd = s.data)
			a.computeDistances()
			a.to_distance_csv()
			a.copmutePvalues()
			a.to_csv()