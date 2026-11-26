"""Server lokal untuk simulasi. Semua perhitungan memakai dijkstra.py.
Jalankan:  python server.py   (lalu buka http://127.0.0.1:8000)"""
import json
import os
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

import dijkstra as dj

BASE = os.path.dirname(os.path.abspath(__file__))
LOCS = dj.load_locations(os.path.join(BASE, "lokasi.txt"))
GRAPH = dj.load_graph(os.path.join(BASE, "weighted_graph_matrix.txt"))
INF = float("inf")

# File tampilan yang disajikan: path -> (nama file, content-type)
STATIC = {
    "/": ("index.html", "text/html"),
    "/index.html": ("index.html", "text/html"),
    "/style.css": ("style.css", "text/css"),
    "/app.js": ("app.js", "text/javascript"),
}

def clean(v):
    return None if v == INF else v

class Handler(BaseHTTPRequestHandler):
    def send(self, body, ctype="application/json", code=200):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path in STATIC:
            name, ctype = STATIC[u.path]
            with open(os.path.join(BASE, name), "rb") as f:
                self.send(f.read(), ctype)
        elif u.path == "/api/data":
            self.send({"locations": {str(k): v for k, v in LOCS.items()},
                       "graph": {str(k): {str(a): w for a, w in v.items()} for k, v in GRAPH.items()}})
        elif u.path == "/api/steps":
            try:
                start = int(parse_qs(u.query)["start"][0])
                assert start in GRAPH
            except Exception:
                return self.send({"error": "start tidak valid"}, code=400)
            steps = []
            for s in dj.dijkstra_steps(start, GRAPH, LOCS):
                s["dist"] = {k: clean(v) for k, v in s["dist"].items()}
                for r in s.get("relax", []):
                    r["old"] = clean(r["old"])
                steps.append(s)
            self.send(steps)
        else:
            self.send({"error": "tidak ditemukan"}, code=404)

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("Simulasi berjalan di http://127.0.0.1:8000  (Ctrl+C untuk berhenti)")
    webbrowser.open("http://127.0.0.1:8000")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
