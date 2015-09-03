"""
Generate data files and TOC file for the visualization.

Depends on vtn_sieve and pysieve (vtn_sieve is a private repository that cannot be shared)

See file specification at file_spec.md
"""

from pysieve import substbased
from seqdistance.matrices import binarySubst, addGapScores, binGapScores
from vtn_sieve import *

nperms = 50

#studyClasses = [sieveVTN502, sieveVTN503, sieveVTN505, sieveRV144]
studyClasses = [sieveVTN502, sieveVTN505]
analysisClasses = [substbased.vxmatch_siteAnalysis]

analysisParams = dict(subst=addGapScores(binarySubst,binGapScores))

toc = {k:[] for k in ['study','protein','reference','distance']}
for sc in studyClasses:
    """For each study, loop over all analyses and produce files for each."""
    s = sc()
    for va in s.validAnalyses:
        s.loadData(**va)
        s.to_fasta()
        s.to_treatment_file()
        for ac in analysisClasses:
            a = ac(sievedata=s.data)
            a.initialize(params=analysisParams)
            a.computeDistance()
            a.computeObserved(filter=None)
            a.permutationTest(nperms, clusterClient = None)
            a.computePvalues()
            a.to_distance_csv()
            a.to_csv()

            toc['study'].append(s.studyName)
            toc['protein'].append(s.proteinName)
            toc['reference'].append(s.insertName)
            toc['distance_method'].append(a.analysisName)
tocDf = pd.DataFrame(toc)
tocDf.to_csv('sieve_toc.csv', index = False)


