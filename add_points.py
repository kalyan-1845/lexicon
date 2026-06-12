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
    has_level = any(l.startswith("level-") for l in labels)
    is_nsoc = any(l == "nsoc26" or l == "nsoc:approved" for l in labels)
    
    # If it's an NSoC PR but lacks a level, let's give it level-2 (5 points)
    if is_nsoc and not has_level:
        print(f"Adding level-2 (5 points) to PR #{num} so it counts on the NSoC Dashboard...")
        subprocess.run(["gh", "pr", "edit", str(num), "--add-label", "level-2"])
        time.sleep(1)

print("Done updating PR point labels!")
