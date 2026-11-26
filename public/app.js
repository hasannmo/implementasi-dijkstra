const NODE_RADIUS   = 18;
const DEFAULT_START = 1;
const SVG_NS        = "http://www.w3.org/2000/svg";
const SPEED_MS      = [0, 1800, 1300, 900, 550, 300];

const POS = {
   1: [217, 213],  2: [95, 134],  3: [189, 40],  4: [321, 115],  5: [276, 328],
   6: [425, 40],  7: [545, 192],  8: [653, 286],  9: [565, 334], 10: [524, 406],
  11: [439, 376], 12: [567, 512], 13: [753, 582], 14: [425, 277], 15: [327, 381],
  16: [378, 478], 17: [277, 533], 18: [47, 557]
};

let G = {};          
let LOC = {};       
let N = [];          
let steps = [];      
let idx = 0;         
let startNode = DEFAULT_START;
let timer = null;
const el = { edges: {}, nodes: {}, dist: {} };

const $      = id => document.getElementById(id);
const isSafe = n  => !!LOC[n][1];
const fmt    = d  => (d === null || d === Infinity) ? "∞" : d;
const nm     = n  => `<b>${n}</b> (${LOC[n][0]})`;

function svgEl(tag, attrs, parent = $("svg")) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}

async function loadData() {
  const d = await (await fetch("/api/data")).json();

  for (const k in d.locations) {
    LOC[+k] = [d.locations[k].name, d.locations[k].is_safe ? 1 : 0];
  }
  for (const k in d.graph) {
    G[+k] = {};
    for (const j in d.graph[k]) G[+k][+j] = d.graph[k][j];
  }
  N = Object.keys(G).map(Number).sort((a, b) => a - b);
}

async function loadSteps(start) {
  const raw = await (await fetch("/api/steps?start=" + start)).json();
  return raw.map(r => toStep(r, start));
}

function toStep(r, start) {
  const dist = {}, prev = {};
  for (const n of N) {
    dist[n] = r.dist[n] === null ? Infinity : r.dist[n];
    prev[n] = r.prev[n];
  }
  return {
    type:  r.type,
    cur:   r.cur,
    path:  r.path,
    relax: r.relax || [],
    pq:    r.pq,
    vis:   new Set(r.visited),
    dist, prev,
    text:  stepText(r, start, dist)
  };
}

function stepText(r, start, dist) {
  const u = r.cur, d = r.popped, rel = r.relax || [];

  switch (r.type) {
    case "init":
      return `<b>Inisialisasi:</b><br>Jarak semua simpul = ∞ , kecuali asal yaitu ${nm(start)} = 0`;
    case "stale":
      return `Ambil (${d}, ${u}) dari Antrean<br><br>Jarak ini <b>basi</b> ` +
             `(jarak terbaik ${u} sudah ${dist[u]}), jadi dilewati.`;
    case "done":
      return `Ambil (${d}, ${u}) dari Antrean<br><br>${nm(u)} adalah <b>lokasi aman</b>. `;
    case "expand": {
      const lines = rel.map(x => {
        const hasil = x.ok
          ? `&lt; ${fmt(x.old)}, <b>nilai diperbarui</b>`
          : `≥ ${fmt(x.old)}, dilewati`;
        return `${u}→${x.to}: ${d}+${x.w}=${x.nd} ${hasil}`;
      });
      return `Ambil (${d}, ${u}) dari Antrean<br><br>${nm(u)}, bukan lokasi aman.<br> ` +
             `Periksa semua tetangganya:<br>${lines.join("<br>")}`;
    }
    default:
      return "Antrean kosong: tidak ada jalur menuju lokasi aman.";
  }
}

function buildGraph() {
  const svg = $("svg");
  svg.innerHTML =
    `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
       <path d="M0 0L10 5L0 10z" fill="var(--edge)"/></marker></defs>`;
  el.edges = {};

  for (const a of N) for (const b of N) {
    const w = G[a][b];
    if (!w) continue;

    const dua = !!G[b][a];                 
    if (dua && a > b) continue;             

    const [x1, y1] = POS[a], [x2, y2] = POS[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const ujung = dua ? NODE_RADIUS + 2 : NODE_RADIUS + 4;  

    const line = svgEl("line", {
      class: "edge",
      x1: x1 + dx / len * (NODE_RADIUS + 2),
      y1: y1 + dy / len * (NODE_RADIUS + 2),
      x2: x2 - dx / len * ujung,
      y2: y2 - dy / len * ujung,
      ...(dua ? {} : { "marker-end": "url(#ar)" })
    });
    el.edges[`${a}-${b}`] = line;
    if (dua) el.edges[`${b}-${a}`] = line;

    const label = svgEl("text", {
      class: "w", x: (x1 + x2) / 2, y: (y1 + y2) / 2 + 4, "text-anchor": "middle"
    });
    label.textContent = w;
  }

  el.nodes = {};
  el.dist = {};
  for (const n of N) {
    const [x, y] = POS[n];
    const g = svgEl("g", { class: "n" });

    const c = svgEl("circle", {
      cx: x, cy: y, r: NODE_RADIUS, fill: "var(--vis)",
      stroke: isSafe(n) ? "var(--safe)" : "var(--edge)"
    }, g);
    svgEl("title", {}, c).textContent = `${n} - ${LOC[n][0]}${isSafe(n) ? " (aman)" : ""}`;

    svgEl("text", { x, y }, g).textContent = n;
    el.nodes[n] = c;
    el.dist[n] = svgEl("text", { class: "dl", x, y: y - 26 });
  }
}

function nodeColor(n, s) {
  if (n === s.cur) return s.type === "done" ? "var(--safe)" : "var(--cur)";
  if (n === startNode) return "var(--acc)";
  if (isSafe(n) && s.dist[n] < Infinity) return "var(--safe)";
  if (s.vis.has(n)) return "var(--vis)";
  if (s.dist[n] < Infinity) return "var(--acc)";
  return "var(--bd)";
}

function renderGraph(s) {
  for (const k in el.edges) el.edges[k].setAttribute("class", "edge");

  if (s.type === "expand") {
    s.relax.filter(r => r.ok)
           .forEach(r => el.edges[`${s.cur}-${r.to}`]?.setAttribute("class", "edge rx"));
  }
  const path = s.path || [];
  for (let k = 0; k < path.length - 1; k++) {
    el.edges[`${path[k]}-${path[k + 1]}`]?.setAttribute("class", "edge on");
  }
  for (const n of N) {
    el.nodes[n].setAttribute("fill", nodeColor(n, s));
    el.dist[n].textContent = s.dist[n] < Infinity ? s.dist[n] : "";
  }
}

function renderQueue(s) {
  $("pq").innerHTML = s.pq.length
    ? s.pq.map((x, k) => `<span class="chip ${k ? "" : "top"}">(${x[0]}, ${x[1]})</span>`).join("")
    : `<span class="empty">Kosong</span>`;
}

function renderTable(s) {
  const rows = N.map(n => `
    <tr class="${n === s.cur ? "cur" : ""}">
      <td>${n}</td>
      <td>${LOC[n][0]}</td>
      <td>${fmt(s.dist[n])}</td>
      <td>${s.prev[n] ?? "-"}</td>
    </tr>`).join("");
  $("tb").innerHTML = `<tr><th>Simpul</th><th>Lokasi</th><th>Jarak</th><th>Dari</th></tr>${rows}`;
}

function renderResult(s) {
  if (s.type === "done") {
    $("res").innerHTML =
      `Tujuan Aman: ${LOC[s.cur][0]}<br>` +
      `Total Jarak: ${s.dist[s.cur]} m<br>` +
      `Rute: ${s.path.map(n => LOC[n][0]).join(" -> ")}`;
  } else {
    $("res").textContent = s.type === "fail" ? "Tidak ada jalur menuju lokasi aman." : "";
  }
}

function render() {
  const s = steps[idx];
  $("cnt").textContent = `Langkah ${idx} / ${steps.length - 1}`;
  $("msg").innerHTML = s.text;

  renderGraph(s);
  renderQueue(s);
  renderTable(s);
  renderResult(s);

  $("prev").disabled = idx === 0;
  $("next").disabled = idx === steps.length - 1;
  if (idx === steps.length - 1) stopPlay();
}

function go(delta) {
  idx = Math.max(0, Math.min(steps.length - 1, idx + delta));
  render();
}

function stopPlay() {
  clearInterval(timer);
  timer = null;
  $("play").textContent = "▶ Putar";
}

function startPlay() {
  if (idx === steps.length - 1) idx = 0;
  $("play").textContent = "⏸ Jeda";
  timer = setInterval(() => go(1), SPEED_MS[$("spd").value]);
}

async function restart() {
  stopPlay();
  startNode = +$("start").value;
  steps = await loadSteps(startNode);
  idx = 0;
  render();
}

function bindControls() {
  $("start").onchange = restart;
  $("reset").onclick  = restart;
  $("next").onclick   = () => { stopPlay(); go(1); };
  $("prev").onclick   = () => { stopPlay(); go(-1); };
  $("play").onclick   = () => timer ? stopPlay() : startPlay();
  $("spd").oninput    = () => { if (timer) { stopPlay(); startPlay(); } };
}

async function boot() {
  bindControls();

  try {
    await loadData();
  } catch (e) {
    $("msg").innerHTML =
      "<b>Gagal memuat data dari API.</b> Periksa koneksi, lalu muat ulang halaman. " +
      "Jika dijalankan lokal, gunakan <code>vercel dev</code>.";
    return;
  }

  $("start").innerHTML = N.map(n =>
    `<option value="${n}">${n} - ${LOC[n][0]}${isSafe(n) ? " (aman)" : ""}</option>`).join("");
  $("start").value = DEFAULT_START;

  buildGraph();
  restart();
}

boot();
