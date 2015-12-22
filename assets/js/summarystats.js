
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

