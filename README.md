S.I.E.V.E: Statistical Interactive Explorer of Vaccine Efficacy
===============
Nick Kullman, Graham Clenaghan, Wayne Yang

![Overview](images/overview.png)

SIEVE is an intereactive visualization for exploring data from vaccine studies. Specifically, we aim to aid the process of sieve analysis, which compares the genetic sequences of viruses found in infected patients between vaccine and placebo groups. The visualization allows researchers in the field to study the affect of a vaccine at the level of the amino acids in the breakthrough viruses, and find statistically significant differences in the groups. This work was done in collaboration with Andrew Gartland and Allan DeCamp at Fred Hutch.

[Poster](https://github.com/CSE512-15S/fp-nkullman-gclenagh-wfyang/blob/master/poster/Poster.pdf),
[Paper](https://github.com/CSE512-15S/fp-nkullman-gclenagh-wfyang/blob/master/final/Paper.pdf),
[Webpage](http://cse512-15s.github.io/fp-nkullman-gclenagh-wfyang/description.html)

## Running Instructions

Access our visualization at http://cse512-15s.github.io/fp-nkullman-gclenagh-wfyang/ or download this repository and run `python -m SimpleHTTPServer 9000` and access this from http://localhost:9000/.

## Credits

* Nick Kullman: Overview chart navigation and design, loading files
* Graham Clenaghan: Site stacked bar charts, selection, options, box plots
* Wayne Yang: Statistics/R calculations, pyramid chart, entropy and mismatch table 
