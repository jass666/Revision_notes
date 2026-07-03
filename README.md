# Revision Notes

Static, browser-based revision pages for exam preparation. The repo is designed to be hosted directly from GitHub Pages or any static hosting provider: each topic is a standalone HTML file, and `index.html` builds the hub from `sites.json`.

Live URL: <a href="https://kznotes.pages.dev/" target="_blank" rel="noopener noreferrer">https://kznotes.pages.dev/</a>

## Contents

- `index.html` - main revision hub with subject filters and search.
- `sites.json` - topic registry used by the hub.
- `search-widget.js` - shared search helper for revision pages.
- Topic pages:
  - `atmosphere.html`
  - `buddhism.html`
  - `currents.html`
  - `earthquakes-volcanoes-upsc.html`
  - `enso.html`
  - `governor-general-acts.html`
  - `jainism.html`
  - `monsoon.html`
  - `ntpc.html`
  - `water_bodies.html`
  - `wildlife.html`

## Hosting

This is a static site, so no build step is required.

For Cloudflare Pages:

1. Push the repository to GitHub.
2. Connect the repository in Cloudflare Pages.
3. Use no build command and the repository root as the output.
4. Save and wait for Cloudflare Pages to publish the site.

The live site is:

```text
https://kznotes.pages.dev/
```

Topic pages are served from URLs such as:

```text
https://kznotes.pages.dev/ntpc.html
```

## Push And Deploy Tool

This repo includes a portable deploy helper:

```powershell
.\deploy.ps1
```

On Windows, you can also run:

```bat
deploy.bat
```

The helper can be run from any downloaded copy of this folder. It initializes Git if needed, points `origin` to `https://github.com/jass666/Revision_notes.git`, commits the local folder state, and force-pushes it to `main`.

The script asks for confirmation before pushing. Local files win, so remote-only changes can be overwritten.

Optional examples:

```powershell
.\deploy.ps1
```

The script does not create logs or temporary working folders. It may create a local `.git` folder if you run it from a plain downloaded/extracted copy. You can delete the whole local folder after the push completes. You must have Git installed and permission to push to the repository.

## Adding A Topic

1. Add the new HTML file to the repository root.
2. Add a matching entry in `sites.json`.
3. Commit and push the changes.

Example:

```json
{
  "title": "NTPC CBT-2",
  "file": "ntpc.html",
  "icon": "Railway",
  "subject": "Aptitude",
  "desc": "Maths and reasoning revision for NTPC CBT-2",
  "tags": ["NTPC", "Maths", "Reasoning"],
  "status": "live"
}
```

The hub creates subject sections automatically from `sites.json`. If a new subject needs a custom color, add it to the `COLORS` object in `index.html`.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a commit-history-based summary of project changes.
