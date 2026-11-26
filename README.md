# Simulasi Dijkstra: Rute Evakuasi ITS

Implementasi algoritma **Dijkstra** untuk mencari rute evakuasi terpendek menuju lokasi aman terdekat di lingkungan kampus ITS (Institut Teknologi Sepuluh Nopember). Proyek ini hadir sebagai **aplikasi web interaktif** (dideploy dengan **Vercel** menggunakan Python Serverless Functions dan frontend statis) serta dapat dijalankan sebagai **CLI**.

## Fitur

- **Pencarian Lokasi Aman Terdekat**: Menghitung jarak terpendek dari titik asal ke simpul pertama yang berstatus aman (`isSafe = true`) menggunakan priority queue (`heapq`).
- **Simulasi Web Interaktif**:
  - Visualisasi graf lokasi kampus secara real-time menggunakan SVG.
  - Kontrol langkah demi langkah (*Langkah Berikutnya*, *Mundur*, *Putar* otomatis dengan pengatur kecepatan, dan *Reset*).
  - Tampilan langsung **Antrean Prioritas (Priority Queue)** dan **Tabel Jarak** pada setiap iterasi.
- **Mode CLI**: Dapat dijalankan langsung dari terminal melalui `api/_dijkstra.py`.

## Struktur Proyek

```text
implementasi-dijkstra/
├── api/
│   ├── _data/
│   │   ├── lokasi.txt                  # Daftar kode, nama lokasi, dan status aman (isSafe)
│   │   └── weighted_graph_matrix.txt   # Matriks ketetanggaan berbobot antar lokasi
│   ├── _dijkstra.py                    # Implementasi algoritma Dijkstra & CLI
│   ├── _lib.py                         # Helper pemuatan data & payload JSON
│   ├── data.py                         # Serverless endpoint GET /api/data
│   └── steps.py                        # Serverless endpoint GET /api/steps
├── public/
│   ├── index.html                      # Halaman utama simulasi web
│   ├── app.js                          # Logika visualisasi graf SVG & kontrol langkah
│   └── style.css                       # Styling antarmuka web
├── vercel.json                         # Konfigurasi Vercel Functions
└── README.md
```

## Prasyarat

- **Python 3.x** (hanya menggunakan Python Standard Library, tanpa dependensi eksternal).
- **Vercel CLI** (`npm i -g vercel`) untuk menjalankan simulasi web beserta API secara lokal.

## Cara Menjalankan Secara Lokal

### 1. Simulasi Web (Vercel Dev)

Jalankan server pengembangan lokal menggunakan Vercel CLI dari root proyek:

```bash
vercel dev
```

Kemudian buka alamat lokal yang ditampilkan di terminal (biasanya `http://localhost:3000`).

### 2. Mode CLI (Terminal)

Anda dapat menjalankan `api/_dijkstra.py` secara langsung dari terminal (tanpa perlu server web):

```bash
python api/_dijkstra.py "Teknik Informatika"
# atau menggunakan kode lokasi
python api/_dijkstra.py 1
```

Atau jalankan tanpa argumen untuk memasukkan nama/kode lokasi secara interaktif:

```bash
python api/_dijkstra.py
```

## Endpoint API

- `GET /api/data` — Mengembalikan daftar lokasi (`locations`) dan graf berbobot (`graph`).
- `GET /api/steps?start=<kode>` — Mengembalikan seluruh tahapan eksekusi algoritma Dijkstra dari simpul `start`.

## Format Data

- **`api/_data/lokasi.txt`**: Berisi daftar simpul dengan format `Kode | Nama | isSafe`. Lokasi dengan `isSafe = true` (seperti *Sirkuit ITS*, *Stadion ITS*, dan *Taman Alumni*) menjadi target tujuan evakuasi.
- **`api/_data/weighted_graph_matrix.txt`**: Matriks ketetanggaan berbobot (*adjacency matrix*). Nilai `0` berarti tidak ada jalur langsung antar kedua lokasi.
