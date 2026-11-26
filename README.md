Struktur:
- `public/`  : index.html, style.css, app.js (file statis)
- `api/`     : fungsi serverless Python (`data.py`, `steps.py`)
- `api/_data/`: lokasi.txt & weighted_graph_matrix.txt
- `api/_dijkstra.py`: algoritma Dijkstra (juga bisa dijalankan via CLI)

Deploy: push ke GitHub lalu Import di vercel.com (Framework Preset: Other),
atau jalankan `vercel` / `vercel --prod` dengan Vercel CLI.
Uji lokal: `vercel dev`.