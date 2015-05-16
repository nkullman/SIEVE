
/**Computes Entropy of the Empirical Joint Distribution of given sites
*input: indices - list of sites in the sequence
*output: float*/
function jointentropy(indices,data,patientcount) {
    entropy = 0.0;
    var N = patientcount;
    var counts = {};
    for (var i = 0; i < N; i++){
        var obs = [];
        for(var j = 0; j < indices.length; j++){
            obs.push(data[i][indices[j]]);
        }
        if(obs in counts){
            counts[obs] += 1.0/N;
        } else {
            counts[obs] = 1.0/N;
        }
    }
    for(var key in counts){
        entropy += counts[key]*Math.log(counts[key]);
    }
    return(entropy);
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

// Shuffles the entries of an array
function shuffle(array){
    var a = [].concat(array);
    var n = a.length, t, i;
    while(n){
        i = Math.floor(Math.random() * n--);
        t = a[n];
        a[i] = t;
    }
    return a;
}

// Computes mismatch vectors for ttest:
function mmprocess(site){
  var vacc = [];
  var plac = [];
  for(var patient in seqID_lookup){
    if(seqID_lookup[patient].vaccine){
      if(seqID_lookup[patient].mismatch != undefined){
        vacc.push(seqID_lookup[patient].mismatch[site]);
        }
    } else {
      if(seqID_lookup[patient].mismatch != undefined){
        plac.push(seqID_lookup[patient].mismatch[site]);
      }
    }
  }
  return [vacc,plac];
}
// Performs a monte carlo approximation for permutation t-test
function ttest(array1,array2){
    fullarray = array1.concat(array2);
    var teststatistic = tstat(array1,array2);
    var ts = [];
    for(var i = 0; i < 1000; i++){
        var shuffledata = shuffle(fullarray);
        var part1 = shuffledata.slice(0,array1.length);
        var part2 = shuffledata.slice(array1.length);
        ts.push(tstat(part1,part2));
        shuffledata = null;
        delete shuffledata;
    }
    var p = percentile(-Math.abs(tstat(array1,array2)),ts,true);
    p += 1 - percentile(Math.abs(tstat(array1,array2)),ts,false);
    return p;
}



