Predicted protein structures from AlphaFold are now available for almost every known protein, and it is easy to download one and start working with it. The model’s confidence scores tell you which parts to trust. This guide explains the two scores that matter most, **pLDDT** and **PAE**, and how to use them before you plan mutations, interpret variants or dock ligands.

## pLDDT: confidence in local structure

**pLDDT** (predicted local distance difference test) is a per-residue score from 0 to 100 that estimates how well the local structure around each residue is predicted. In AlphaFold DB files it is stored in the B-factor column, and viewers colour models by it.

A common interpretation, used by the AlphaFold Protein Structure Database, is:

| pLDDT | Interpretation |
|---|---|
| > 90 | Very high confidence: backbone and most side chains are usually reliable |
| 70–90 | Confident: the backbone is generally reliable |
| 50–70 | Low confidence: treat with caution |
| < 50 | Very low confidence: often disordered or unstructured in isolation |

Long stretches with pLDDT below 50 frequently correspond to **intrinsically disordered regions**. They are not errors to be fixed; they indicate that the region may not adopt a single stable structure on its own.

## PAE: confidence in relative positions

**PAE** (predicted aligned error) is a two-dimensional matrix. Each entry estimates the expected position error, in ångströms, at residue *x* when the predicted and true structures are aligned on residue *y*. Low values mean the relative position of two parts is confidently predicted.

PAE answers a question pLDDT cannot: **are the domains arranged correctly relative to each other?**

- A block of low PAE along the diagonal indicates a confidently predicted domain.
- Low PAE between two domains means their relative orientation is reliable.
- High PAE between two domains means each domain may be correct on its own, but their arrangement is uncertain.

A model can have high pLDDT in two domains and still place them in an arbitrary orientation; only the PAE shows this.

## A practical checklist before you use a model

1. **Colour by pLDDT.** Identify the confidently predicted core and the low-confidence regions.
2. **Open the PAE plot.** Identify domains and check whether inter-domain arrangement is confident.
3. **Compare with experiment.** If experimental structures exist in the PDB, superpose them and check agreement.
4. **Match the model to the task:**
   - *Interpreting a missense variant:* is the residue in a confident, structured region?
   - *Designing a mutation:* are the surrounding side chains confidently placed?
   - *Docking:* is the pocket formed by high-confidence residues, and are flexible loops near the site reliable? Apo models may not show induced-fit conformations.
5. **Record the version.** Note the AlphaFold DB version or the ColabFold settings you used.

## Complexes and ipTM

For protein complexes predicted with AlphaFold-Multimer or AlphaFold 3, the **ipTM** score summarises confidence in the interface. Low inter-chain PAE at the interface supports a confident interaction model; high values suggest the arrangement is uncertain. Interfaces should be treated as hypotheses to be tested.

## Common mistakes

- Treating low-pLDDT regions as structured and drawing conclusions from them.
- Ignoring PAE and trusting inter-domain distances.
- Docking into pockets lined by low-confidence loops without considering flexibility.
- Assuming a prediction captures ligand-bound, post-translationally modified or condition-specific states.

## Learn it hands-on

Our [Protein Structure Prediction & Modelling](/vedicgen/courses/protein-structure-prediction-modelling) course teaches homology modelling, AlphaFold and ColabFold, and the validation that tells you when a model is fit for purpose. The short [AlphaFold & Protein Structure Essentials workshop](/vedicgen/workshops#alphafold-structure-essentials) is a quick introduction. You can load any PDB entry or AlphaFold model by UniProt accession, and superpose structures, in [Nayancode Structure Studio](/nayancode/products/structure-studio).

*Reference: Jumper J et al. (2021). Highly accurate protein structure prediction with AlphaFold. Nature 596:583–589.*
