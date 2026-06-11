import os
import json
import subprocess
import time

if "GITHUB_TOKEN" in os.environ:
    del os.environ["GITHUB_TOKEN"]

print("Fetching merged PRs...")
result = subprocess.run(
    ["gh", "pr", "list", "--state", "merged", "--limit", "100", "--json", "number,labels"],
    capture_output=True, text=True
)
prs = json.loads(result.stdout)

for pr in prs:
    num = pr['number']
    labels = [label['name'] for label in pr.get('labels', [])]
    
    # Check if PR lacks a point-value label
    has_level = any(l.startswith("level:") for l in labels)
    is_gssoc = any(l == "gssoc:approved" for l in labels)
    
    # If it's a GSSoC PR but lacks a level, let's give it level:intermediate
    if is_gssoc and not has_level:
        print(f"Adding level:intermediate to PR #{num} so it counts on the GSSoC Dashboard...")
        subprocess.run(["gh", "pr", "edit", str(num), "--add-label", "level:intermediate"])
        time.sleep(1)

print("Done updating PR point labels!")
