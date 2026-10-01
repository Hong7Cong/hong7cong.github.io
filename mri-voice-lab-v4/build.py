from pathlib import Path
p=Path(__file__).resolve().parent
if not (p/'sample.json').exists():
    raw=(p/'sample.js').read_text()
    (p/'sample.json').write_text(raw.removeprefix('const SAMPLE = ').removesuffix(';'))
s=(p/'index.html').read_text()
for name in ['sample.js','analysis-engine.js','audio.js','geometry.js','app.js']:
    s=s.replace(f'<script src="{name}"></script>','<script>\n'+(p/name).read_text()+'\n</script>')
out=p.parent/'mri-voice-lab-v4.html';out.write_text(s);print(out)
