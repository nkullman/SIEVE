Nick presented the visualization to Andrew's colleagues on Fri, Aug 21st. The demo was well receievd and people offered good constructive feedback.

#Short term TODO:
 - [x] Fix buttons for Entopy and Mismatch; confusing because they look like column headings
 - [x] Fix color for a matched AA; currently its the same as the residue R (gray) and should be different
 - [x] Add back the option to display AA frequencies colored by physico chemical properties
 - [x] Display amino acid resiude in sequence map when the bars are zoomed wide enough so that it fits
 - [ ] Fix data loading to match the new file specifciation (see `file_spec.md`)
 - [ ] Using new file specification, allow switching between different genetic distances.
 - [x] Replace "Mismatch" with "Distance" in the table.
 - [ ] Add ability to display q-value or any other arbitrary column from the results file
 - [x] Substitue letters V and P for Vaccine and Placebo to make more space for AA frequency bars on the right side
 - [x] Overlay dots on the box plot
 - [ ] Remove bar plot for non discrete distances
 - [ ] Generalize to k-mers (where a site is equivalent to a 1mer). This means changing the xlabel to HXB2 start position, when k>1. Also the sites that get displayed at the right would include a unique list of all sites included in the k-mer with the associated start positions (e.g. selecting one start position in a 9mer-based analysis would highlight 9 sites n the right, but only show a distance for 1)
 - [ ] Server space at FHCRC (address will most likely be http://sieve.fhcrc.org/viz)
 - [x] Add visit counter
 - [x] Selection through URL (?sites=347...) using HXB2 site references. Allows sharing of a viz (w/ a selection) via a link.
 - [x] Change all references of "patients" to "participants"
 
#Long term TODO:
 - [ ] Live demo thats quickly show basic functionality
 - [ ] Dynamic multiplicity adjustment: compute q-values for selected sites using a standard method (could be simply Bonferroni at first, but FDR would be nice)
 - [ ] Highlight significant sites and add ability to select based on significance threshold
 - [ ] Add link to LANL tool for highlighting sites on an HIV Envelope 3D structure (when applicable)
 - [ ] Logo plots by treatment group instead of the sequence map (but would be very busy, so should not be default option). See this [code snippet](http://jsfiddle.net/QcPZ9/) for help.
