import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from _lib import data_payload, to_bytes
    IMPORT_ERROR = None
except Exception:
    IMPORT_ERROR = traceback.format_exc()


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if IMPORT_ERROR:
            data = IMPORT_ERROR.encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
        else:
            data = to_bytes(data_payload())
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "public, s-maxage=3600")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
