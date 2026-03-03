import os
import glob

html_files = glob.glob('*.html')

nav_item_normal = '<li><a href="school.html" class="nav-link">School</a></li>'
nav_item_active = '<li><a href="school.html" class="nav-link" style="color: var(--accent-teal);">School</a></li>'

replacement_normal = '<li><a href="school.html" class="nav-link">School</a></li>\n                    <li><a href="training.html" class="nav-link">Training</a></li>'
replacement_active = '<li><a href="school.html" class="nav-link" style="color: var(--accent-teal);">School</a></li>\n                    <li><a href="training.html" class="nav-link">Training</a></li>'

footer_item = '<li><a href="school.html">School</a></li>'
footer_replacement = '<li><a href="school.html">School</a></li>\n                            <li><a href="training.html">Training</a></li>'

for fpath in html_files:
    if fpath in ['index.html', 'training.html']:
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update header nav
    if nav_item_normal in content:
        content = content.replace(nav_item_normal, replacement_normal)
    elif nav_item_active in content:
        content = content.replace(nav_item_active, replacement_active)

    # Update footer nav
    if footer_item in content:
        content = content.replace(footer_item, footer_replacement)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated navigation in HTML files.")
