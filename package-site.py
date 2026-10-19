from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root=Path(__file__).resolve().parent
output=root/'dist'
output.mkdir(exist_ok=True)
public=[root/'index.html',root/'404.html',root/'robots.txt',root/'.nojekyll',*(root/'assets').rglob('*'),*(root/'projects').rglob('*')]
with ZipFile(output/'Ahmad-Amaan-website-ready-to-upload.zip','w',ZIP_DEFLATED) as archive:
    for path in public:
        if path.is_file(): archive.write(path,path.relative_to(root))
with ZipFile(output/'Ahmad-Amaan-website-source.zip','w',ZIP_DEFLATED) as archive:
    for path in root.rglob('*'):
        relative=path.relative_to(root)
        if any(part in ('node_modules','__pycache__','.git','dist','.idea','.oca') for part in relative.parts): continue
        if path.is_file(): archive.write(path,Path('portfolio')/relative)
print('Packaged deployable website and editable source, excluding dependencies.')
