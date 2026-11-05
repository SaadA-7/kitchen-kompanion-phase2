"""Create and extract the offline submission using an explicit file allowlist."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import platform

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'output'/'phase2_1'
runtime = ['index.html','styles.css','data.js','app.js','shopping.js','purchase-review.js','saved-lists.js','recipes.js']
readme = '''Kitchen Kompanion Phase 2.1

RUN
Extract the entire ZIP. Open prototype/index.html in desktop Chrome.
Keep all files and icons together. No network, server, npm, account or installer is required.
Use Chrome DevTools Responsive mode at 640 x 960 CSS pixels for the current interface.
Use the desktop keyboard to type. Inventory and recipe forms use their original layouts.
Shopping retains its preexisting noninteractive keyboard stand-in.

DOCUMENTS
01_Startup_and_Tasks.pdf gives starting data, reset instructions and ten task candidates.
02_Design_Rationale.pdf contains two horizontal and three vertical discussion pages,
followed by screenshots. Editable Markdown sources accompany both PDFs.

SAMPLE STATE
A fresh browser profile shows nine Kitchen items, seven Shopping items, six recipes.
Bread and eggs start purchased. Browser storage persists edits.
Reset Demo Data restores Kitchen only. Use a dedicated test profile for resetting all data.
The task PDF describes the storage keys and starting conditions.

LIMITATIONS
Preferences is explicitly unfinished. Recipe matching uses explicit demo aliases,
positive quantities and expiration checks; it does not calculate ingredient sufficiency,
scale ingredients by servings or implement dietary/allergy checks.
Keyboard placement for search fields is not modeled.
The separate course task scenarios and device specifications still need team review.
Offline Chrome and the extracted package were checked on the available Windows host;
this is not a clean Windows 10 certification or a user study.

SOURCE AND CREDIT
The prototype folder contains the complete runtime source (HTML/CSS/JavaScript) and assets.
Existing teammate code remains their contribution. Integration changes and document drafts
were prepared with Codex assistance. Team names, agreed authorship and the salary report
must come from the team. No upload, publication or course submission is performed by this ZIP.
'''
(OUT/'README.txt').write_text(readme,encoding='utf-8')
verification = json.loads((OUT/'verification.json').read_text())
verification['host'] = platform.platform()
(OUT/'verification.json').write_text(json.dumps(verification,indent=2),encoding='utf-8')
zip_path = OUT/'Kitchen_Kompanion_Phase_2_1.zip'
with ZipFile(zip_path,'w',ZIP_DEFLATED) as archive:
    for name in runtime:
        archive.write(ROOT/name,'prototype/'+name)
    for file in sorted((ROOT/'icons').rglob('*')):
        if file.is_file():
            archive.write(file,'prototype/icons/'+str(file.relative_to(ROOT/'icons')).replace('\\','/'))
    for name in ['01_Startup_and_Tasks.pdf','02_Design_Rationale.pdf','01_Startup_and_Tasks.md','02_Design_Rationale.md','README.txt','verification.json']:
        archive.write(OUT/name,name)
    archive.write(ROOT/'docs/phase2_1/contribution.md','Contribution_notes.md')
with ZipFile(zip_path) as archive:
    assert archive.testzip() is None
    # All members are generated above from a fixed allowlist and the local icons tree.
    extract_root = (OUT/'extracted-check').resolve()
    assert extract_root.is_relative_to(OUT.resolve())
    for name in archive.namelist():
        assert (extract_root/name).resolve().is_relative_to(extract_root)
    archive.extractall(extract_root)
print(f'Created {zip_path.name}; extracted runtime at {extract_root / "prototype"}')
