
/**Computes Entropy of the Empirical Joint Distribution of given sites
*input: indices - list of sites in the sequence
*output: float*/
function jointentropy(indices,data,participantcount) {
    if (indices.length > 0){
      var entropy = 0.0;
      var counts = {};
      //Transpose and filter data, then count each sequence occurance
      data[0].map(function(d, i) {
          return indices.map(function(j) {
              return data[j][i];
          });
      }).forEach(function(obs) {
          if(obs in counts){
              counts[obs]++;
          } else {
              counts[obs] = 1;
          }
      });
      for(var key in counts){
          entropy -= counts[key]*Math.log(counts[key]/participantcount);
      }
      return(d3.max([entropy/participantcount,0]));
    } else {
      return 0;
    }
}

// Approximates the p-value of a t-test for a given site

function sitettest(site){
  var temp = mmprocess(site);
  return ttest(temp[0],temp[1]);
}


/**Computes the mean of a list of numbers
*
* */
function mean(array){
    var total = 0;
    for(var i = 0; i < array.length; i++){
        total += array[i];
    }
    total *= 1/array.length;
    return(total);
}

/**Computes the sum of squared errors
*
* */
function variance(array){
    var ss = 0;
    var average = mean(array);
    for(var i = 0; i < array.length; i++){
        ss += (array[i] - average)*(array[i] - average);
    }
    return(ss/(array.length-1))
}

// Computes the percentile of a given number in a given array.
function percentile(num,array,strict){
    var count = 0;
    if(strict){
        for(var i = 0; i < array.length; i++){
            count +=(array[i] < num);
        }
        return(count/array.length);
    } else {
        for(var i = 0; i < array.length; i++){
            count += (array[i] <= num);
        }
        return(count/array.length);
    }
}

/**Computes Two Sample t-Statistic 
* 
* */
function tstat(array1,array2){
    var mean1 = mean(array1);
    var mean2 = mean(array2);
    var ss1 = variance(array1);
    var ss2 = variance(array2);
    var tstat = (mean1 - mean2)/Math.sqrt(ss1/array1.length + ss2/array2.length);
    return tstat;
}

// Computes mismatch vectors for ttest:
function mmprocess(site){
  var vacc = sequences.vaccine[site].map(function(d) {return d == vaccine.sequence[site] ? 0 : 1; });
  var plac = sequences.placebo[site].map(function(d) {return d == vaccine.sequence[site] ? 0 : 1; });
  return [vacc,plac];
}
// Performs a monte carlo approximation for permutation t-test
function ttest(array1,array2){
    var fullarray = array1.concat(array2);
    var ts = [], shuffledata, part1, part2;
    for(var i = 0; i < 500; i++){
        shuffledata = d3.shuffle(fullarray);
        part1 = shuffledata.slice(0,array1.length);
        part2 = shuffledata.slice(array1.length);
        ts.push(tstat(part1,part2));
    }
    var p = percentile(-Math.abs(tstat(array1,array2)),ts,true);
    p += 1 - percentile(Math.abs(tstat(array1,array2)),ts,false);
    return p;
}



