# WealthPilot Structured Product Demo

Standalone demo for the Structured Product Dashboard, lifecycle detail page, term sheet upload, lightweight PDF parsing, and lifecycle cashflow display.

## Local Run

```bash
npm install
python3 -m pip install --user -r requirements.txt
npm start
```

Open `http://127.0.0.1:8844/index.html`.

## Render Deploy

Use the included `render.yaml` as a Blueprint, or create a Web Service with:

- Build command: `npm install && python3 -m pip install --user -r requirements.txt`
- Start command: `npm start`
- Environment:
  - `HOST=0.0.0.0`
  - `PDF_PARSER_PYTHON=python3`

Uploaded PDFs are stored on the service disk for demo use only.
