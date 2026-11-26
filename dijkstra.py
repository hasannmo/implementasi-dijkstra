import heapq
import os
import sys

def load_locations(filepath):
    locations = {}
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "|" not in line or line.startswith("Kode"):
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) == 3 and parts[0].isdigit():
                code = int(parts[0])
                name = parts[1]
                is_safe = parts[2].lower() == "true"
                locations[code] = {"name": name, "is_safe": is_safe}
    return locations

def load_graph(filepath):
    graph = {}
    with open(filepath, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    headers = [int(x) for x in lines[0].split()]
    for line in lines[1:]:
        parts = [int(x) for x in line.split()]
        node = parts[0]
        weights = parts[1:]
        graph[node] = {}
        for target, weight in zip(headers, weights):
            if weight > 0:
                graph[node][target] = weight
    return graph

def find_node(query, locations):
    query_str = query.strip()
    if query_str.isdigit():
        code = int(query_str)
        if code in locations:
            return code
        return None
    query_lower = query_str.lower()
    for code, info in locations.items():
        if info["name"].lower() == query_lower:
            return code
    for code, info in locations.items():
        if query_lower in info["name"].lower():
            return code
    return None

def dijkstra_steps(start, graph, locations):
    """Generator: menghasilkan snapshot tiap langkah Dijkstra (dipakai simulasi)."""
    distances = {node: float("inf") for node in graph}
    previous = {node: None for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    visited = set()

    def snap(kind, **extra):
        return {"type": kind, "dist": dict(distances), "prev": dict(previous),
                "visited": sorted(visited), "pq": sorted(pq), **extra}

    yield snap("init")
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        if current_dist > distances[current_node]:
            yield snap("stale", cur=current_node, popped=current_dist)
            continue
        if locations[current_node]["is_safe"]:
            path = []
            node = current_node
            while node is not None:
                path.append(node)
                node = previous[node]
            path.reverse()
            visited.add(current_node)
            yield snap("done", cur=current_node, popped=current_dist, path=path)
            return

        relax = []
        for neighbor, weight in graph[current_node].items():
            distance = current_dist + weight
            old = distances[neighbor]
            updated = distance < old
            if updated:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))
            relax.append({"to": neighbor, "w": weight, "nd": distance,
                          "old": old, "ok": updated})
        visited.add(current_node)
        yield snap("expand", cur=current_node, popped=current_dist, relax=relax)
    yield snap("fail")

def dijkstra_nearest_safe(start, graph, locations):
    last = None
    for last in dijkstra_steps(start, graph, locations):
        pass
    if last["type"] == "done":
        node = last["cur"]
        return node, last["dist"][node], last["path"]
    return None, float("inf"), []

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    locations = load_locations(os.path.join(base_dir, "lokasi.txt"))
    graph = load_graph(os.path.join(base_dir, "weighted_graph_matrix.txt"))

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = input("Masukkan nama atau nomor lokasi: ")

    start_node = find_node(query, locations)
    if start_node is None:
        print(f"Lokasi '{query}' tidak ditemukan.")
        sys.exit(1)

    target_node, total_dist, path = dijkstra_nearest_safe(start_node, graph, locations)
    if target_node is None:
        print("Tidak ada jalur menuju lokasi aman.")
        sys.exit(1)

    print(f"Asal: {start_node} - {locations[start_node]['name']}")
    print(f"Tujuan Aman Terdekat: {target_node} - {locations[target_node]['name']}")
    print(f"Total Jarak: {total_dist}")
    print("Rute: " + " -> ".join(f"{n} ({locations[n]['name']})" for n in path))


if __name__ == "__main__":
    main()
