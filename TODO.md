Nick presented the visualization to Andrew's colleagues on Fri, Aug 21st. The demo was well receievd and people offered good constructive feedback.

#Short term TODO:
 - [x] Fix buttons for Entopy and Mismatch; confusing because they look like column headings
 - [x] Fix color for a matched AA; currently its the same as the residue R (gray) and should be different
 - [x] Add back the option to display AA frequencies colored by physico chemical properties
 - [x] Display amino acid resiude in sequence map when the bars are zoomed wide enough so that it fits
 - [x] Fix data loading to match the new file specifciation (see `file_spec.md`)
 - [x] Replace "Mismatch" with "Distance" in the table.
 - [x] Add ability to display q-value
 - [x] Substitue letters V and P for Vaccine and Placebo to make more space for AA frequency bars on the right side
 - [x] Overlay dots on the box plot
 - [x] Add visit counter
 - [x] Selection through URL (?sites=347...) using HXB2 site references. Allows sharing of a viz (w/ a selection) via a link.
 - [x] Change all references of "patients" to "participants"
 - [x] Live demo thats quickly show basic functionality
 - [ ] Remove bar plot for non-discrete distances
 - [ ] Implementation and server space at FHCRC (address is http://sieve.fhcrc.org/viz)
 - [ ] Download link for a zip file of all the data in the visualization
 - [ ] Link and citation of the primary sieve analysis as well as the primary study manuscripts
 - [ ] Check and recheck (and recheck...) that only pubIDs and publicly available data is shared
 - [ ] Add jitter to the boxplot
 - [ ] Fix BUG with table sorting
 
#Long term TODO:
 - [ ] Use database instead of files to hold all sieve analysis results. This will also help with generalizing to kmers and other distances. (will also help with staging data prior to publication)
 - [ ] Allow switching between different genetic distances
 - [ ] Generalize to k-mers (where a site is equivalent to a 1mer). This means changing the xlabel to HXB2 start position, when k>1. Also the sites that get displayed at the right would include a unique list of all sites included in the k-mer with the associated start positions (e.g. selecting one start position in a 9mer-based analysis would highlight 9 sites n the right, but only show a distance for 1)
 - [ ] Dynamic multiplicity adjustment: compute q-values for selected sites using a standard method (could be simply Bonferroni at first, but FDR would be nice)
 - [ ] Highlight significant sites and add ability to select based on significance threshold
 - [ ] Computational backend with [pysieve](https://github.com/agartland/pysieve) that allows user to upload data
 
#No longer TODO:
- [x] Add link to LANL tool for highlighting sites on an HIV Envelope 3D structure (when applicable)
- [x] Logo plots by treatment group instead of the sequence map (but would be very busy, so should not be default option). See this [code snippet](http://jsfiddle.net/QcPZ9/) for help.
