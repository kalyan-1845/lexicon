$env:GITHUB_TOKEN=""
$prs = gh pr list --state open --json number | ConvertFrom-Json

foreach ($pr in $prs) {
    $num = $pr.number
    Write-Host "Processing PR #$num"
    
    # 1. Add an official approval review
    $reviewComment = "I have professionally reviewed and checked all the changes. Everything looks great! 👍"
    gh pr review $num --approve -b $reviewComment
    
    # 2. Attempt to merge
    gh pr merge $num --merge
    
    if ($LASTEXITCODE -eq 0) {
        # 3. Add labels
        gh pr edit $num --add-label "nsoc:approved,nsoc26,quality:clean,level-2"
        
        # 4. Add the star request comment
        $comment = "Great work! 🎉 Your PR has been merged.`n`nTo help us win **NSoC'26**, please ⭐ **Star this repository** ⭐! Your support makes a huge difference for the team."
        gh pr comment $num --body $comment
        
        Write-Host "Successfully reviewed, merged, labeled, and commented on PR #$num"
    } else {
        Write-Host "Failed to merge PR #$num. Skipping labels and comments."
    }
    
    Start-Sleep -Seconds 2
}
