library(stats)

mismatches = read.csv("../data/old/rv144.env.mismatch.distance.csv",sep=",",stringsAsFactors=FALSE)
treatment = read.csv("../data/old/rv144_trt_lookup.csv",sep=",",stringsAsFactors=FALSE)

names(mismatches)[1] = "sampleID"
thedata = merge(mismatches,treatment,by="sampleID")[-1]

tvalues = c()
for(i in 1:(ncol(thedata)-1)){
  result = try(t.test(thedata[,i][(thedata[,ncol(thedata)] == "VACCINE")],
                      thedata[,i][(thedata[,ncol(thedata)] == "PLACEBO")],
                      alternative = "two.sided",B=10000, var.equal = TRUE)$statistic,
               silent = TRUE)
  if (is.numeric(result) && !is.na(result)){
    tvalues = c(tvalues,result)
  } else {
      mresult = thedata[,i][(thedata[,ncol(thedata)] == "VACCINE")][1] - thedata[,i][(thedata[,ncol(thedata)] == "PLACEBO")][1]
      tvalues = c(tvalues,mresult)
  }
}

temp = data.frame(tvalues)
names(temp)[1] = "tvalue"
write.csv(temp,"../data/old/tvalues.csv",row.names=F)