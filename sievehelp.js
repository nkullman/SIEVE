// create div
var sievehelpdiv = d3.select(".title").append("div")
	.attr("id", "sievehelpdiv")
	.classed("hidden", true);

// add div content
sievehelpdiv.append("h1").text("This is a big title!");

// hit window is the 'help' text
// set its behavior for mouseover and mouseout
d3.select(".sievehelplink")
	.on("mouseover", function() {sievehelpdiv.classed("hidden", false);})
	.on("mouseout", function() {sievehelpdiv.classed("hidden", true);});