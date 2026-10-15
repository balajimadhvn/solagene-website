A QSAR (quantitative structure–activity relationship) model learns how a molecule's structure relates to its activity or property, so that new molecules can be predicted before they are made or bought. Building a model that scores well is easy. Building one whose score means something is harder, because molecular datasets have properties that make standard machine-learning validation over-optimistic. This guide covers the validation practices that separate a trustworthy QSAR model from a misleading one.

## The OECD principles

The OECD principles for the validation of QSAR models, widely used in regulatory and academic work, ask that a model has:

1. A defined endpoint.
2. An unambiguous algorithm.
3. A defined domain of applicability.
4. Appropriate measures of goodness-of-fit, robustness and predictivity.
5. A mechanistic interpretation, if possible.

Points 3 and 4 are where most published models fall short.

## Start with clean data

Model quality is limited by data quality. Before modelling:

- **Standardise structures.** Remove salts, neutralise charges where appropriate and pick a consistent tautomer, so the same compound is not represented two ways.
- **Merge duplicates.** The same compound often appears several times with different measurements. Average replicate values or drop compounds whose measurements disagree strongly.
- **Do not mix endpoints.** IC50, Ki and percentage inhibition are different measurements; IC50 values from different assays are not always comparable either. Use one activity type, ideally from consistent assay conditions.
- **Use a log scale.** Model pIC50 (−log10 of IC50 in mol/L) rather than raw IC50.

## Why random splits are too optimistic

Chemical datasets are made of series: groups of close analogues made around the same scaffold. With a random train/test split, most test compounds have a near-identical sibling in the training set, and the model only has to interpolate. Performance looks excellent and then collapses on genuinely new chemistry.

Better alternatives:

| Split | How it works | What it measures |
|---|---|---|
| Random | Compounds assigned at random | Interpolation within known series (optimistic) |
| Scaffold | Compounds grouped by Bemis–Murcko scaffold | Prediction for new scaffolds |
| Cluster | Compounds clustered by fingerprint similarity (for example Butina) and whole clusters held out | Prediction for dissimilar chemistry |
| Temporal | Train on older compounds, test on newer | How the model would have performed in practice |

Report which split you used. If you can, report more than one: the gap between random and cluster performance tells the reader how much the model depends on close analogues.

## Compare against a baseline

A model is only useful if it beats something simple. Useful baselines are predicting the mean activity for every compound, and a nearest-neighbour model that predicts each compound's activity as that of its most similar training compound. If a complex model barely beats nearest-neighbour similarity, it has learned little beyond similarity.

## Y-randomisation

Y-randomisation (also called Y-scrambling) checks for chance correlation. Shuffle the activity values, so that structure and activity are no longer related, retrain the model with exactly the same procedure, and repeat several times. A sound model's performance should collapse to around zero on scrambled data. If scrambled models still score well, the modelling procedure is finding patterns that are not there, often through leakage or an overly flexible model on a small dataset.

## Metrics

For regression models, report R² or Q² on held-out data together with an error measure in activity units, such as RMSE or MAE in pIC50 units. An RMSE of 0.7 log units means typical errors of about five-fold in IC50, which is useful to know when deciding what the model can be used for.

For classification models, be careful with accuracy on imbalanced data: if 90% of compounds are inactive, predicting "inactive" every time scores 90%. Report ROC AUC, balanced accuracy or the Matthews correlation coefficient, and the class balance.

## Applicability domain

A model can only be trusted for molecules similar to those it learned from. The applicability domain defines that region. A simple and widely used approach is similarity to the training set: compute each new molecule's maximum Tanimoto similarity to any training compound (using Morgan fingerprints, for example) and flag predictions below a threshold as outside the domain. Report predictions together with this flag, and show that error is indeed lower inside the domain than outside it.

## Write a model card

Summarise the model in a short document: the endpoint and data source, curation steps, descriptors or fingerprints, algorithm and hyperparameters, validation scheme and results, applicability-domain definition, and known limitations. It makes the model reusable and makes its limits explicit for the next person.

## Checklist

1. Data curated: standardised, deduplicated, one endpoint, log scale.
2. Scaffold or cluster validation reported alongside random.
3. Baseline comparison.
4. Y-randomisation performed.
5. Appropriate metrics with errors in activity units.
6. Applicability domain defined and used.
7. Model card written.

## Learn and practise

Our Cheminformatics & QSAR Modelling course builds a model from a ChEMBL dataset through every step above. The QSAR Lab in our Chemistry Studio runs random forest, kNN and ridge models with cluster cross-validation, Y-randomisation and an applicability domain directly in your browser.
