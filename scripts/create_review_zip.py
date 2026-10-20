import os
import zipfile

OUTPUT_ZIP = r"C:\Users\QWERTY\Documents\peer-learning-platform-batch-6-review.zip"
BASE_DIR = os.path.abspath(".")

INCLUDED_DIRS = ['docs', 'diagrams', 'prototype', 'scripts']
INCLUDED_FILES = ['README.md', '.gitignore']

EXCLUDED_EXTS = {'.pyc', '.pyo'}
EXCLUDED_FILES = {'youtrack-token.txt', 'token.txt', '.DS_Store', 'Thumbs.db'}
EXCLUDED_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'venv'}

def make_zip():
    print(f"Creating review archive at: {OUTPUT_ZIP}")
    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)

    file_count = 0
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Include root files
        for f in INCLUDED_FILES:
            fp = os.path.join(BASE_DIR, f)
            if os.path.exists(fp):
                zf.write(fp, arcname=f)
                file_count += 1
                print(f"  Added file: {f}")

        # Include directories
        for d in INCLUDED_DIRS:
            dp = os.path.join(BASE_DIR, d)
            if not os.path.exists(dp):
                continue
            for root, dirs, files in os.walk(dp):
                dirs[:] = [sub for sub in dirs if sub not in EXCLUDED_DIRS and not sub.startswith('.')]
                for f in files:
                    if f in EXCLUDED_FILES or any(f.endswith(ext) for ext in EXCLUDED_EXTS):
                        continue
                    if 'token' in f.lower() or 'secret' in f.lower() or 'credential' in f.lower():
                        continue
                    abs_path = os.path.join(root, f)
                    rel_path = os.path.relpath(abs_path, BASE_DIR)
                    zf.write(abs_path, arcname=rel_path)
                    file_count += 1
                    print(f"  Added: {rel_path}")

    zip_size = os.path.getsize(OUTPUT_ZIP)
    print(f"\nSuccessfully created {OUTPUT_ZIP}")
    print(f"Total files: {file_count}, Total size: {zip_size:,} bytes")

if __name__ == '__main__':
    make_zip()
