library(Deducer)

mismatches = read.csv("rv144.env.mismatch.distance.csv",sep=",",stringsAsFactors=FALSE)
treatment = read.csv("rv144_trt_lookup.csv",sep=",",stringsAsFactors=FALSE)

names(mismatches)[1] = "sampleID"
thedata = merge(mismatches,treatment,by="sampleID")[-1]

pvalues = c()
for(i in 1:(ncol(thedata)-1)){
  print(i)
  pvalues = c(pvalues,perm.t.test(thedata[,i][(thedata[,1012] == "VACCINE")]
                                  ,thedata[,i][(thedata[,1012] == "PLACEBO")]
                                  ,alternative = "two.sided",B=10000)$p.value)
}

qvalues = p.adjust(pvalues,method = "fdr")
for(i in 1:length(qvalues)){
  if(is.na(qvalues[i])){
    qvalues[i] = 1
  }
}


for(i in 1:length(pvalues)){
  if(is.na(pvalues[i])){
    pvalues[i] = 1
  }
}


temp = data.frame(pvalues)
temp2 = data.frame(qvalues)
names(temp)[1] = "pvalue"
names(temp2)[1] = "qvalue"
write.csv(temp,"pvalues.csv",row.names=F)
write.csv(temp2,"qvalues.csv",row.names=F)