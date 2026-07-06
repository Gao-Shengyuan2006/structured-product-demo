const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { execFile } = require("child_process");
const { promisify } = require("util");

const root = __dirname;
const port = Number(process.env.PORT || 8844);
const host = process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1");
const uploadDir = path.join(root, "uploads", "termsheets");
const tasks = new Map();
const execFileAsync = promisify(execFile);
const bundledPython = "/Users/gaoshengyuan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const pdfPython = process.env.PDF_PARSER_PYTHON || (fs.existsSync(bundledPython) ? bundledPython : "python3");

const products = [
  {
    id: "sp-001",
    title: "MSFT + NVDA FCN",
    description: "Autocallable fixed coupon note linked to MSFT and NVDA.",
    productType: "FCN",
    status: "Outstanding",
    piRelated: true,
    issueDate: "2026-01-18",
    maturityDate: "2027-01-18",
    tradeOrderId: "T-260118-001",
    isin: "XS2812345678",
    client: "Demo Client A",
    rm: "RM Team 1",
    amount: "1,000,000.00 USD",
    issuer: "J.P. Morgan",
    latestEvent: { name: "Observation", valuationDate: "2026-06-18", monitorResult: "Not Triggered" },
    nextEvent: { name: "Observation", paymentDate: "2026-07-18" },
    keyParams: {
      couponReturn: "14.20%",
      kiBarrier: "60%",
      koBarrier: "100%",
      strike: "85%",
      underlyings: [
        { ticker: "MSFT.US", identifier: "MSFT.US", quoteTicker: "MSFT.US", name: "Microsoft", initialLevel: 420.13, levelPct: 120.27 },
        { ticker: "NVDA.US", identifier: "NVDA.US", quoteTicker: "NVDA.US", name: "NVIDIA", initialLevel: 136.72, levelPct: 114.91 },
      ],
    },
  },
  {
    id: "sp-002",
    title: "AAPL ELN",
    description: "Equity linked note with downside delivery risk.",
    productType: "ELN",
    status: "Outstanding",
    piRelated: true,
    issueDate: "2026-02-07",
    maturityDate: "2026-08-07",
    tradeOrderId: "T-260207-004",
    isin: "XS2819876543",
    client: "Demo Client A",
    rm: "RM Team 1",
    amount: "650,000.00 USD",
    issuer: "Morgan Stanley",
    latestEvent: { name: "Initial Fixing", valuationDate: "2026-02-07", monitorResult: "Fixed" },
    nextEvent: { name: "Final Valuation", paymentDate: "2026-08-02" },
    keyParams: {
      couponReturn: "—",
      kiBarrier: "—",
      koBarrier: "—",
      strike: "88%",
      underlyings: [
        { ticker: "AAPL.US", identifier: "AAPL.US", quoteTicker: "AAPL.US", name: "Apple", initialLevel: 192.42, levelPct: 110.87 },
      ],
    },
  },
  {
    id: "sp-003",
    title: "HSI Protected Deposit",
    description: "Principal protected deposit with index-linked enhanced return.",
    productType: "Protected Deposit",
    status: "Matured",
    piRelated: false,
    issueDate: "2025-07-12",
    maturityDate: "2026-07-12",
    tradeOrderId: "T-250712-002",
    isin: "XS2799001122",
    client: "Demo Client B",
    rm: "RM Team 2",
    amount: "5,000,000.00 HKD",
    issuer: "UBS",
    latestEvent: { name: "Fixing", valuationDate: "2026-07-01", monitorResult: "Observed" },
    nextEvent: { name: "Redemption", paymentDate: "2026-07-12" },
    keyParams: {
      couponReturn: "3.50%",
      kiBarrier: "—",
      koBarrier: "—",
      strike: "19,200.00",
      underlyings: [
        { ticker: "HSI.INDX", identifier: "HSI.INDX", quoteTicker: "HSI.INDX", name: "Hang Seng Index", initialLevel: 19200, levelPct: 125.63 },
      ],
    },
  },
];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = String(contentType || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) return { fields: {}, files: [] };
  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const body = buffer.toString("binary");
  const parts = body.split(boundary).slice(1, -1);
  const fields = {};
  const files = [];

  for (const rawPart of parts) {
    const part = rawPart.replace(/^\r\n/, "").replace(/\r\n$/, "");
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd < 0) continue;
    const rawHeaders = part.slice(0, headerEnd);
    const content = part.slice(headerEnd + 4);
    const disposition = rawHeaders.match(/content-disposition:\s*form-data;([^]*?)$/im);
    if (!disposition) continue;
    const name = (disposition[1].match(/name="([^"]+)"/) || [])[1];
    const filename = (disposition[1].match(/filename="([^"]*)"/) || [])[1];
    if (!name) continue;

    if (filename) {
      files.push({
        field: name,
        filename: path.basename(filename),
        contentType: (rawHeaders.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || "application/octet-stream",
        data: Buffer.from(content, "binary"),
      });
    } else {
      fields[name] = Buffer.from(content, "binary").toString("utf8").trim();
    }
  }

  return { fields, files };
}

function publicUrl(req, relativePath) {
  return `http://${req.headers.host}${relativePath}`;
}

function serveStatic(req, res, pathname) {
  const filePath = path.join(root, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(data);
  });
}

function serveUpload(req, res, pathname) {
  const relative = pathname.replace(/^\/uploads\//, "");
  const filePath = path.join(root, "uploads", relative);
  if (!filePath.startsWith(path.join(root, "uploads"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "content-type": "application/pdf",
      "cache-control": "no-store",
    });
    res.end(data);
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateString, months) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseBarrierPercent(value, fallback) {
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumber(value) {
  const parsed = Number(String(value || "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTermsheetDate(value) {
  const match = String(value || "").match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!match) return null;
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const month = months[match[2]];
  if (!month) return null;
  return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
}

function formatMoney(amount, currency = "USD") {
  return `${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function marketLevelForTicker(ticker, index) {
  const levels = {
    "PLTR.US": 144.23,
    "TEM.US": 100.20,
    "AAPL.US": 106.35,
    "MSFT.US": 113.80,
  };
  return levels[ticker] || (108 + index * 3.5);
}

function localFilePathFromUrl(fileUrl) {
  const url = new URL(fileUrl);
  if (!url.pathname.startsWith("/uploads/")) return null;
  const relative = decodeURIComponent(url.pathname.replace(/^\/uploads\//, ""));
  const filePath = path.join(root, "uploads", relative);
  const uploadRoot = path.join(root, "uploads");
  return filePath.startsWith(uploadRoot) ? filePath : null;
}

async function extractPdfText(filePath) {
  const script = [
    "import json, sys",
    "import pdfplumber",
    "path = sys.argv[1]",
    "pages = []",
    "with pdfplumber.open(path) as pdf:",
    "    for page in pdf.pages:",
    "        pages.append(page.extract_text() or '')",
    "print(json.dumps({'text': '\\n'.join(pages)}))",
  ].join("\n");
  const { stdout } = await execFileAsync(pdfPython, ["-c", script, filePath], { maxBuffer: 20 * 1024 * 1024 });
  return JSON.parse(stdout).text || "";
}

function parseTermsheetText(text) {
  const normalized = text.replace(/\r/g, "");
  const termsStart = normalized.indexOf("TERMS OF THE NOTE");
  const termsText = termsStart >= 0 ? normalized.slice(termsStart) : normalized;
  const productName = (termsText.match(/Product Name\s+(.+?)\s+Brief Product Description/s) || [])[1]?.replace(/\s+/g, " ").trim();
  const description = (termsText.match(/Brief Product Description\s*\/\s*Risk\s+(.+?)\s+Issuer\s+/s) || [])[1]?.replace(/\s+/g, " ").trim();
  const issuer = (termsText.match(/\nIssuer\s+(.+?)\s+Dealer\s+/s) || [])[1]?.replace(/\s+/g, " ").trim();
  const isin = (normalized.match(/Security Identifiers\s+ISIN\s+([A-Z0-9]+)/) || [])[1];
  const principal = parseNumber((normalized.match(/Principal Amount\s+USD\s+([\d,]+)/) || [])[1]);
  const tradeDate = parseTermsheetDate((normalized.match(/Trade Date\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/) || [])[1]);
  const issueDate = parseTermsheetDate((normalized.match(/Issue Date\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/) || [])[1]);
  const finalValuationDate = parseTermsheetDate((normalized.match(/Final Valuation Date\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/) || [])[1]);
  const maturityDate = parseTermsheetDate((normalized.match(/Maturity Date\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/) || [])[1]);
  const settlement = (normalized.match(/Settlement\s+([A-Za-z ]+?)\s+Settlement Currency/) || [])[1]?.trim();
  const couponPeriod = parseNumber((normalized.match(/\bj\s+Coupon\s+Coupon Payment Date[\s\S]*?\n\s*1\s+([\d.]+)%/) || [])[1]);
  const couponPaymentDate = parseTermsheetDate((normalized.match(/\bj\s+Coupon\s+Coupon Payment Date[\s\S]*?\n\s*1\s+[\d.]+%\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/) || [])[1]);
  const strike = parseNumber((normalized.match(/\n\s*Strike\s+([\d.]+)%/) || [])[1]);
  const underlyings = [];
  const seen = new Set();
  const underlyingRegex = /^\s*(\d+)\s+(?:(.*?)\s+)?([A-Z]{2,6})\s+UQ\s+NASDAQ\s+USD\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)/gm;
  let match;
  const names = { PLTR: "PALANTIR TECHNOLOGIES INC-A", TEM: "TEMPUS AI INC", AAPL: "APPLE INC", MSFT: "MICROSOFT CORP" };
  while ((match = underlyingRegex.exec(normalized))) {
    const symbol = match[3];
    if (seen.has(symbol)) continue;
    seen.add(symbol);
    const ticker = `${symbol}.US`;
    const parsedName = String(match[2] || "").trim();
    underlyings.push({
      ticker,
      identifier: ticker,
      quoteTicker: ticker,
      sourceTicker: `${symbol} UQ`,
      name: parsedName || names[symbol] || symbol,
      initialLevel: parseNumber(match[4]),
      conversionRatio: parseNumber(match[5]),
      strikePrice: parseNumber(match[6]),
      levelPct: marketLevelForTicker(ticker, underlyings.length),
    });
  }

  if (!isin || !underlyings.length) return null;
  const couponPa = couponPeriod ? couponPeriod * 2 : null;
  const title = `${underlyings.map((item) => item.ticker).join("+")} ${productName?.includes("Reverse Convertible") ? "ELN" : "Structured Note"}`;
  return {
    productName,
    description,
    issuer,
    isin,
    principal,
    currency: "USD",
    tradeDate,
    issueDate,
    finalValuationDate,
    maturityDate,
    settlement,
    couponPeriod,
    couponPa,
    couponPaymentDate,
    strike,
    underlyings,
    title,
    rawTextLength: normalized.length,
  };
}

function buildPerformanceSeries(product) {
  const underlyings = product.keyParams?.underlyings || [];
  const issueDate = product.issueDate && product.issueDate !== "—" ? product.issueDate : todayIso();
  const maturityDate = product.maturityDate && product.maturityDate !== "—" ? product.maturityDate : addMonths(issueDate, 6);
  const start = new Date(`${issueDate}T00:00:00.000Z`);
  const end = new Date(`${maturityDate}T00:00:00.000Z`);
  const totalDays = Math.max(1, Math.round((end - start) / 86400000));
  const points = 18;
  const colors = ["#2f9ae0", "#c99b68", "#16a085", "#7c6fd6"];

  return {
    initialLevelPct: 100,
    strikeLevelPct: parseBarrierPercent(product.keyParams?.strike, 85),
    series: underlyings.map((underlying, seriesIndex) => {
      const finalPct = Number(underlying.levelPct) || 100;
      const seed = [...String(underlying.ticker || underlying.identifier || seriesIndex)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const data = Array.from({ length: points }, (_, index) => {
        const ratio = index / (points - 1);
        const trend = 100 + (finalPct - 100) * ratio;
        const wave = Math.sin((ratio * Math.PI * 3) + seed) * (5 + seriesIndex * 2);
        const pullback = Math.cos((ratio * Math.PI * 5) + seed / 7) * 2.2;
        const value = index === 0 ? 100 : index === points - 1 ? finalPct : Number((trend + wave + pullback).toFixed(2));
        return {
          date: addDays(issueDate, Math.round(totalDays * ratio)),
          value,
        };
      });
      const initialLevel = Number(underlying.initialLevel) || 100;
      return {
        ticker: underlying.ticker || underlying.identifier || underlying.quoteTicker || `Underlying ${seriesIndex + 1}`,
        color: colors[seriesIndex % colors.length],
        initialLevel,
        latestPrice: Number(((finalPct / 100) * initialLevel).toFixed(2)),
        cumulativePerformance: Number((finalPct - 100).toFixed(2)),
        strikeStatus: finalPct >= parseBarrierPercent(product.keyParams?.strike, 85) ? "Above" : "Below",
        strikeDistance: Number((finalPct - parseBarrierPercent(product.keyParams?.strike, 85)).toFixed(2)),
        points: data,
      };
    }),
  };
}

function buildQuotePreview(payload) {
  const source = payload.sourceProduct || null;
  const sourceUnderlyings = source?.keyParams?.underlyings || [];
  const requestedUnderlyings = Array.isArray(payload.underlyings) && payload.underlyings.length
    ? payload.underlyings
    : sourceUnderlyings.map((item) => item.ticker || item.identifier || item.quoteTicker).filter(Boolean);
  const strike = parseBarrierPercent(payload.strike, 100);
  const ko = parseBarrierPercent(payload.ko, 100);
  const couponPa = parseBarrierPercent(payload.couponPa, 0);
  const notePriceInput = parseBarrierPercent(payload.notePrice, 100);
  const underlyings = requestedUnderlyings.map((ticker, index) => {
    const sourceItem = sourceUnderlyings[index] || {};
    const initialLevel = Number(sourceItem.initialLevel) || 100 + index * 20;
    const levelPct = Number(sourceItem.levelPct) || marketLevelForTicker(ticker, index);
    const latestPrice = (initialLevel * levelPct) / 100;
    return {
      ticker,
      initialLevel: initialLevel.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      levelPct: `${levelPct.toFixed(2)}%`,
      latestPrice: latestPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      strikeStatus: levelPct >= strike ? "Above Strike" : "Below Strike",
      rawLevelPct: levelPct,
    };
  });
  const levels = underlyings.map((item) => item.rawLevelPct).filter(Number.isFinite);
  const worst = levels.length ? Math.min(...levels) : 100;
  const couponBump = Math.max(0, (100 - strike) * 0.08) + Math.max(0, ko - 100) * 0.03;
  const estimatedCoupon = payload.solveFor === "Coupon p.a.(%)" ? couponPa + couponBump : couponPa;
  const notePrice = payload.solveFor === "Note Price(%)"
    ? notePriceInput
    : Math.max(88, Math.min(104, notePriceInput + (worst - 100) * 0.03 - Math.max(0, couponPa - 10) * 0.08));

  return {
    productTitle: `${requestedUnderlyings.join(" + ") || "Manual"} ${payload.productType || source?.productType || "Structured Product"}`,
    source: source ? "parsed termsheet + demo market level" : "manual input + demo market level",
    indicativeNotePrice: `${notePrice.toFixed(2)}%`,
    estimatedCouponPa: `${estimatedCoupon.toFixed(2)}%`,
    worstLevel: `${worst.toFixed(2)}%`,
    scenario: worst >= strike ? "Above strike" : "Below strike",
    parsedInputs: `ISIN ${payload.isin || source?.isin || "—"} · ${payload.currency || amountCurrency(source || {})} · ${payload.tenor || 6}m · strike ${strike}% · KO ${ko}%`,
    pricingNote: "Mock only. Replace this endpoint with the pricing SDK/dealer quote engine for fair value, scenario probability, Greeks, and dealer quote output.",
    underlyings: underlyings.map(({ rawLevelPct, ...item }) => item),
  };
}

function notionalNumber(product) {
  const parsed = Number(String(product.amount || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function amountCurrency(product) {
  const match = String(product.amount || "").match(/\b[A-Z]{3}\b$/);
  return match ? match[0] : "USD";
}

function buildLifecycleDetail(product) {
  const currency = amountCurrency(product);
  const notional = notionalNumber(product);
  const couponRate = parseBarrierPercent(product.keyParams?.couponReturn, 0);
  const couponPeriodRate = parseBarrierPercent(product.keyParams?.couponPeriod, couponRate > 0 ? couponRate / 2 : 0);
  const expectedCoupon = couponPeriodRate > 0 ? Math.round((notional * couponPeriodRate) / 100) : 0;
  const finalFixingDate = product.latestEvent?.valuationDate || product.maturityDate;
  const settlementMode = product.productType === "Protected Deposit" ? "Cash Settlement" : "CashOrPhysical";
  const redemptionFormula = product.productType === "Protected Deposit" ? "PrincipalProtected" : "ParOrShareDelivery";
  const worstText = "Worst-of underlying used as maturity reference.";

  return {
    title: product.status === "Matured" ? "Maturity Income Detail" : "Lifecycle Detail",
    generalInfo: {
      client: product.client,
      tradeId: product.tradeOrderId,
      isin: product.isin,
      createTime: product.issueDate,
      status: product.status,
    },
    terms: [
      {
        title: "Basic Info",
        icon: "↗",
        items: [
          ["Status", product.status],
          ["Product Name", product.description],
          ["Product Type", product.productType],
          ["Payoff Family", product.productType.includes("Deposit") ? "CapitalProtection" : "YieldEnhancement"],
          ["ISIN", product.isin],
          ["Currency", currency],
          ["Notional", product.amount],
          ["Issue Date", product.issueDate],
          ["Trade Date", product.issueDate],
          ["Maturity Date", product.maturityDate],
          ["Redemption Date", product.nextEvent?.paymentDate || product.maturityDate],
          ["Tenor (m)", "6"],
          ["Basket Rule", product.keyParams?.underlyings?.length > 1 ? "Least Performing Underlying" : "Single Underlying"],
        ],
      },
      {
        title: "Maturity Income Terms",
        icon: "↗",
        items: [
          ["Coupon Type", couponRate > 0 ? "Fixed" : "Variable"],
          ["Coupon Rate p.a.", product.keyParams?.couponReturn || "—"],
          ["Coupon Rate Period", couponPeriodRate > 0 ? `${couponPeriodRate.toFixed(2)}%` : "—"],
          ["Strike", product.keyParams?.strike || "—"],
        ],
      },
      {
        title: "Maturity Redemption",
        icon: "$",
        items: [
          ["Settlement Mode", settlementMode],
          ["Physical Settlement", settlementMode === "CashOrPhysical" ? "Possible" : "No"],
          ["Final Fixing Date", finalFixingDate],
          ["Redemption Formula", redemptionFormula],
        ],
      },
      {
        title: "Redemption / Payoff",
        icon: "$",
        items: [
          ["Final Redemption Cash", `If WOfinal >= Strike, Final Redemption Amount = Denomination x 100%.`],
          ["Final Redemption Physical", product.productType.includes("Deposit") ? "Principal and coupon are paid in cash." : "If WOfinal < Strike, delivery of Share Amount of the Least Performing Underlying and cash equal to Remaining Amount x (WOfinal / Strike)."],
        ],
      },
    ],
    eventSummaries: [
      {
        title: "Final Fixing",
        dateRange: `${finalFixingDate} — ${product.maturityDate}`,
        status: product.latestEvent?.monitorResult || "Observed",
        note: `${product.latestEvent?.name || "Observation"} observed on ${finalFixingDate}. ${worstText} ${product.keyParams?.underlyings?.map((item, index) => `#${index + 1} ${item.ticker} observed ${item.levelPct || 100}%`).join("; ")}.`,
      },
      {
        title: "Coupon",
        dateRange: `${product.nextEvent?.paymentDate || product.maturityDate} — ${product.nextEvent?.paymentDate || product.maturityDate}`,
        status: expectedCoupon > 0 ? "Triggered" : "Scheduled",
        note: expectedCoupon > 0
          ? `Coupon condition satisfied. Expected ${expectedCoupon.toLocaleString()} ${currency}.`
          : "Coupon will be calculated from lifecycle valuation inputs.",
      },
    ],
    cashflows: [
      {
        date: product.nextEvent?.paymentDate || product.maturityDate,
        type: "Coupon",
        status: "Expected",
        expected: expectedCoupon > 0 ? `${expectedCoupon.toLocaleString()} ${currency}` : "—",
        calculated: expectedCoupon > 0 ? `${expectedCoupon.toLocaleString()} ${currency}` : "—",
        source: "lifecycle_engine",
        note: expectedCoupon > 0 ? "Coupon payable." : "No fixed coupon payable.",
      },
      {
        date: product.maturityDate,
        type: "Redemption",
        status: "Expected",
        expected: "—",
        calculated: product.amount,
        source: "lifecycle_engine",
        note: `${worstText} Cash redemption evaluated from maturity payoff rules.`,
      },
    ],
  };
}

function withPerformance(product) {
  return {
    ...product,
    performance: product.performance || buildPerformanceSeries(product),
    detail: product.detail || buildLifecycleDetail(product),
  };
}

function uniqueOptions(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => String(left).localeCompare(String(right)));
}

function buildFilterOptions(rows) {
  return {
    rms: uniqueOptions(rows.map((product) => product.rm || product.relationshipManager || product.relationship_manager || "Unassigned RM")),
    clients: uniqueOptions(rows.map((product) => product.client)),
    custodians: uniqueOptions(rows.map((product) => product.issuer)),
    accounts: uniqueOptions(rows.map((product) => product.account || product.accountNumber || product.tradeOrderId)),
    source: "demo-backend-filter-options",
  };
}

function productFromParsedTermsheet(parsed, payload, taskId) {
  const issueDate = parsed.issueDate || todayIso();
  const maturityDate = parsed.maturityDate || addMonths(issueDate, 6);
  const finalValuationDate = parsed.finalValuationDate || maturityDate;
  const couponDate = parsed.couponPaymentDate || maturityDate;
  const status = new Date(`${maturityDate}T00:00:00.000Z`) < new Date(`${todayIso()}T00:00:00.000Z`) ? "Matured" : "Outstanding";

  return withPerformance({
    id: `uploaded-${taskId}`,
    title: parsed.title,
    description: parsed.productName || parsed.description || "Parsed structured note from uploaded term sheet.",
    productType: parsed.productName?.includes("Equity Linked Notes") ? "ELN" : "Structured Note",
    status,
    piRelated: true,
    issueDate,
    maturityDate,
    tradeOrderId: `UPLOAD-${taskId.slice(0, 8).toUpperCase()}`,
    isin: parsed.isin,
    client: `Client ${payload.client_id}`,
    rm: "Uploaded RM",
    amount: formatMoney(parsed.principal || 1000000, parsed.currency || "USD"),
    issuer: parsed.issuer || "Parsed Issuer",
    latestEvent: { name: "Final Fixing", valuationDate: finalValuationDate, monitorResult: status === "Matured" ? "Observed" : "Scheduled" },
    nextEvent: { name: "Coupon Payment", paymentDate: couponDate },
    keyParams: {
      couponReturn: parsed.couponPa ? `${parsed.couponPa.toFixed(2)}%` : "—",
      couponPeriod: parsed.couponPeriod ? `${parsed.couponPeriod.toFixed(2)}%` : "—",
      kiBarrier: "—",
      koBarrier: "—",
      strike: parsed.strike ? `${parsed.strike.toFixed(2)}%` : "—",
      underlyings: parsed.underlyings,
    },
    timeline: [
      [parsed.tradeDate || issueDate, "Trade Date"],
      [issueDate, "Issue Date"],
      [finalValuationDate, "Final Valuation"],
      [couponDate, "Coupon Payment"],
      [maturityDate, "Maturity"],
    ],
    sourceFileUrls: payload.fileUrls,
    parsedTerms: parsed,
  });
}

function inferProductFromUpload(payload, taskId) {
  const firstUrl = String(payload.fileUrls[0] || "");
  const decodedName = decodeURIComponent(path.basename(firstUrl)).replace(/\.[^.]+$/, "");
  const cleanName = decodedName
    .replace(/^\d+-[0-9a-f-]+/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  const issueDate = todayIso();
  const maturityDate = addMonths(issueDate, 6);
  const isinSeed = taskId.replace(/-/g, "").slice(0, 10).toUpperCase();

  return withPerformance({
    id: `uploaded-${taskId}`,
    title: cleanName ? `${cleanName} FCN` : "Uploaded Term Sheet FCN",
    description: "Parsed from uploaded term sheet by the demo backend processor.",
    productType: "FCN",
    status: "Outstanding",
    piRelated: true,
    issueDate,
    maturityDate,
    tradeOrderId: `UPLOAD-${taskId.slice(0, 8).toUpperCase()}`,
    isin: `XS${isinSeed}`,
    client: `Client ${payload.client_id}`,
    rm: "Uploaded RM",
    amount: "1,000,000.00 USD",
    issuer: "Uploaded Issuer",
    latestEvent: { name: "Termsheet Parsed", valuationDate: issueDate, monitorResult: "Parsed" },
    nextEvent: { name: "Observation", paymentDate: addMonths(issueDate, 1) },
    keyParams: {
      couponReturn: "12.00%",
      kiBarrier: "60%",
      koBarrier: "100%",
      strike: "85%",
      underlyings: [
        { ticker: "AAPL.US", identifier: "AAPL.US", quoteTicker: "AAPL.US", name: "Apple", initialLevel: 192.42, levelPct: 106.35 },
        { ticker: "MSFT.US", identifier: "MSFT.US", quoteTicker: "MSFT.US", name: "Microsoft", initialLevel: 420.13, levelPct: 113.80 },
      ],
    },
    timeline: [
      [issueDate, "Termsheet Uploaded"],
      [addMonths(issueDate, 1), "Observation"],
      [maturityDate, "Maturity"],
    ],
    sourceFileUrls: payload.fileUrls,
  });
}

async function runLocalTermsheetProcessor(payload) {
  const taskId = randomUUID();
  let parsed = null;
  let parserError = null;
  try {
    const firstPath = localFilePathFromUrl(payload.fileUrls[0]);
    if (firstPath && fs.existsSync(firstPath) && path.extname(firstPath).toLowerCase() === ".pdf") {
      parsed = parseTermsheetText(await extractPdfText(firstPath));
    }
  } catch (error) {
    parserError = error.message || "PDF parser failed";
  }
  const product = parsed ? productFromParsedTermsheet(parsed, payload, taskId) : inferProductFromUpload(payload, taskId);
  const task = {
    task_id: taskId,
    status: "completed",
    message: parsed ? "Parsed PDF termsheet locally by demo backend." : "Processed locally by demo backend fallback.",
    created_at: new Date().toISOString(),
    payload,
    parsed,
    parser_error: parserError,
    product,
  };
  tasks.set(taskId, task);
  products.unshift(product);
  return task;
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/sp/lifecycle/list") {
    const rows = products.map(withPerformance);
    sendJson(res, 200, {
      positions: rows,
      filters: buildFilterOptions(rows),
      latestEvents: rows.map((product, index) => ({
        id: `${product.id}:${index}`,
        type: product.latestEvent.name,
        date: product.latestEvent.valuationDate,
        productType: product.productType,
        title: product.title,
        isin: product.isin,
      })),
      total: rows.length,
      page: 1,
      pageSize: rows.length,
      source: "demo-backend",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/sp/filter-options") {
    const rows = products.map(withPerformance);
    sendJson(res, 200, buildFilterOptions(rows));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/sp/quote/preview") {
    const body = await readBody(req);
    let payload = {};
    try {
      payload = JSON.parse(body.toString("utf8") || "{}");
    } catch {
      payload = {};
    }
    sendJson(res, 200, {
      preview: buildQuotePreview(payload),
      source: "demo-backend-quote-preview",
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/sp/termsheet/upload-local") {
    // Replacement point for real WealthPilot storage:
    // accept browser multipart upload, store the PDF, and return processor-readable fileUrls.
    const body = await readBody(req);
    const { fields, files } = parseMultipart(body, req.headers["content-type"]);
    if (!fields.client_id) {
      sendJson(res, 400, { error: "client_id is required" });
      return;
    }
    if (!files.length) {
      sendJson(res, 400, { error: "no files provided" });
      return;
    }
    fs.mkdirSync(uploadDir, { recursive: true });
    const urls = files.map((file) => {
      const id = randomUUID();
      const ext = path.extname(file.filename) || ".pdf";
      const filename = `${fields.client_id}-${id}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.data);
      return publicUrl(req, `/uploads/termsheets/${filename}`);
    });
    sendJson(res, 200, {
      urls,
      client_id: fields.client_id,
      source: "demo-backend-local-file",
      message: "Saved locally. These URLs will be processed by the demo backend.",
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/sp/termsheet/upload") {
    // Local version of WealthPilot's structured-product termsheet processor.
    // Later, replace runLocalTermsheetProcessor with the real parser/upsert workflow.
    const body = await readBody(req);
    let parsed = {};
    try {
      parsed = JSON.parse(body.toString("utf8") || "{}");
    } catch {
      parsed = {};
    }
    const payload = {
      client_id: parsed.client_id,
      ticket_id: parsed.ticket_id,
      fileUrls: parsed.fileUrls || [],
      db_name: parsed.db_name || parsed.dbName || process.env.SP_DB_NAME || undefined,
    };
    if (!payload.fileUrls.length) {
      sendJson(res, 400, { error: "fileUrls cannot be empty" });
      return;
    }
    const task = await runLocalTermsheetProcessor(payload);
    sendJson(res, 202, {
      status: task.status,
      task_id: task.task_id,
      product: task.product,
      parsed: task.parsed,
      parser_error: task.parser_error,
      source: "demo-backend-local-processor",
      payload,
    });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/sp/termsheet/result/")) {
    const taskId = url.pathname.split("/").pop();
    const task = tasks.get(taskId);
    if (!task) {
      sendJson(res, 404, { error: "Task not found", task_id: taskId });
      return;
    }
    sendJson(res, 200, {
      status: task.status,
      task_id: task.task_id,
      product: task.product,
      payload: task.payload,
      source: "demo-backend-local-processor",
    });
    return;
  }

  sendJson(res, 404, { error: "Demo backend endpoint not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    if (url.pathname.startsWith("/uploads/")) {
      serveUpload(req, res, decodeURIComponent(url.pathname));
      return;
    }
    serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(port, host, () => {
  console.log(`Structured Product demo running at http://${host}:${port}/index.html`);
});
