"""
Generate data files and TOC file for the visualization.

Depends on vtn_sieve and pysieve (vtn_sieve is a private repository that cannot be shared)

See file specification at file_spec.md
"""

from pysieve import substbased
from seqdistance.matrices import binarySubst, addGapScores, binGapScores
from vtn_sieve import *
import pandas as pd

def generateData(studyClasses, analysisClasses, analysisParams, nperms=10000):
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
                a.computeDistance(params=analysisParams)
                a.computeObserved(distFilter=None)
                a.permutationTest(nperms, clusterClient=None)
                a.computePvalues()
                a.to_distance_csv()
                a.to_csv()

def generateTOC(studyClasses, analysisClasses):
    tocColumns =  ['study','protein','reference','distance_method']
    toc = {k:[] for k in tocColumns}
    for sc in studyClasses:
        """For each study, loop over all analyses and produce files for each."""
        s = sc()
        for va in s.validAnalyses:
            for ac in analysisClasses:
                a = ac(None)
                toc['study'].append(s.studyName)
                toc['protein'].append(va['proteinName'])
                toc['reference'].append(va['insertName'])
                toc['distance_method'].append(a.methodName)
    tocDf = pd.DataFrame(toc)[tocColumns]
    return tocDf

if __name__ == '__main__':
    #studyClasses = [sieveVTN502, sieveVTN503, sieveVTN505, sieveRV144]
    studyClasses = [sieveVTN502, sieveRV144]
    analysisClasses = [substbased.vxmatch_siteAnalysis]
    analysisParams = dict(subst=addGapScores(binarySubst, binGapScores))

    #generateData(studyClasses, analysisClasses, analysisParams)
    tocDf = generateTOC(studyClasses, analysisClasses)
    tocDf.to_csv('sieve_toc.csv', index=False)
>>>>>>> 5174f991c7ddfc922307ecc69d71094e4f2d4787
