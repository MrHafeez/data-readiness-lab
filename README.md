# Data Readiness Lab

An interactive, static teaching prototype for checking a fictional sales dataset before using it in Excel or Power BI. Visitors can see duplicate IDs, missing regions, invalid revenue and inconsistent channel labels; choose treatments; and inspect the resulting chart and exclusions. It makes no upload, account, API or storage request.

Run `npm test` for the calculation checks. To preview locally, serve this directory with any static web server (for example `python -m http.server 8789`) and visit `http://127.0.0.1:8789/`. The ES module does not run reliably from `file://` in every browser.

To deploy to conventional static hosting, copy `index.html`, `styles.css`, `app.js` and `core.js` into `/data-readiness-lab/`. GitHub Pages can serve the same files. Links and canonical URL assume `https://mrhafeez.com/data-readiness-lab/` after publication.

The exclusion of negative revenue is a **teaching choice**. A real negative could be a refund or correction and must be checked with the data owner. The example does not validate real buyer demand or promise an outcome.
