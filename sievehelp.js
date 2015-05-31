// create div
var sievehelpdiv = d3.select(".title").append("div")
	.attr("id", "sievehelpdiv")
	.classed("hidden", true);

// add div content
sievehelpdiv.append("h1").text("How to use this tool");
sievehelpdiv.append("p").text("Select sites in the shaded area.");

// hit window is the 'help' text
// set its behavior for mouseover and mouseout
d3.select(".sievehelplink")
	.on("mouseover", function() {sievehelpdiv.classed("hidden", false);})
	.on("mouseout", function() {sievehelpdiv.classed("hidden", true);});