"""Import finished labs from ai_course_content into the Kongu AI Academy portal.

- Removes the ViLabs token / validation system and Code Purple image links
- Rewrites Colab + dataset links to the public kongu-ai-academy repo
- Writes cleaned HTML, notebooks, datasets and images to public/course-labs/
- Writes lib/courseLabs.json with metadata for the portal pages
"""
import glob, html, json, os, re, shutil, sys

SRC, DST = sys.argv[1], sys.argv[2]
REPO = "abhisek8113/kongu-ai-academy"
PUB = os.path.join(DST, "public", "course-labs")
RAW = f"https://raw.githubusercontent.com/{REPO}/main/public/course-labs"
COLAB = f"https://colab.research.google.com/github/{REPO}/blob/main/public/course-labs"

COURSES = {
    "course-01-foundations-python-math-data": ("python-data-foundations", "Python & Data Foundations", "#2f6f4f"),
    "course-02-classical-machine-learning": ("classical-ml", "Classical Machine Learning", "#a62a3a"),
}


def strip_div(text, cls):
    """Remove every <div class="cls">…</div> block, honouring nested divs."""
    while True:
        start = text.find(f'<div class="{cls}">')
        if start < 0:
            return text
        i, depth = start, 0
        for m in re.finditer(r"<div\b|</div>", text[start:]):
            depth += 1 if m.group(0) == "<div" else -1
            if depth == 0:
                i = start + m.end()
                break
        text = text[:start] + text[i:]


def clean_html(text, course, lab, nb_name):
    text = strip_div(text, "colab")
    text = re.sub(r"<img[^>]+codepurple[^>]*>", "", text)
    text = re.sub(r"https://colab\.research\.google\.com/github/matheshcp/ai_course_content/blob/main/[^\"']+",
                  f"{COLAB}/{course}/{lab}/{nb_name}", text)
    text = text.replace("matheshcp/ai_course_content", REPO)
    text = re.sub(r"ViLabs|VILabs|ViLab|Vilabs|Code Purple", "Kongu AI Academy", text)
    # brand footer + open links in a new tab from inside the portal frame
    text = text.replace("<head>", '<head>\n<base target="_blank">', 1)
    text = re.sub(r"<footer>(.*?)</footer>", r"<footer>Kongu AI Academy · \1</footer>", text, flags=re.S)
    text = text.replace("</head>", '<link rel="stylesheet" href="/lab-theme.css">\n</head>', 1)
    return text


def clean_notebook(path, course, lab):
    nb = json.load(open(path))
    cells = []
    for c in nb["cells"]:
        s = "".join(c["source"])
        if c["cell_type"] == "code" and s.strip() == "vlabs_submit()":
            c["source"] = ["kaa_check()  # prints your answers so you can compare them with the expected outputs\n"]
            c["outputs"], c["execution_count"] = [], None
        elif c["cell_type"] == "code" and "VLABS_API" in s:
            need = re.search(r"NEED = (\[.*?\])", s).group(1)
            names = re.search(r"names = (\[.*?\])", s)
            names = names.group(1) if names else "[]"
            c["source"] = [l + "\n" for l in f'''# Cell 0 — Kongu AI Academy: download the dataset (run this cell first).
import os, shutil, subprocess, urllib.request, zipfile

LAB_ID = "{lab}"
DATASET_ZIP_URL = "{RAW}/{course}/{lab}/bundle/dataset.zip"
NEED = {need}  # unzipped files used by the code below
EXERCISES = {names}  # functions you write in the exercise cells


def kaa_check():
    """Self-check: runs each exercise function and prints what it returns."""
    for name in EXERCISES:
        fn = globals().get(name)
        if not callable(fn):
            print(f"✗ {{name}}: not written yet")
            continue
        try:
            print(f"✓ {{name}}() ->", fn())
        except TypeError:
            print(f"✓ {{name}} is defined (takes arguments; test it with the example in its exercise)")
        except Exception as exc:
            print(f"✗ {{name}} raised {{type(exc).__name__}}: {{exc}}")


def _have_files():
    return all(os.path.exists(f) for f in NEED)


if _have_files():
    print("dataset ready:", ", ".join(NEED))
else:
    if shutil.which("wget"):
        subprocess.run(["wget", "-q", DATASET_ZIP_URL, "-O", "dataset.zip"], check=True)
    else:
        urllib.request.urlretrieve(DATASET_ZIP_URL, "dataset.zip")
    with zipfile.ZipFile("dataset.zip") as z:
        z.extractall(".")
    print("downloaded + unzipped dataset.zip ->", ", ".join(NEED))'''.split("\n")]
            c["source"][-1] = c["source"][-1].rstrip("\n")
            c["outputs"], c["execution_count"] = [], None
        elif c["cell_type"] == "markdown":
            s = re.sub(r"## How to run on Google Colab.*", (
                "## How to run on Google Colab\n"
                "1. Open this notebook from the Kongu AI Academy lab page (**Open in Colab**). Colab saves a copy to your Google Drive.\n"
                "2. Run **Cell 0** first: it downloads and unzips the dataset.\n"
                "3. Write your code in the exercise cells and run them.\n"
                "4. Run the last cell, `kaa_check()`, and compare your answers with the expected outputs in the exercises.\n"),
                s, flags=re.S) if "## How to run on Google Colab" in s else s
            s = s.replace("matheshcp/ai_course_content", REPO)
            s = re.sub(r"ViLabs|VILabs|Code Purple", "Kongu AI Academy", s)
            c["source"] = [l for l in re.split(r"(?<=\n)", s) if l]
        cells.append(c)
    nb["cells"] = cells
    return nb


labs_meta = []
for course, (slug, cname, color) in COURSES.items():
    for d in sorted(glob.glob(os.path.join(SRC, course, "labs", "lab-*"))):
        lab = os.path.basename(d)
        nbs = glob.glob(os.path.join(d, "*.ipynb"))
        if not nbs or not os.path.exists(os.path.join(d, "overview.html")):
            continue
        nb_name = os.path.basename(nbs[0])
        out = os.path.join(PUB, course, lab)
        os.makedirs(os.path.join(out, "bundle"), exist_ok=True)
        ov = open(os.path.join(d, "overview.html"), encoding="utf-8").read()
        st = open(os.path.join(d, "lab-steps.html"), encoding="utf-8").read()
        open(os.path.join(out, "overview.html"), "w").write(clean_html(ov, course, lab, nb_name))
        open(os.path.join(out, "steps.html"), "w").write(clean_html(st, course, lab, nb_name))
        json.dump(clean_notebook(nbs[0], course, lab), open(os.path.join(out, nb_name), "w"), indent=1, ensure_ascii=False)
        data_files = []
        for f in os.listdir(d):
            if os.path.isfile(os.path.join(d, f)) and f not in ("overview.html", "lab-steps.html") and not f.endswith(".ipynb"):
                shutil.copy(os.path.join(d, f), out)
                if not f.endswith((".png", ".jpg")):
                    data_files.append(f)
        if os.path.exists(os.path.join(d, "bundle", "dataset.zip")):
            shutil.copy(os.path.join(d, "bundle", "dataset.zip"), os.path.join(out, "bundle"))
        title = html.unescape(re.search(r"<title>(.*?)</title>", ov).group(1))
        title = re.sub(r"^Lab \d+ Overview — ", "", title)
        meta = re.search(r'<div class="meta">(.*?)</div>', ov, re.S).group(1)
        level = re.search(r"<strong>Level</strong>\s*([^·<]+)", meta)
        time = re.search(r"<strong>Time</strong>\s*([^·<]+)", meta)
        trk = re.search(r"<strong>Track</strong>\s*([^<]+)", meta)
        goals = re.search(r"<h2>Learning goals</h2>\s*<ol>(.*?)</ol>|<h2>Learning goals</h2>\s*<ul>(.*?)</ul>", ov, re.S)
        goal_list = [html.unescape(re.sub("<.*?>", "", g)).strip()
                     for g in re.findall(r"<li>(.*?)</li>", (goals.group(1) or goals.group(2)) if goals else "", re.S)]
        labs_meta.append({
            "course": slug, "courseName": cname, "color": color, "folder": course, "lab": lab,
            "num": int(re.search(r"lab-(\d+)", lab).group(1)), "title": title,
            "track": html.unescape(trk.group(1).strip()) if trk else "",
            "level": level.group(1).strip() if level else "", "time": time.group(1).strip() if time else "",
            "goals": goal_list[:5], "notebook": nb_name, "datasets": sorted(data_files),
            "base": f"/course-labs/{course}/{lab}",
            "colab": f"{COLAB}/{course}/{lab}/{nb_name}",
        })

json.dump(labs_meta, open(os.path.join(DST, "lib", "courseLabs.json"), "w"), indent=1, ensure_ascii=False)
print(len(labs_meta), "labs imported")
