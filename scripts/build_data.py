#!/usr/bin/env python3
"""Builds the bundled, permissively licensed reference data in public/data/ (run once; outputs are committed).
Sources (all free for commercial use with attribution):
  Reactome pathways      CC BY 4.0   https://reactome.org/license
  WikiPathways           CC0 1.0     https://www.wikipathways.org/index.php/WikiPathways:License_Terms
  Gene Ontology + GOA    CC BY 4.0   https://geneontology.org/docs/go-citation-policy/
  JASPAR 2024 CORE       CC BY 4.0   https://jaspar.elixir.no/
Deliberately NOT used: KEGG (licence required), MSigDB non-CC collections, COSMIC.
"""
import gzip, io, json, re, sys, urllib.request, zipfile, datetime, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data'); os.makedirs(OUT, exist_ok=True)
def get(url): 
    print('GET', url, file=sys.stderr); return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'workbench-data-build'}), timeout=180).read()
today = datetime.date.today().isoformat()

def pack(name, sets, meta):
    genes = sorted({g for _, _, gs in sets for g in gs}); idx = {g: i for i, g in enumerate(genes)}
    obj = {'meta': {**meta, 'built': today, 'nSets': len(sets), 'nGenes': len(genes)}, 'genes': genes, 'sets': [{'id': i, 'name': n, 'g': sorted(idx[g] for g in gs)} for i, n, gs in sets]}
    p = os.path.join(OUT, name); json.dump(obj, open(p, 'w'), separators=(',', ':')); print(name, len(sets), 'sets', len(genes), 'genes', os.path.getsize(p) // 1024, 'KB', file=sys.stderr)

# ---- Reactome (human) ----
z = zipfile.ZipFile(io.BytesIO(get('https://reactome.org/download/current/ReactomePathways.gmt.zip')))
rs = []
for line in z.read(z.namelist()[0]).decode().splitlines():
    f = line.split('\t')
    if len(f) < 4 or not f[1].startswith('R-HSA'): continue
    gs = [g for g in f[2:] if g and re.match(r'^[A-Za-z0-9][A-Za-z0-9._@-]*$', g)]
    if 5 <= len(gs) <= 1000: rs.append((f[1], f[0], set(gs)))
pack('reactome_human.json', rs, {'name': 'Reactome pathways', 'species': 'Homo sapiens', 'license': 'CC BY 4.0', 'source': 'https://reactome.org/download/current/ReactomePathways.gmt.zip', 'attribution': 'Reactome (Milacic et al. 2024, Nucleic Acids Res)'})

# ---- NCBI Gene (public domain): Entrez -> symbol, Ensembl -> symbol ----
gi = gzip.decompress(get('https://ftp.ncbi.nlm.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz')).decode()
entrez2sym, ens2sym = {}, {}
for line in gi.splitlines():
    if line.startswith('#'): continue
    f = line.split('\t')
    if len(f) < 6 or f[0] != '9606': continue
    entrez2sym[f[1]] = f[2]
    m = re.search(r'Ensembl:(ENSG\d+)', f[5])
    if m: ens2sym[m.group(1)] = f[2]
json.dump({'meta': {'name': 'Human gene identifier map', 'license': 'Public domain (NCBI Gene)', 'source': 'ftp.ncbi.nlm.nih.gov/gene/DATA/GENE_INFO', 'built': today}, 'ensembl': ens2sym}, open(os.path.join(OUT, 'human_idmap.json'), 'w'), separators=(',', ':'))
print('idmap', len(ens2sym), 'ensembl ids', file=sys.stderr)

# ---- WikiPathways (human; Entrez IDs mapped to symbols) ----
idx = get('https://data.wikipathways.org/current/gmt/').decode()
fn = sorted(set(re.findall(r'wikipathways-\d+-gmt-Homo_sapiens\.gmt', idx)))[-1]
ws = []
for line in get('https://data.wikipathways.org/current/gmt/' + fn).decode().splitlines():
    f = line.split('\t')
    if len(f) < 4: continue
    m = re.search(r'(WP\d+)', f[0] + ' ' + f[1]); wid = m.group(1) if m else f[1]
    name = f[0].split('%')[0].replace('\u00b7', ' ')
    gs = {entrez2sym[g] for g in f[2:] if g in entrez2sym}
    if 5 <= len(gs) <= 1000: ws.append((wid, name, gs))
pack('wikipathways_human.json', ws, {'name': 'WikiPathways', 'species': 'Homo sapiens', 'license': 'CC0 1.0', 'source': 'https://data.wikipathways.org/current/gmt/' + fn, 'attribution': 'WikiPathways (Agrawal et al. 2024, Nucleic Acids Res)'})

# ---- Gene Ontology Biological Process (propagated true-path) ----
obo = get('https://current.geneontology.org/ontology/go-basic.obo').decode()
terms, cur = {}, None
for line in obo.splitlines():
    if line == '[Term]': cur = {'parents': [], 'obs': False}
    elif line.startswith('[') : cur = None
    elif cur is not None:
        if line.startswith('id: '): cur['id'] = line[4:]; terms[cur['id']] = cur
        elif line.startswith('name: '): cur['name'] = line[6:]
        elif line.startswith('namespace: '): cur['ns'] = line[11:]
        elif line.startswith('is_obsolete: true'): cur['obs'] = True
        elif line.startswith('is_a: '): cur['parents'].append(line[6:].split(' ')[0])
        elif line.startswith('relationship: part_of '): cur['parents'].append(line.split(' ')[2])
anc = {}
def ancestors(t):
    if t in anc: return anc[t]
    s = {t}
    for p in terms.get(t, {}).get('parents', []): s |= ancestors(p)
    anc[t] = s; return s
gaf = gzip.decompress(get('https://current.geneontology.org/annotations/goa_human.gaf.gz')).decode()
direct = {}
for line in gaf.splitlines():
    if line.startswith('!'): continue
    f = line.split('\t')
    if len(f) < 15 or f[8] != 'P' or 'NOT' in f[3]: continue
    direct.setdefault(f[2], set()).add(f[4])
bp = {}
for sym, gos in direct.items():
    full = set()
    for g in gos:
        if g in terms and not terms[g].get('obs'): full |= ancestors(g)
    for g in full:
        if terms.get(g, {}).get('ns') == 'biological_process': bp.setdefault(g, set()).add(sym)
gs_ = [(i, terms[i]['name'], s) for i, s in bp.items() if 10 <= len(s) <= 500]
pack('go_bp_human.json', gs_, {'name': 'Gene Ontology: Biological Process', 'species': 'Homo sapiens', 'license': 'CC BY 4.0', 'source': 'go-basic.obo + goa_human.gaf (current.geneontology.org)', 'attribution': 'Gene Ontology Consortium (2023) Genetics 224(1)', 'note': 'annotations propagated to ancestors (is_a, part_of); term size 10-500 genes'})

# ---- JASPAR 2024 CORE vertebrates non-redundant ----
txt = get('https://jaspar.elixir.no/download/data/2024/CORE/JASPAR2024_CORE_vertebrates_non-redundant_pfms_jaspar.txt').decode()
mats = []
for blk in txt.split('>')[1:]:
    lines = blk.strip().splitlines(); mid, name = lines[0].split('\t')[0], lines[0].split('\t')[1]
    rows = {}
    for l in lines[1:]:
        m = re.match(r'([ACGT])\s*\[(.*)\]', l)
        if m: rows[m.group(1)] = [int(float(x)) for x in m.group(2).split()]
    if len(rows) == 4: mats.append({'id': mid, 'name': name, 'A': rows['A'], 'C': rows['C'], 'G': rows['G'], 'T': rows['T']})
json.dump({'meta': {'name': 'JASPAR 2024 CORE vertebrates (non-redundant)', 'license': 'CC BY 4.0', 'source': 'https://jaspar.elixir.no/downloads/', 'attribution': 'JASPAR 2024 (Rauluseviciute et al. 2024, Nucleic Acids Res)', 'built': today, 'n': len(mats)}, 'matrices': mats}, open(os.path.join(OUT, 'jaspar_core_vertebrates.json'), 'w'), separators=(',', ':'))
print('jaspar', len(mats), 'matrices', file=sys.stderr)
