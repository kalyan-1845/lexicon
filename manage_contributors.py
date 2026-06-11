import json
import subprocess
import os

if "GITHUB_TOKEN" in os.environ:
    del os.environ["GITHUB_TOKEN"]

# 1. Get all PR authors
print("Fetching PRs...")
pr_result = subprocess.run(
    ["gh", "pr", "list", "--state", "all", "--limit", "100", "--json", "number,author"],
    capture_output=True, text=True, encoding='utf-8'
)
prs = json.loads(pr_result.stdout)

# 2. Get all Issues (with comments)
print("Fetching Issues...")
issue_result = subprocess.run(
    ["gh", "issue", "list", "--state", "all", "--limit", "100", "--json", "number,author,assignees,comments,title"],
    capture_output=True, text=True, encoding='utf-8'
)
issues = json.loads(issue_result.stdout)

contributors = set()
pr_by_author = {}
for pr in prs:
    if pr.get('author') and not pr['author'].get('is_bot'):
        author = pr['author']['login']
        if author != "kalyan-1845":
            contributors.add(author)
            pr_by_author[author] = pr['number']

issue_by_author = {}
unassigned_issues = []
for issue in issues:
    num = issue['number']
    if not issue.get('assignees'):
        if issue['title'] != 'test': # just in case
            unassigned_issues.append(num)

    if issue.get('author') and not issue['author'].get('is_bot'):
        author = issue['author']['login']
        if author != "kalyan-1845":
            contributors.add(author)
            issue_by_author[author] = num
            
    for assignee in issue.get('assignees', []):
        login = assignee['login']
        if login != "kalyan-1845":
            contributors.add(login)
            issue_by_author[login] = num

# Find users who want more issues
users_wanting_issues = set()
for issue in issues:
    for comment in issue.get('comments', []):
        body = comment['body'].lower()
        if "more issue" in body or "need more" in body or "work issue" in body or "assign" in body:
            author = comment['author']['login']
            if author != "kalyan-1845" and not comment['author'].get('is_bot'):
                users_wanting_issues.add(author)

# Messaging logic
print(f"Contributors: {contributors}")
print(f"Unassigned issues count: {len(unassigned_issues)}")
print(f"Users wanting issues: {users_wanting_issues}")

leaderboard_msg = "Hi @{user} 🚀! Just a quick heads-up: to climb to the top of the NSoC leaderboard, be sure to take on and complete more issues faster! Let us know if you need any guidance."

# Message all contributors
for user in contributors:
    # Find an issue or PR to comment on
    target_num = pr_by_author.get(user) or issue_by_author.get(user)
    if target_num:
        print(f"Messaging @{user} about leaderboard on #{target_num}...")
        subprocess.run(["gh", "issue", "comment", str(target_num), "--body", leaderboard_msg.format(user=user)])
    else:
        print(f"Could not find an issue or PR for @{user}")

# Assign issues to users who asked
for user in users_wanting_issues:
    if unassigned_issues:
        issue_to_assign = unassigned_issues.pop(0)
        print(f"Assigning issue #{issue_to_assign} to @{user}...")
        
        # Add assignee
        subprocess.run(["gh", "issue", "edit", str(issue_to_assign), "--add-assignee", user])
        
        # Comment
        assign_msg = f"Hi @{user}! Since you asked for more work, I have assigned this issue to you. Good luck and let us know if you have any questions! 🚀"
        subprocess.run(["gh", "issue", "comment", str(issue_to_assign), "--body", assign_msg])

print("All tasks completed.")
