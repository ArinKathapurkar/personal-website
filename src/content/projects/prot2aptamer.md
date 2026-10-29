---
title: Prot2Aptamer
order: 3
year: '2025'
summary: Given a target protein, propose DNA aptamer candidates likely to bind it — generated from scratch, not looked up.
tags: [Generative, Bio, k-mers]
stack: [scikit-learn, Python, Flask, Railway, UniProt]
role: Data pipeline, model, API
image: /projects/aptamer.svg
imageAlt: Illustrative generated DNA sequences with highlighted 3-mers beside a transition-probability grid
metrics:
  - { label: k-mer order, value: '3' }
  - { label: Property R², value: 'TODO' }
  - { label: Aptamer–protein pairs, value: 'TODO' }
links:
  - { label: Source, href: 'https://github.com/TODO/Prot2Aptamer' }
---

## Problem

Finding a DNA aptamer that binds a new protein normally means rounds of wet-lab selection (SELEX). The goal here is a cheap first pass: narrow the search space computationally before anyone touches a pipette.

## Approach

1. **Dataset.** Known aptamer–target pairs were scraped from Aptagen, and each target was resolved to its sequence and properties through UniProt. The result was then cleaned and merged into a single training table.
2. **Property prediction.** A random forest maps protein features to the properties a binding aptamer tends to have: length, GC content, and nucleotide composition.
3. **Generation.** A k-mer library and a 3rd-order Markov transition matrix, both learned from real aptamers, sample new sequences that are steered toward the predicted properties.
4. **Ranking.** Candidates are scored by how closely they match the predicted length and GC content, and the best are returned.

## Serving

A Flask API is deployed on Railway: POST a protein sequence and get back ranked candidate aptamers.
