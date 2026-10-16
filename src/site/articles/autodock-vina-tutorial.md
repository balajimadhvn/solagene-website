AutoDock Vina is one of the most widely used free programs for molecular docking: predicting how a small molecule binds to a protein. This tutorial walks through a complete Vina run, from choosing a structure to reading the output, and shows how to check that your protocol works before you trust its predictions.

## What you need

- **AutoDock Vina** (version 1.2 or later), free and open source.
- **Open Babel** or **Meeko** to prepare ligands, and a viewer such as **PyMOL** or **UCSF ChimeraX**.
- A protein structure from the **RCSB PDB**, ideally one with a bound ligand in the site you care about.

In this example we use HIV-1 protease bound to the inhibitor indinavir, PDB entry **1HSG**, a classic teaching system because its binding mode is well known.

## Step 1: choose and inspect the structure

Before docking, look at the structure:

- **Resolution:** better than about 2.5 Å is preferable for docking.
- **Completeness:** check for missing residues or side chains near the binding site.
- **Ligands and waters:** note the co-crystallised ligand, which defines the binding site and lets you validate the protocol.
- **Biological assembly:** HIV-1 protease is a homodimer and the binding site lies between the two chains, so keep both.

## Step 2: prepare the receptor

1. Remove the co-crystallised ligand (save it separately; you will need it for validation) and, in most cases, water molecules.
2. Add hydrogens appropriate to physiological pH and check the protonation of key residues. In HIV-1 protease, the catalytic aspartates (Asp25 and Asp25′) deserve particular attention.
3. Convert the receptor to PDBQT format, which adds atom types and partial charges, using a preparation tool such as Meeko or AutoDockTools.

## Step 3: prepare the ligand

1. Start from a reliable structure, such as an SDF from PubChem or the extracted crystal ligand.
2. Add hydrogens, generate a sensible 3D conformation and assign rotatable bonds.
3. Convert to PDBQT.

```bash
obabel ligand.sdf -O ligand.pdbqt -h --gen3d
```

Tools such as Meeko handle protonation and torsions more carefully than a one-line conversion, which matters for drug-like molecules.

## Step 4: define the search box

Vina searches within a box. Centre it on the binding site, using the coordinates of the co-crystallised ligand, and make it large enough to contain the ligand with room to rotate, typically 20–25 Å per side for a drug-sized molecule.

```text
receptor = receptor.pdbqt
ligand = ligand.pdbqt
center_x = 13.0
center_y = 22.5
center_z = 5.5
size_x = 22
size_y = 22
size_z = 22
exhaustiveness = 16
num_modes = 9
```

The centre values above are illustrative; compute them from the ligand coordinates in your own file.

## Step 5: run Vina

```bash
vina --config config.txt --out docked.pdbqt
```

Vina reports a table of binding modes ranked by its scoring function, in kcal/mol, together with RMSD values between modes.

## Step 6: validate by redocking

The single most important check is **redocking**: dock the crystal ligand back into its own receptor and measure the root-mean-square deviation (RMSD) between the top-scoring pose and the crystal pose. An RMSD below about **2 Å** is the usual criterion that the protocol can reproduce a known binding mode.

If redocking fails, revisit the receptor preparation, protonation states, box size and exhaustiveness before docking anything new.

## Step 7: inspect the interactions

Open the receptor and the top poses in PyMOL or ChimeraX and examine:

- hydrogen bonds to key residues (for HIV-1 protease, the catalytic aspartates and the flap region),
- hydrophobic contacts and buried surface,
- clashes or unsatisfied polar groups.

A pose with a good score but implausible chemistry should not be trusted.

## What docking scores can and cannot tell you

- Vina scores are **approximate** and are best used to rank poses of one ligand and to prioritise compounds, not as accurate binding affinities.
- Comparing scores between very different molecules is unreliable; validate with **actives versus decoys** enrichment if you plan a virtual screen.
- Docking usually treats the receptor as rigid. Flexible regions, induced fit and water-mediated interactions are simplified.
- Promising poses can be tested further with molecular dynamics, and ultimately predictions need experimental confirmation.

For a deeper discussion of validation, see our guide to [validating a docking study](/learn/molecular-docking-validation).

## Go further

To learn docking properly, including target preparation, virtual screening and validation, see [Molecular Docking & Structure-Based Drug Discovery](/vedicgen/courses/molecular-docking-drug-discovery), or try the short online [Molecular Docking with AutoDock Vina workshop](/vedicgen/workshops#docking-autodock-vina). You can run every step of this tutorial in your browser, for free, with [Nayancode Docking Studio](/nayancode/products/docking-studio): it runs AutoDock Vina 1.2.7 compiled to WebAssembly, prepares the receptor and ligand, and profiles the interactions of each pose. To inspect a structure on its own, use [Structure Studio](/nayancode/products/structure-studio).
