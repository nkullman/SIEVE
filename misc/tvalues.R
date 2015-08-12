library(stats)

mismatches = read.csv("../data/rv144.env.mismatch.distance.csv",sep=",",stringsAsFactors=FALSE)
treatment = read.csv("../data/rv144_trt_lookup.csv",sep=",",stringsAsFactors=FALSE)

names(mismatches)[1] = "sampleID"
thedata = merge(mismatches,treatment,by="sampleID")[-1]

tvalues = c()
for(i in 1:(ncol(thedata)-1)){
  result = try(t.test(thedata[,i][(thedata[,ncol(thedata)] == "VACCINE")],
                      thedata[,i][(thedata[,ncol(thedata)] == "PLACEBO")],
                      alternative = "two.sided",B=10000)$statistic, silent = TRUE)
  if (is.na(result) || is.numeric(result)){
    tvalues = c(tvalues,result)
  } else {
    tvalues = c(tvalues, NA)
  }
}

for(i in 1:length(tvalues)){
  if(is.na(tvalues[i])){
    tvalues[i] = 0
  }
}


temp = data.frame(tvalues)
names(temp)[1] = "tvalue"
write.csv(temp,"tvalues.csv",row.names=F)