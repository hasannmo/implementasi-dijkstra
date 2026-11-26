import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from _lib import GRAPH, steps_payload, to_bytes
    IMPORT_ERROR = None
except Exception:
    IMPORT_ERROR = traceback.format_exc()


class handler(BaseHTTPRequestHandler):
    def _send(self, data, code=200, ctype="application/json", cache=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        if cache:
            self.send_header("Cache-Control", cache)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if IMPORT_ERROR:
            return self._send(IMPORT_ERROR.encode("utf-8"), 500, "text/plain")
        query = parse_qs(urlparse(self.path).query)
        try:
            start = int(query["start"][0])
            assert start in GRAPH
        except Exception:
            return self._send(json.dumps({"error": "start tidak valid"}).encode(), 400)
        self._send(to_bytes(steps_payload(start)), cache="public, s-maxage=3600")
