Agarose gel electrophoresis is the standard way to check DNA and RNA: whether a PCR worked, what size a fragment is, whether a plasmid digest gave the expected pattern, and whether RNA is intact. This guide explains how it works, gives a reliable general protocol and helps you troubleshoot the problems that appear most often.

## How it works

Nucleic acids carry a negative charge on their phosphate backbone. In an electric field they move towards the positive electrode (the anode). An agarose gel acts as a molecular sieve: small fragments move through the pores faster than large ones, so fragments separate by size.

Because migration distance is roughly linear with the logarithm of fragment size over the useful range of a gel, you can estimate the size of an unknown band by comparing it with a **DNA ladder** of known fragment sizes run on the same gel.

## Choosing the agarose percentage

The agarose concentration sets the pore size and therefore the range of fragment sizes that resolve well.

| Agarose (%) | Approximate resolving range |
|---|---|
| 0.7 | 0.8–10 kb |
| 1.0 | 0.5–8 kb |
| 1.5 | 0.2–3 kb |
| 2.0 | 0.1–2 kb |

For most PCR products of a few hundred base pairs, 1.5–2% gives sharp bands. For plasmids and large digests, 0.8–1% works better. These ranges are guides; buffer, voltage and run time also matter.

## A general protocol

**1. Prepare the gel.**

- Weigh agarose for the chosen percentage (for example, 1 g in 100 mL for a 1% gel) into running buffer (TAE or TBE).
- Heat until fully dissolved and clear, swirling carefully. Superheated agarose can boil over suddenly, so use heat-resistant gloves.
- Let it cool to about 55–60 °C, add a nucleic-acid stain according to the manufacturer’s instructions, pour into a casting tray with a comb, and let it set for 20–30 minutes.

**2. Load the samples.**

- Place the gel in the tank with the wells at the negative electrode (black) and cover it with running buffer.
- Mix each sample with loading dye, which adds density and tracking dyes.
- Load the ladder in the first (and ideally last) lane, then the samples, avoiding piercing the bottom of the well.

**3. Run the gel.**

- A common setting is 5–8 V per centimetre of distance between electrodes. Higher voltages run faster but heat the gel and can smear bands.
- Stop when the tracking dye has travelled about two-thirds to three-quarters of the gel.

**4. Image and interpret.**

- Visualise with the illumination appropriate for your stain and record the image with the lane annotations.
- Estimate fragment sizes against the ladder and compare them with the expected sizes.

## Interpreting common patterns

- **One sharp band of the expected size:** the PCR or digest worked as designed.
- **No band in the sample but a band in the positive control:** the sample reaction failed; check template quality and quantity.
- **A faint band at about 50 bp or below:** usually primer dimers.
- **Several bands:** non-specific amplification, partial digestion or a mixture of products.
- **Uncut plasmid shows several bands:** supercoiled, linear and nicked forms of the same plasmid migrate differently, with supercoiled DNA usually running fastest.
- **RNA:** intact total RNA from eukaryotic cells shows sharp 28S and 18S ribosomal bands, with the 28S band roughly twice as intense as the 18S; a smear towards small sizes suggests degradation.

## Troubleshooting

| Problem | Likely causes | What to try |
|---|---|---|
| Smeared bands | Overloading, degraded sample, high voltage | Load less, check integrity, lower the voltage |
| Faint or no bands | Too little DNA, stain missing or old, failed reaction | Load more, add fresh stain, run controls |
| Bands are fuzzy | Gel too warm, wrong percentage, old buffer | Lower voltage, choose a better percentage, fresh buffer |
| Ladder looks wrong | Ladder degraded or mis-loaded | Use fresh ladder at the recommended amount |
| Samples float out of wells | Not enough loading dye | Mix samples thoroughly with loading dye |
| Wavy or slanted bands | Uneven gel, wells damaged, uneven field | Pour on a level surface, load gently |

## Safety and good practice

- Wear gloves, a lab coat and eye protection, and follow your laboratory’s rules for the stain you use and for UV or blue-light transilluminators.
- Dispose of gels and buffers according to local waste rules.
- Record the gel percentage, buffer, voltage, run time, stain and ladder in your notebook with the image. Reviewers and colleagues need these to interpret the result.

## Practise it properly

Gel electrophoresis looks simple, but reading gels confidently comes from running many of them, including failed ones. Our [Molecular Biology Techniques](/vedicgen/courses/molecular-biology-techniques) course has every participant isolate DNA, run PCR and analyse their own gels, and the one-day [Hands-on PCR & Gel Electrophoresis](/vedicgen/workshops#hands-on-pcr-gel) workshop is a fast introduction. To predict the band pattern of a digest before you run it, try the free virtual gel in [Nayancode Sequence Studio](/nayancode/products/sequence-studio).
