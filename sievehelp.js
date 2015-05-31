// create div
var sievehelpdiv = d3.select(".title").append("div")
	.attr("id", "sievehelpdiv")
	.classed("hidden", true);

// add div content
sievehelpdiv.append("h3").text("How to use this tool");
sievehelpdiv.append("p").html(
	"<ul>"+
		"<li>Select sites from the vaccine sequence in the shaded region.</li>" +
		"<li>Scroll or double click to zoom through the sequence.</li>" +
		"<li>Click and drag to pan</li>" +
		"<li>To select sites, hold down shift and click and drag</li>" +    
		"<li>The detailed charts will update as you change your selection.</li>" +
	"</ul>"
);


// hit window is the 'help' text
// set its behavior for mouseover and mouseout
d3.select(".sievehelplink")
	.on("mouseover", function() {sievehelpdiv.classed("hidden", false);})
	.on("mouseout", function() {sievehelpdiv.classed("hidden", true);});