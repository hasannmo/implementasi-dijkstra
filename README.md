# Simulasi Dijkstra: Rute Evakuasi ITS

Implementasi algoritma **Dijkstra** untuk mencari rute evakuasi terpendek menuju lokasi aman terdekat di lingkungan kampus ITS (Institut Teknologi Sepuluh Nopember). Proyek ini menyediakan antarmuka **CLI** maupun **simulasi web interaktif** langkah demi langkah tanpa dependensi eksternal (hanya menggunakan Python Standard Library dan vanilla HTML/CSS/JS).

## Fitur

- **Pencarian Lokasi Aman Terdekat**: Menghitung jarak terpendek dari titik asal ke simpul pertama yang berstatus aman (`isSafe = true`) menggunakan priority queue (`heapq`).
- **Simulasi Web Interaktif**:
  - Visualisasi graf lokasi kampus secara real-time menggunakan SVG.
  - Kontrol langkah demi langkah (*Langkah Berikutnya*, *Mundur*, *Putar* otomatis dengan pengatur kecepatan, dan *Reset*).
  - Tampilan langsung **Antrean Prioritas (Priority Queue)** dan **Tabel Jarak** pada setiap iterasi.
- **Mode CLI**: Dapat dijalankan langsung dari terminal dengan memasukkan nomor kode atau nama lokasi.

## Struktur Proyek

```text
implementasi-dijkstra/
├── dijkstra.py                 # Implementasi algoritma Dijkstra & CLI
├── server.py                   # Server HTTP lokal & API untuk simulasi web
├── index.html                  # Halaman utama simulasi web
├── app.js                      # Logika visualisasi graf SVG & kontrol langkah
├── style.css                   # Styling antarmuka web
├── lokasi.txt                  # Daftar kode, nama lokasi, dan status aman (isSafe)
└── weighted_graph_matrix.txt   # Matriks ketetanggaan berbobot antar lokasi
```

## Prasyarat

- **Python 3.x** (tidak memerlukan instalasi paket pihak ketiga).
- Browser modern (untuk menjalankan simulasi web).

## Cara Menjalankan Secara Lokal

### 1. Simulasi Web Interaktif

Jalankan server lokal dengan perintah:

```bash
python server.py
```

Server akan berjalan di `http://127.0.0.1:8000` dan otomatis membuka browser default Anda. Jika tidak terbuka otomatis, kunjungi alamat tersebut secara manual. Tekan `Ctrl+C` di terminal untuk menghentikan server.

### 2. Mode CLI (Terminal)

Anda dapat menjalankan `dijkstra.py` dengan memberikan argumen nama atau nomor lokasi:

```bash
python dijkstra.py "Teknik Informatika"
# atau menggunakan kode lokasi
python dijkstra.py 1
```

Atau jalankan tanpa argumen untuk memasukkan lokasi secara interaktif:

```bash
python dijkstra.py
```

## Endpoint API Lokal

`server.py` menyediakan dua endpoint JSON yang digunakan oleh frontend:

- `GET /api/data` — Mengembalikan daftar lokasi (`locations`) dan graf berbobot (`graph`).
- `GET /api/steps?start=<kode>` — Mengembalikan seluruh tahapan eksekusi algoritma Dijkstra dari simpul `start`.

## Format Data

- **`lokasi.txt`**: Berisi daftar simpul dengan format `Kode | Nama | isSafe`. Lokasi dengan `isSafe = true` (seperti *Sirkuit ITS*, *Stadion ITS*, dan *Taman Alumni*) menjadi target tujuan evakuasi.
- **`weighted_graph_matrix.txt`**: Matriks ketetanggaan berbobot (*adjacency matrix*). Nilai `0` berarti tidak ada jalur langsung antar kedua lokasi.
