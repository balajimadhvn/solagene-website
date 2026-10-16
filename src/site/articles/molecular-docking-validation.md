Molecular docking predicts how a small molecule might bind to a protein and estimates how strongly. It is fast, free and visually convincing, which is why it appears in so many papers and theses. It is also easy to do badly. A docking score on its own is not evidence that a compound binds. This guide explains how a docking study should be set up and, above all, how to validate it so the results mean something.

## What docking does

A docking program does two things:

1. **Search.** It explores positions, orientations and conformations (poses) of the ligand inside a defined region of the protein.
2. **Score.** It ranks those poses with a scoring function that approximates binding free energy. AutoDock Vina, for example, reports scores in kcal/mol, where more negative means a predicted stronger interaction.

Scoring functions are fast approximations. They largely ignore or simplify solvation, entropy, protein flexibility and protonation changes. That is why docking is good at producing plausible poses and at enriching actives in a large library, but poor at predicting exact affinities or ranking similar compounds precisely.

## Step 1: choose and inspect the structure

The structure you dock into matters more than any parameter.

- Prefer an experimental structure with a bound ligand in the site of interest, at good resolution (around 2.5 Å or better).
- Check for missing residues or loops near the binding site, and alternate conformations.
- If you use a predicted model (for example from AlphaFold DB), check the per-residue confidence (pLDDT) around the pocket. Low-confidence regions are a serious risk, and predicted structures are generally modelled without ligands, so side chains may not be in a binding-competent arrangement.

## Step 2: prepare the protein and ligands

- Remove crystallisation additives and, usually, water molecules (keep a water only if it is known to mediate binding).
- Add hydrogens and assign protonation states appropriate to physiological pH. Histidine is the classic problem.
- Prepare ligands in 3D with correct protonation and tautomers. A ligand drawn in the wrong charge state can dock completely differently.
- Convert files to the format your docking program expects (PDBQT for Vina), for example with Open Babel or Meeko.

Record every choice: they belong in your methods section.

## Step 3: define the search space

Docking searches a box. If a co-crystallised ligand is present, centre the box on it with a margin of several ångströms on every side. A box that is too small cuts off valid poses; one that is far too large makes the search less reliable. "Blind docking" over the whole protein is sometimes used to look for sites, but it is much less reliable than docking into a known pocket.

## Step 4: validate the protocol

This is the step most often skipped, and the one reviewers increasingly ask for.

### Redocking

Take the ligand from the crystal structure, prepare it as you would any other ligand, dock it back into its own protein and compare the top pose with the experimental pose. The usual measure is the heavy-atom **RMSD**:

| RMSD | Interpretation |
|---|---|
| ≤ 2.0 Å | Pose reproduced: the protocol can find the correct binding mode |
| > 2.0 Å | Pose not reproduced: revisit preparation, box or protonation |

Redocking is a minimum check. It is optimistic, because the protein is already shaped around that ligand. **Cross-docking**, docking a ligand into a structure solved with a different ligand, is a tougher and more realistic test.

### Actives versus decoys

If you are screening a library, check whether your protocol can tell known actives from inactive molecules. Collect known actives for the target (for example from ChEMBL) and property-matched decoys (the DUD-E database provides decoys for many targets), dock them all, and measure how well the scores separate them with a ROC curve or enrichment factor. If known actives do not rank above decoys, the screening results are not informative.

## Step 5: analyse poses, not only scores

- Look at the top poses. Do they make the interactions known to matter for this target, such as hydrogen bonds to catalytic residues?
- Profile protein–ligand interactions with a tool such as PLIP, and present them clearly.
- Cluster poses: a consistent binding mode across the top poses is more convincing than a single best score.
- Apply drug-likeness and ADMET filters before prioritising compounds for testing.

## What not to claim

- Do not present docking scores as binding affinities or compare them as if they were measured values. Differences of 1 kcal/mol between Vina scores are within the method's error.
- Do not conclude that a compound "inhibits" a target from docking alone. Docking generates hypotheses for experimental testing.
- Do not report results without the validation: a protocol that cannot redock its own ligand cannot be trusted with new ones.

## A short checklist

1. Structure choice justified, quality checked.
2. Preparation steps and software versions recorded.
3. Box defined from a known ligand or pocket, with coordinates reported.
4. Redocking RMSD reported; cross-docking if possible.
5. Actives-versus-decoys enrichment for any virtual screen.
6. Interaction analysis for every highlighted compound.
7. Claims limited to prioritisation, with experimental validation as the next step.

## Learn and practise

The full structure-based workflow, from target selection to a validated virtual screen, is taught in our Molecular Docking & Structure-Based Drug Discovery course. To try redocking yourself, [Nayancode Docking Studio](/nayancode/products/docking-studio) runs AutoDock Vina in your browser and reports the RMSD of each pose to the crystal ligand; on 42 complexes, 35.7 % of its top poses fall within 2 Å. [Structure Studio](/nayancode/products/structure-studio) loads a PDB entry and profiles protein–ligand interactions.
