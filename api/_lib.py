import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import _dijkstra as dj  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_data")
LOCS = dj.load_locations(os.path.join(DATA_DIR, "lokasi.txt"))
GRAPH = dj.load_graph(os.path.join(DATA_DIR, "weighted_graph_matrix.txt"))
INF = float("inf")


def clean(v):
    return None if v == INF else v


def data_payload():
    return {
        "locations": {str(k): v for k, v in LOCS.items()},
        "graph": {str(k): {str(a): w for a, w in v.items()} for k, v in GRAPH.items()},
    }


def steps_payload(start):
    steps = []
    for s in dj.dijkstra_steps(start, GRAPH, LOCS):
        s["dist"] = {k: clean(v) for k, v in s["dist"].items()}
        for r in s.get("relax", []):
            r["old"] = clean(r["old"])
        steps.append(s)
    return steps


def to_bytes(body):
    return json.dumps(body).encode("utf-8")
