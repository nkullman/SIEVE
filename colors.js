//For a given palette and amino acid code, returns a color encoding
function aa_to_color(palette, aa)
{
	switch (palette)
	{
		case "chemistry":
			switch (aa)
			{
				case "G":
				case "S":
				case "T":
				case "Y":
				case "C": //polar
					return "green";
				case "N":
				case "Q":
				case "-": //neutral
					return "purple";
				case "K":
				case "R":
				case "H": //basic
					return "blue";
				case "D":
				case "E": //acidic
					return "red";
				case "P":
				case "A":
				case "W":
				case "F":
				case "L":
				case "I":
				case "M":
				case "V": //hydrophobic
					return "black";
			}
		case "hydrophobicity":
			switch (aa)
			{
				case "R":
				case "K":
				case "D":
				case "E":
				case "N":
				case "N":
				case "Q":
					return "blue";
				case "S":
				case "G":
				case "H":
				case "T":
				case "A":
				case "P":
				case "-":
					return "green";
				case "Y":
				case "V":
				case "M":
				case "C":
				case "L":
				case "F":
				case "I":
				case "W":
					return "black";			 
			}
			break;
		case "d3":
			if (aa == "-")
			{
				return "#000000";
			} else {
				return d3.scale.category20().domain(['A','C','D','E','F','G','H','I','K','L','M',
		'N','P','Q','R','S','T','V','W','Y'])(aa);
			}
		case "taylor":
		default:
			return {"A":'#CCFF00', "C":'#FFFF00', "D":'#FF0000', "E":'#FF0066', "F":'#00FF66', "G":'#FF9900', "H":'#0066FF',
		"I":'#66FF00', "K":'#6600FF', "L":'#33FF00', "M":'#00FF00', "N":'#CC00FF', "P":'#FFCC00', "Q":'#FF00CC',
		"R":'#0000FF', "S":'#FF3300', "T":'#FF6600', "V":'#99FF00', "W":'#00CCFF', "Y":'#00FFCC', "-":'#000000'}[aa];
	}
}