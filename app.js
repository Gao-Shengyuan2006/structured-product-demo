const demoProducts = [
  {
    id: "sp-001",
    title: "MSFT + NVDA FCN",
    issuer: "J.P. Morgan",
    productType: "FCN",
    currency: "USD",
    status: "Outstanding",
    piRelated: true,
    issueDate: "2026-01-18",
    maturityDate: "2027-01-18",
    tradeOrderId: "T-260118-001",
    isin: "XS2812345678",
    client: "Demo Client A",
    amount: "1,000,000.00 USD",
    description: "Autocallable fixed coupon note linked to MSFT and NVDA.",
    latestEvent: { name: "Observation", valuationDate: "2026-06-18", monitorResult: "Not Triggered" },
    nextEvent: { name: "Observation", paymentDate: "2026-07-18" },
    keyParams: {
      couponReturn: "14.20%",
      kiBarrier: "60%",
      koBarrier: "100%",
      strike: "85%",
      underlyings: [
        { ticker: "MSFT.US", name: "Microsoft", initialLevel: 420.13, latestPrice: 505.28 },
        { ticker: "NVDA.US", name: "NVIDIA", initialLevel: 136.72, latestPrice: 157.11 },
      ],
    },
    timeline: [
      ["2026-01-18", "Issue"],
      ["2026-06-18", "Observation: Not Triggered"],
      ["2026-07-18", "Observation"],
      ["2027-01-18", "Maturity"],
    ],
  },
  {
    id: "sp-002",
    title: "AAPL ELN",
    issuer: "Morgan Stanley",
    productType: "ELN",
    currency: "USD",
    status: "Outstanding",
    piRelated: true,
    issueDate: "2026-02-07",
    maturityDate: "2026-08-07",
    tradeOrderId: "T-260207-004",
    isin: "XS2819876543",
    client: "Demo Client A",
    amount: "650,000.00 USD",
    description: "Equity linked note with downside delivery risk.",
    latestEvent: { name: "Initial Fixing", valuationDate: "2026-02-07", monitorResult: "Fixed" },
    nextEvent: { name: "Final Valuation", paymentDate: "2026-08-02" },
    keyParams: {
      couponReturn: "—",
      kiBarrier: "—",
      koBarrier: "—",
      strike: "88%",
      underlyings: [
        { ticker: "AAPL.US", name: "Apple", initialLevel: 192.42, latestPrice: 213.34 },
      ],
    },
    timeline: [
      ["2026-02-07", "Issue"],
      ["2026-08-02", "Final Valuation"],
      ["2026-08-07", "Settlement"],
    ],
  },
  {
    id: "sp-003",
    title: "HSI Protected Deposit",
    issuer: "UBS",
    productType: "Protected Deposit",
    currency: "HKD",
    status: "Matured",
    piRelated: false,
    issueDate: "2025-07-12",
    maturityDate: "2026-07-12",
    tradeOrderId: "T-250712-002",
    isin: "XS2799001122",
    client: "Demo Client B",
    amount: "5,000,000.00 HKD",
    description: "Principal protected deposit with index-linked enhanced return.",
    latestEvent: { name: "Fixing", valuationDate: "2026-07-01", monitorResult: "Observed" },
    nextEvent: { name: "Redemption", paymentDate: "2026-07-12" },
    keyParams: {
      couponReturn: "3.50%",
      kiBarrier: "—",
      koBarrier: "—",
      strike: "19,200.00",
      underlyings: [
        { ticker: "HSI.INDX", name: "Hang Seng Index", initialLevel: 19200, latestPrice: 24120 },
      ],
    },
    timeline: [
      ["2025-07-12", "Issue"],
      ["2026-07-01", "Final Fixing"],
      ["2026-07-12", "Redemption"],
    ],
  },
  {
    id: "sp-004",
    title: "TSLA + AMD Step Down FCN",
    issuer: "Goldman Sachs",
    productType: "Step Down FCN",
    currency: "USD",
    status: "Early Called",
    piRelated: true,
    issueDate: "2025-11-20",
    maturityDate: "2026-11-20",
    tradeOrderId: "T-251120-008",
    isin: "XS2800123456",
    client: "Demo Client C",
    amount: "800,000.00 USD",
    description: "Step-down autocall note linked to TSLA and AMD.",
    latestEvent: { name: "KnockOut", valuationDate: "2026-05-20", monitorResult: "Crossed" },
    nextEvent: { name: "Coupon Payment", paymentDate: "2026-07-08" },
    keyParams: {
      couponReturn: "18.00%",
      kiBarrier: "55%",
      koBarrier: "95%",
      strike: "80%",
      underlyings: [
        { ticker: "TSLA.US", name: "Tesla", initialLevel: 229.44, latestPrice: 284.20 },
        { ticker: "AMD.US", name: "AMD", initialLevel: 118.88, latestPrice: 141.76 },
      ],
    },
    timeline: [
      ["2025-11-20", "Issue"],
      ["2026-05-20", "KnockOut Triggered"],
      ["2026-07-08", "Coupon Payment"],
    ],
  },
  {
    id: "sp-005",
    title: "EUR/USD DCN",
    issuer: "Citi",
    productType: "DCN",
    currency: "EUR",
    status: "Expired",
    piRelated: true,
    issueDate: "2025-09-10",
    maturityDate: "2026-03-10",
    tradeOrderId: "T-250910-003",
    isin: "XS2777009911",
    client: "Demo Client D",
    amount: "700,000.00 EUR",
    description: "Dual currency note with alternate currency settlement.",
    latestEvent: { name: "Redemption", valuationDate: "2026-03-10", monitorResult: "Settled" },
    nextEvent: { name: "None", paymentDate: "—" },
    keyParams: {
      couponReturn: "7.80%",
      kiBarrier: "—",
      koBarrier: "—",
      strike: "1.0850",
      underlyings: [
        { ticker: "EURUSD.FOREX", name: "EUR/USD", initialLevel: 1.085, latestPrice: 1.173 },
      ],
    },
    timeline: [
      ["2025-09-10", "Issue"],
      ["2026-03-10", "Redemption Settled"],
    ],
  },
];

const state = {
  status: "All",
  search: "",
  breakdownMode: "issuer",
  view: "dashboard",
  selectedProductId: null,
};

let activeProducts = demoProducts;
let activeDataSource = "demo";

function getApiBase() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("apiBase");
  if (fromUrl != null) {
    localStorage.setItem("wealthpilotSpApiBase", fromUrl.trim());
    return fromUrl.trim();
  }
  const stored = localStorage.getItem("wealthpilotSpApiBase") || "";
  if (stored) return stored;
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return window.location.origin;
  }
  return "";
}

function setApiBase(value) {
  const normalized = String(value || "").trim().replace(/\/$/, "");
  if (normalized) {
    localStorage.setItem("wealthpilotSpApiBase", normalized);
  } else {
    localStorage.removeItem("wealthpilotSpApiBase");
  }
  const input = document.getElementById("apiBaseInput");
  if (input) input.value = normalized === window.location.origin ? "" : normalized;
  return normalized;
}

function apiUrl(path) {
  const base = getApiBase().replace(/\/$/, "");
  return `${base}${path}`;
}

function buildUpcomingEvents() {
  return activeProducts
    .filter((product) => product.nextEvent.paymentDate !== "—")
    .map((product) => ({
      id: product.id,
      date: product.nextEvent.paymentDate,
      type: product.nextEvent.name,
      productType: product.productType,
      title: product.title,
      issuer: product.issuer,
      isin: product.isin,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function normalizeBackendProduct(position) {
  const underlyings = (position.keyParams?.underlyings || []).map((underlying) => {
    const levelPct = Number(underlying.levelPct);
    const initialLevel = Number(underlying.initialLevel);
    const latestPrice = Number.isFinite(levelPct) && levelPct > 0 && Number.isFinite(initialLevel) && initialLevel > 0
      ? (levelPct / 100) * initialLevel
      : null;
    return {
      ticker: underlying.ticker || underlying.quoteTicker || underlying.identifier || underlying.bbg_ticker || underlying.name || "—",
      name: underlying.name || underlying.ticker || underlying.identifier || "Underlying",
      initialLevel: Number.isFinite(initialLevel) && initialLevel > 0 ? initialLevel : null,
      latestPrice,
      levelPct: Number.isFinite(levelPct) && levelPct > 0 ? levelPct : null,
    };
  });

  return {
    id: String(position.id),
    title: position.title || "Structured Product",
    issuer: position.issuer || position.client || "WealthPilot Backend",
    productType: position.productType || "Structured Product",
    currency: parseCurrency(position.amount) || "—",
    status: position.status || "Outstanding",
    piRelated: position.piRelated === true,
    issueDate: position.issueDate || "—",
    maturityDate: position.maturityDate || "—",
    tradeOrderId: position.tradeOrderId || "—",
    isin: position.isin || "—",
    client: position.client || "—",
    amount: position.amount || "—",
    description: position.description || "Structured product imported from WealthPilot lifecycle API.",
    latestEvent: position.latestEvent || { name: "—", valuationDate: "—", monitorResult: "—" },
    nextEvent: position.nextEvent || { name: "—", paymentDate: "—" },
    keyParams: {
      couponReturn: position.keyParams?.couponReturn || "—",
      kiBarrier: position.keyParams?.kiBarrier || "—",
      koBarrier: position.keyParams?.koBarrier || "—",
      strike: position.keyParams?.strike || "—",
      underlyings,
    },
    performance: position.performance || null,
    detail: position.detail || null,
    timeline: [
      [position.issueDate || "—", "Issue"],
      [position.latestEvent?.valuationDate || "—", position.latestEvent?.name || "Latest Event"],
      [position.nextEvent?.paymentDate || "—", position.nextEvent?.name || "Next Event"],
      [position.maturityDate || "—", "Maturity"],
    ],
  };
}

function parseCurrency(amount) {
  const match = String(amount || "").match(/\b[A-Z]{3}\b$/);
  return match ? match[0] : null;
}

async function loadProductsFromBackend() {
  const base = getApiBase();
  if (!base) return false;
  const response = await fetch(apiUrl("/api/sp/lifecycle/list?client_id=all&page_size=200"), {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }
  const payload = await response.json();
  const rows = Array.isArray(payload.positions) ? payload.positions : [];
  if (!rows.length) return false;
  activeProducts = rows.map(normalizeBackendProduct);
  activeDataSource = "backend";
  return true;
}

async function hydrateProducts() {
  const text = document.getElementById("dataSourceText");
  try {
    const loaded = await loadProductsFromBackend();
    if (loaded) {
      text.textContent = `Connected to demo backend · ${getApiBase()}`;
    } else {
      activeProducts = demoProducts;
      activeDataSource = "demo";
      text.textContent = getApiBase()
        ? `Demo data · backend returned no lifecycle positions from ${getApiBase()}`
        : "Demo data · run node server.js or enter a WealthPilot portal URL above";
    }
  } catch (error) {
    activeProducts = demoProducts;
    activeDataSource = "demo";
    text.textContent = `Demo data · backend unavailable (${error.message})`;
  }
  renderAll();
}

function initializeBackendControls() {
  const input = document.getElementById("apiBaseInput");
  if (input) {
    const initialBase = getApiBase();
    input.value = initialBase === window.location.origin ? "" : initialBase;
    input.addEventListener("change", () => setApiBase(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setApiBase(input.value);
        void hydrateProducts();
      }
    });
  }

  const refreshButton = document.getElementById("refreshButton");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      if (input) setApiBase(input.value);
      void hydrateProducts();
    });
  }
}

function formatPct(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function underlyingLevel(underlying) {
  if (Number.isFinite(underlying.levelPct) && underlying.levelPct > 0) return underlying.levelPct;
  if (!underlying.initialLevel || !underlying.latestPrice) return null;
  return (underlying.latestPrice / underlying.initialLevel) * 100;
}

function worstLevel(product) {
  const levels = product.keyParams.underlyings.map(underlyingLevel).filter(Number.isFinite);
  if (!levels.length) return null;
  return Math.min(...levels);
}

function chartValueDomain(performance) {
  const values = [
    performance?.initialLevelPct || 100,
    performance?.strikeLevelPct || 85,
    ...(performance?.series || []).flatMap((series) => (series.points || []).map((point) => Number(point.value))),
  ].filter(Number.isFinite);
  const min = Math.min(...values, 75);
  const max = Math.max(...values, 125);
  const padding = Math.max(8, (max - min) * 0.16);
  return { min: Math.max(0, min - padding), max: max + padding };
}

function renderPerformanceChart(product) {
  const performance = product.performance;
  const series = performance?.series || [];
  if (!series.length) {
    return `<div class="empty-state">No performance data available.</div>`;
  }

  const width = 800;
  const height = 330;
  const left = 96;
  const right = 140;
  const top = 42;
  const bottom = 54;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const domain = chartValueDomain(performance);
  const x = (index, length) => left + (plotWidth * index) / Math.max(1, length - 1);
  const y = (value) => top + ((domain.max - value) / (domain.max - domain.min)) * plotHeight;
  const lineY = (value) => y(Number(value));
  const labels = [domain.max, 118, 100, performance.strikeLevelPct || 85, domain.min]
    .filter((value, index, arr) => Number.isFinite(value) && arr.findIndex((item) => Math.abs(item - value) < 0.2) === index)
    .sort((a, b) => b - a);
  const dateLabels = series[0].points || [];
  const tickIndexes = [0, Math.floor(dateLabels.length * 0.25), Math.floor(dateLabels.length * 0.5), Math.floor(dateLabels.length * 0.75), dateLabels.length - 1]
    .filter((value, index, arr) => value >= 0 && arr.indexOf(value) === index);
  const initialY = lineY(100);
  const strikeY = lineY(performance.strikeLevelPct || 85);
  const labelsOverlap = Math.abs(initialY - strikeY) < 14;
  const initialLabelY = labelsOverlap ? initialY - 9 : initialY - 2;
  const strikeLabelY = labelsOverlap ? strikeY + 13 : strikeY + 4;

  const paths = series.map((item, seriesIndex) => {
    const points = item.points || [];
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index, points.length).toFixed(1)} ${y(Number(point.value)).toFixed(1)}`).join(" ");
    const last = points[points.length - 1] || {};
    const lastY = y(Number(last.value));
    const endLabelY = Math.abs(lastY - initialY) < 13
      ? lastY + (seriesIndex % 2 === 0 ? -12 : 14)
      : lastY;
    return `
      <path d="${path}" class="performance-line" style="--line-color:${item.color || "#2f9ae0"}"></path>
      <text x="${(width - right + 12).toFixed(1)}" y="${endLabelY.toFixed(1)}" class="performance-end-label" fill="${item.color || "#2f9ae0"}">${formatPct(Number(last.value))}</text>
    `;
  }).join("");

  const legend = series.map((item) => `
    <span class="chart-legend-item"><i style="background:${item.color || "#2f9ae0"}"></i>${item.ticker}</span>
  `).join("");

  const rows = series.map((item) => `
    <tr>
      <td>${item.ticker}</td>
      <td>${Number(item.latestPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
      <td class="${Number(item.cumulativePerformance) >= 0 ? "positive" : "negative"}">${formatPct(Number(item.cumulativePerformance))}</td>
      <td>
        <strong>${item.strikeStatus || "—"}</strong>
        <span>${formatPct(Number(item.strikeDistance))} ${Number(item.strikeDistance) >= 0 ? "above" : "below"} Strike</span>
      </td>
    </tr>
  `).join("");

  return `
    <div class="performance-card">
      <div class="chart-legend">${legend}</div>
      <svg class="performance-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Underlyings performance chart">
        ${labels.map((value) => `
          <line x1="${left}" y1="${lineY(value).toFixed(1)}" x2="${width - right}" y2="${lineY(value).toFixed(1)}" class="grid-line"></line>
          <text x="${width - 8}" y="${(lineY(value) + 4).toFixed(1)}" text-anchor="end" class="axis-label">${formatPct(value)}</text>
        `).join("")}
        ${tickIndexes.map((index) => `
          <line x1="${x(index, dateLabels.length).toFixed(1)}" y1="${top}" x2="${x(index, dateLabels.length).toFixed(1)}" y2="${height - bottom}" class="grid-line vertical"></line>
          <text x="${x(index, dateLabels.length).toFixed(1)}" y="${height - 18}" text-anchor="middle" class="axis-label">${dateLabels[index]?.date || ""}</text>
        `).join("")}
        <line x1="${left}" y1="${initialY.toFixed(1)}" x2="${width - right}" y2="${initialY.toFixed(1)}" class="reference-line"></line>
        <text x="${left - 8}" y="${initialLabelY.toFixed(1)}" text-anchor="end" class="reference-label">Initial Level</text>
        <line x1="${left}" y1="${strikeY.toFixed(1)}" x2="${width - right}" y2="${strikeY.toFixed(1)}" class="strike-line"></line>
        <text x="${left - 8}" y="${strikeLabelY.toFixed(1)}" text-anchor="end" class="reference-label">Strike Level</text>
        ${paths}
      </svg>
      <table class="performance-table">
        <thead>
          <tr><th>Underlying</th><th>Latest Price</th><th>Cumulative Performance</th><th>Strike</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildFallbackDetail(product) {
  const currency = parseCurrency(product.amount) || product.currency || "USD";
  const notional = Number(String(product.amount || "").replace(/[^0-9.-]/g, "")) || 0;
  const couponRate = Number(String(product.keyParams.couponReturn || "").replace(/[^\d.-]/g, "")) || 0;
  const expectedCoupon = couponRate > 0 ? Math.round((notional * couponRate) / 100 / 2) : 0;
  const finalFixingDate = product.latestEvent?.valuationDate || product.maturityDate;
  const finalFixingNote = `${product.latestEvent?.name || "Observation"} observed on ${finalFixingDate}. Worst-of underlying used as maturity reference.`;

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
          ["Maturity Date", product.maturityDate],
          ["Basket Rule", product.keyParams.underlyings.length > 1 ? "Least Performing Underlying" : "Single Underlying"],
        ],
      },
      {
        title: "Maturity Income Terms",
        icon: "↗",
        items: [
          ["Coupon Type", couponRate > 0 ? "Fixed" : "Variable"],
          ["Coupon Rate p.a.", product.keyParams.couponReturn],
          ["Coupon Rate Period", couponRate > 0 ? `${(couponRate / 2).toFixed(2)}%` : "—"],
          ["Strike", product.keyParams.strike],
        ],
      },
      {
        title: "Maturity Redemption",
        icon: "$",
        items: [
          ["Settlement Mode", product.productType.includes("Deposit") ? "Cash Settlement" : "CashOrPhysical"],
          ["Physical Settlement", product.productType.includes("Deposit") ? "No" : "Possible"],
          ["Final Fixing Date", finalFixingDate],
          ["Redemption Formula", product.productType.includes("Deposit") ? "PrincipalProtected" : "ParOrShareDelivery"],
        ],
      },
      {
        title: "Redemption / Payoff",
        icon: "$",
        items: [
          ["Final Redemption Cash", "If WOfinal >= Strike, Final Redemption Amount = Denomination x 100%."],
          ["Final Redemption Physical", product.productType.includes("Deposit") ? "Principal and coupon are paid in cash." : "If WOfinal < Strike, delivery of Share Amount of the Least Performing Underlying and cash equal to Remaining Amount x (WOfinal / Strike)."],
        ],
      },
    ],
    eventSummaries: [
      { title: "Final Fixing", dateRange: `${finalFixingDate} — ${product.maturityDate}`, status: product.latestEvent?.monitorResult || "Observed", note: finalFixingNote },
      { title: "Coupon", dateRange: `${product.nextEvent?.paymentDate || product.maturityDate} — ${product.nextEvent?.paymentDate || product.maturityDate}`, status: expectedCoupon > 0 ? "Triggered" : "Scheduled", note: expectedCoupon > 0 ? `Coupon condition satisfied. Expected ${expectedCoupon.toLocaleString()} ${currency}.` : "Coupon will be calculated from lifecycle valuation inputs." },
    ],
    cashflows: [
      { date: product.nextEvent?.paymentDate || product.maturityDate, type: "Coupon", status: "Expected", expected: expectedCoupon > 0 ? `${expectedCoupon.toLocaleString()} ${currency}` : "—", calculated: expectedCoupon > 0 ? `${expectedCoupon.toLocaleString()} ${currency}` : "—", source: "lifecycle_engine", note: expectedCoupon > 0 ? "Coupon payable." : "No fixed coupon payable." },
      { date: product.maturityDate, type: "Redemption", status: "Expected", expected: "—", calculated: product.amount, source: "lifecycle_engine", note: "Worst-of underlying used as maturity reference. Cash redemption evaluated from maturity payoff rules." },
    ],
  };
}

function detailFor(product) {
  return product.detail || buildFallbackDetail(product);
}

function renderTermCard(card) {
  return `
    <article class="term-card">
      <h3><span class="term-icon">${card.icon || "↗"}</span>${card.title}</h3>
      <div class="term-grid">
        ${(card.items || []).map(([label, value]) => `
          <div class="term-item">
            <span>${label}</span>
            <strong>${value || "—"}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderEventSummary(event) {
  return `
    <article class="event-summary-card">
      <div class="event-dot"></div>
      <h3>${event.title}</h3>
      <p>${event.dateRange || "—"}</p>
      <div class="event-summary-status">${event.status || "—"}</div>
      <div class="event-summary-note">${event.note || "—"}</div>
    </article>
  `;
}

function renderCashflows(detail) {
  const rows = detail.cashflows || [];
  return `
    <section class="panel detail-wide-panel">
      <h2>Cashflows</h2>
      <div class="cashflow-table-wrap">
        <table class="cashflow-table">
          <thead>
            <tr><th>Date</th><th>Type</th><th>Status</th><th>Expected</th><th>Calculated</th><th>Source</th><th>Note</th></tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${row.date}</td>
                <td>${row.type}</td>
                <td>${row.status}</td>
                <td>${row.expected}</td>
                <td>${row.calculated}</td>
                <td>${row.source}</td>
                <td>${row.note}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function filteredProducts() {
  const query = state.search.trim().toLowerCase();
  return activeProducts.filter((product) => {
    const statusOk = state.status === "All" || product.status === state.status;
    const haystack = [
      product.title,
      product.issuer,
      product.productType,
      product.currency,
      product.status,
      product.isin,
      product.client,
    ].join(" ").toLowerCase();
    return statusOk && (!query || haystack.includes(query));
  });
}

function renderSummary() {
  const upcomingEvents = buildUpcomingEvents();
  const counts = [
    ["All Products", activeProducts.length],
    ["Outstanding", activeProducts.filter((p) => p.status === "Outstanding").length],
    ["Early Called", activeProducts.filter((p) => p.status === "Early Called").length],
    ["Matured", activeProducts.filter((p) => p.status === "Matured").length],
    ["Upcoming Events", upcomingEvents.length],
  ];
  document.getElementById("summaryGrid").innerHTML = counts
    .map(([label, value]) => `
      <article class="summary-card">
        <div class="value">${value}</div>
        <p class="label">${label}</p>
      </article>
    `)
    .join("");
}

function breakdownKey(product) {
  if (state.breakdownMode === "issuer") return product.issuer;
  if (state.breakdownMode === "productType") return product.productType;
  if (state.breakdownMode === "currency") return product.currency;
  return product.status;
}

function renderBreakdown() {
  const groups = new Map();
  for (const product of activeProducts) {
    const key = breakdownKey(product);
    const current = groups.get(key) || { count: 0, notionalText: [] };
    current.count += 1;
    current.notionalText.push(product.amount);
    groups.set(key, current);
  }
  const max = Math.max(...Array.from(groups.values()).map((item) => item.count));
  const rows = Array.from(groups.entries()).sort((a, b) => b[1].count - a[1].count);

  document.getElementById("breakdownList").innerHTML = rows
    .map(([label, item]) => `
      <div class="breakdown-row">
        <div class="breakdown-label">${label}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(item.count / max) * 100}%"></div></div>
        <strong>${item.count}</strong>
      </div>
    `)
    .join("");
}

function renderEvents() {
  const upcomingEvents = buildUpcomingEvents();
  document.getElementById("eventList").innerHTML = upcomingEvents
    .map((event) => `
      <button class="event-row" type="button" data-open-detail="${event.id}">
        <div class="event-date">${event.date}</div>
        <div class="event-main">
          <div class="event-title">${event.type} · ${event.title}</div>
          <p class="event-meta">${event.issuer} · ${event.isin}</p>
        </div>
        <span class="subtle-pill">${event.productType}</span>
      </button>
    `)
    .join("");
}

function renderMonitor() {
  const monitorProducts = activeProducts.slice(0, 3);
  document.getElementById("monitorGrid").innerHTML = monitorProducts
    .map((product) => {
      const worst = worstLevel(product);
      const first = product.keyParams.underlyings[0] || {};
      const width = Math.max(0, Math.min(140, worst || 0));
      return `
        <article class="monitor-card">
          <div class="monitor-header">
            <div>
              <h3>${product.title}</h3>
              <p class="product-meta">${product.issuer} · ${product.productType}</p>
            </div>
            <span class="status-pill ${statusClass(product.status)}">${product.status}</span>
          </div>
          <div class="level-meter">
            <div class="bar-track"><div class="bar-fill" style="width:${Math.min(width, 100)}%"></div></div>
          </div>
          <div class="monitor-values">
            <div class="metric-box">
              <div class="metric-label">Worst Level</div>
              <div class="metric-value">${formatPct(worst)}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Latest Close</div>
              <div class="metric-value">${first.latestPrice ?? "—"}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Initial</div>
              <div class="metric-value">${first.initialLevel ?? "—"}</div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProducts() {
  const rows = filteredProducts();
  document.getElementById("productList").innerHTML = rows.length
    ? rows.map((product) => {
        const worst = worstLevel(product);
        return `
          <article class="product-card">
            <div>
              <div class="product-title">${product.title}</div>
              <p class="product-meta">${product.description}</p>
            </div>
            <div class="product-secondary">
              <div class="product-kv"><span>Issuer</span><strong>${product.issuer}</strong></div>
              <div class="product-kv"><span>ISIN</span><strong>${product.isin}</strong></div>
              <div class="product-kv"><span>Amount</span><strong>${product.amount}</strong></div>
            </div>
            <div class="product-secondary">
              <div class="product-kv"><span>Worst Level</span><strong>${formatPct(worst)}</strong></div>
              <div class="product-kv"><span>Next Event</span><strong>${product.nextEvent.name}</strong></div>
              <div class="product-kv"><span>Payment Date</span><strong>${product.nextEvent.paymentDate}</strong></div>
            </div>
            <div class="product-secondary">
              <span class="status-pill ${statusClass(product.status)}">${product.status}</span>
              <button class="open-button" type="button" data-open-detail="${product.id}">Open Detail</button>
            </div>
          </article>
        `;
      }).join("")
    : `<div class="empty-state">No structured products match the current filters.</div>`;
}

function renderRfqOverview() {
  const rows = [
    ["RFQ-260701", "MSFT + NVDA FCN", "Requested", "Public", "J.P. Morgan", "Note Price(%)"],
    ["RFQ-260702", "AAPL ELN", "Quoted", "Public", "Morgan Stanley", "Strike(%)"],
    ["RFQ-260703", "TSLA + AMD Step Down FCN", "Quoted", "Private", "Goldman Sachs", "Coupon p.a.(%)"],
    ["RFQ-260704", "EUR/USD DCN", "Expired", "Private", "Citi", "Bonus(%)"],
  ];
  const table = document.getElementById("rfqTable");
  if (!table) return;
  table.innerHTML = `
    <div class="rfq-row header">
      <div>RFQ ID</div>
      <div>Product</div>
      <div>Status</div>
      <div>Type</div>
      <div>Best Pricer</div>
      <div>Solve For</div>
    </div>
    ${rows.map((row) => `
      <button class="rfq-row" type="button">
        ${row.map((cell) => `<div>${cell}</div>`).join("")}
      </button>
    `).join("")}
  `;
}

function viewFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("lifecycle-detail/")) {
    state.selectedProductId = decodeURIComponent(hash.slice("lifecycle-detail/".length));
    return "lifecycleDetail";
  }
  if (hash === "upload-termsheet") return "uploadTermsheet";
  if (hash === "new-quote") return "newQuote";
  if (hash === "rfq-overview") return "rfqOverview";
  if (hash === "lifecycle-list") return "lifecycleList";
  return "dashboard";
}

function setView(view, opts = {}) {
  state.view = view;
  const mainPageHeader = document.getElementById("mainPageHeader");
  if (mainPageHeader) mainPageHeader.classList.toggle("hidden", view === "lifecycleDetail");
  document.querySelectorAll("[data-view]").forEach((node) => {
    node.classList.toggle("hidden", node.dataset.view !== view && !(view === "dashboard" && node.dataset.view === "lifecycleList"));
  });
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("current", link.dataset.viewLink === view);
  });
  if (view === "rfqOverview") renderRfqOverview();
  if (!opts.skipHash) {
    const hash = view === "lifecycleDetail" && state.selectedProductId
      ? `lifecycle-detail/${encodeURIComponent(state.selectedProductId)}`
      : view === "uploadTermsheet"
      ? "upload-termsheet"
      : view === "newQuote"
      ? "new-quote"
      : view === "rfqOverview"
        ? "rfq-overview"
        : view === "lifecycleList"
          ? "lifecycle-list"
          : "dashboard";
    window.history.replaceState(null, "", `#${hash}`);
  }
}

function setUploadStatus(message, isError = false) {
  const node = document.getElementById("uploadStatus");
  if (!node) return;
  node.textContent = message;
  node.style.color = isError ? "#b91c1c" : "";
}

async function handleTermsheetUpload(event) {
  event.preventDefault();
  const apiBase = getApiBase();
  if (!apiBase) {
    setUploadStatus("Missing backend URL. Run node server.js or enter a WealthPilot portal URL above.", true);
    return;
  }

  const form = event.currentTarget;
  const data = new FormData(form);
  const clientId = String(data.get("client_id") || "").trim();
  const ticketId = String(data.get("ticket_id") || "").trim();
  const files = data.getAll("files").filter((file) => file instanceof File && file.size > 0);

  if (!clientId || !ticketId || !files.length) {
    setUploadStatus("Client ID, Ticket ID, and a PDF file are required.", true);
    return;
  }

  try {
    setUploadStatus("Uploading PDF to WealthPilot...");
    const localForm = new FormData();
    localForm.set("client_id", clientId);
    for (const file of files) localForm.append("files", file);

    const uploadLocalRes = await fetch(apiUrl("/api/sp/termsheet/upload-local"), {
      method: "POST",
      body: localForm,
      credentials: "include",
    });
    const uploadLocalJson = await uploadLocalRes.json().catch(() => ({}));
    if (!uploadLocalRes.ok) {
      throw new Error(uploadLocalJson?.error || `upload-local failed (${uploadLocalRes.status})`);
    }

    const fileUrls = Array.isArray(uploadLocalJson.urls) ? uploadLocalJson.urls : [];
    if (!fileUrls.length) {
      throw new Error("Upload succeeded but no file URL was returned.");
    }

    setUploadStatus("Starting term sheet processor...");
    const processRes = await fetch(apiUrl("/api/sp/termsheet/upload"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        client_id: Number(clientId),
        ticket_id: Number(ticketId),
        fileUrls,
      }),
    });
    const processJson = await processRes.json().catch(() => ({}));
    if (!processRes.ok) {
      throw new Error(processJson?.error || `processor failed (${processRes.status})`);
    }

    const taskId = processJson.task_id || processJson.taskId || "started";
    setUploadStatus(`Upload processed by demo backend. Task: ${taskId}. Lifecycle data refreshed.`);
    await hydrateProducts();
  } catch (error) {
    const message = error instanceof TypeError && String(error.message || "").toLowerCase().includes("fetch")
      ? `Could not reach the demo backend at ${getApiBase()}. Open this page from node server.js, or enter the demo backend URL above.`
      : (error.message || "Upload failed.");
    setUploadStatus(message, true);
  }
}

function openDetail(productId) {
  const product = activeProducts.find((item) => item.id === productId);
  if (!product) return;
  const detail = detailFor(product);
  const general = detail.generalInfo || {};
  const terms = detail.terms || [];
  const eventSummaries = detail.eventSummaries || [];

  state.selectedProductId = productId;
  document.getElementById("detailContent").innerHTML = `
    <div class="detail-topbar">
      <button class="secondary-button" type="button" data-back-to-lifecycle>← Back</button>
      <h1 id="detailTitle">${detail.title || "Lifecycle Detail"}</h1>
      <button class="delete-button" type="button">Delete</button>
    </div>

    <section class="detail-hero">
      <article class="panel general-card">
        <h2>General Info</h2>
        <div class="detail-kv"><span>Client</span><strong>${general.client || product.client}</strong></div>
        <div class="detail-kv"><span>Trade ID</span><strong>${general.tradeId || product.tradeOrderId}</strong></div>
        <div class="detail-kv"><span>ISIN</span><strong>${general.isin || product.isin}</strong></div>
        <div class="detail-kv"><span>Create Time</span><strong>${general.createTime || product.issueDate}</strong></div>
        <div class="detail-kv"><span>Status</span><strong><span class="status-pill ${statusClass(product.status)}">${product.status}</span></strong></div>
        <button class="primary-button upload-inline" type="button" data-view-button="uploadTermsheet">Upload termsheet</button>
      </article>
      <div class="event-summary-rail">
        ${eventSummaries.map(renderEventSummary).join("")}
      </div>
    </section>

    <section class="detail-main-grid">
      <div class="terms-column">
        ${terms.map(renderTermCard).join("")}
      </div>
      <section class="panel performance-detail-panel">
        <h2>Underlyings Performance</h2>
        ${renderPerformanceChart(product)}
        ${renderCashflows(detail)}
      </section>
    </section>
  `;
  setView("lifecycleDetail");
}

function backToLifecycle() {
  state.selectedProductId = null;
  setView("lifecycleList");
}

function renderAll() {
  renderSummary();
  renderBreakdown();
  renderEvents();
  renderMonitor();
  renderProducts();
  renderRfqOverview();
  if (state.view === "lifecycleDetail" && state.selectedProductId) {
    openDetail(state.selectedProductId);
  } else {
    setView(state.view, { skipHash: true });
  }
}

document.getElementById("breakdownMode").addEventListener("change", (event) => {
  state.breakdownMode = event.target.value;
  renderBreakdown();
});

document.getElementById("statusFilter").addEventListener("change", (event) => {
  state.status = event.target.value;
  renderProducts();
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

document.getElementById("termsheetUploadForm").addEventListener("submit", handleTermsheetUpload);

document.addEventListener("click", (event) => {
  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) {
    event.preventDefault();
    setView(viewLink.dataset.viewLink);
    return;
  }

  const viewButton = event.target.closest("[data-view-button]");
  if (viewButton) {
    setView(viewButton.dataset.viewButton);
    return;
  }

  if (event.target.closest("[data-back-to-lifecycle]")) {
    backToLifecycle();
    return;
  }

  const trigger = event.target.closest("[data-open-detail]");
  if (trigger) {
    openDetail(trigger.dataset.openDetail);
  }
});

window.addEventListener("hashchange", () => {
  const view = viewFromHash();
  if (view === "lifecycleDetail" && state.selectedProductId) {
    openDetail(state.selectedProductId);
  } else {
    setView(view, { skipHash: true });
  }
});

state.view = viewFromHash();
initializeBackendControls();
hydrateProducts();
