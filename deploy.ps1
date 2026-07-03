# ============================================================
#  Revision Notes - Deploy (Local Wins)
#  WARNING: Overwrites remote branch with this folder's state.
#  Place this file in the downloaded/extracted repo folder.
# ============================================================

$REPO_PATH  = Split-Path -Parent $MyInvocation.MyCommand.Path
$BRANCH     = 'main'
$REMOTE_URL = 'https://github.com/jass666/Revision_notes.git'

Write-Host ""
Write-Host " ====================================================="
Write-Host "  Revision Notes  |  Force Deploy to GitHub"
Write-Host " ====================================================="
Write-Host ""
Write-Host " [INFO]  Repo  : $REPO_PATH"
Write-Host " [INFO]  Remote: $REMOTE_URL"
Write-Host " [INFO]  Branch: $BRANCH"
Write-Host ""
Write-Host " [WARN]  Local files will become the GitHub branch state."
Write-Host " [WARN]  This is a force push. Remote-only changes can be overwritten."
Write-Host ""
Write-Host " Press ENTER to start deployment, or type anything and press ENTER to abort."
$confirm = Read-Host " >"
if ($confirm -ne "") {
    Write-Host ""
    Write-Host " [INFO]  Aborted. Nothing was changed."
    Write-Host ""
    Read-Host " Press Enter to exit"
    exit 0
}
Write-Host ""

# -- STEP 1: Verify repo path --------------------------------------------------
Write-Host " [STEP 1/6]  Verifying repo path..."
if (-not (Test-Path $REPO_PATH)) {
    Write-Host " [ERROR] Repo path not found: $REPO_PATH"
    Read-Host " Press Enter to exit"
    exit 1
}
Set-Location $REPO_PATH
Write-Host " [OK]    Repo found at $REPO_PATH"
Write-Host ""

# -- STEP 2: Initialize or verify Git repo ------------------------------------
Write-Host " [STEP 2/6]  Verifying Git repository..."
git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host " [INFO]  Git repo not initialized. Running git init..."
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [ERROR] git init failed."
        Read-Host " Press Enter to exit"
        exit 1
    }
}
Write-Host " [OK]    Git repo confirmed."
Write-Host ""

# -- STEP 3: Configure branch and remote --------------------------------------
Write-Host " [STEP 3/6]  Configuring branch and remote..."
git checkout -B $BRANCH
if ($LASTEXITCODE -ne 0) {
    Write-Host " [ERROR] Could not switch to branch: $BRANCH"
    Read-Host " Press Enter to exit"
    exit 1
}

$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    if ($existingRemote -ne $REMOTE_URL) {
        Write-Host " [INFO]  Updating origin remote."
        Write-Host " [INFO]  Old: $existingRemote"
        Write-Host " [INFO]  New: $REMOTE_URL"
        git remote set-url origin $REMOTE_URL
    }
} else {
    Write-Host " [INFO]  Adding origin remote."
    git remote add origin $REMOTE_URL
}
if ($LASTEXITCODE -ne 0) {
    Write-Host " [ERROR] Could not configure origin remote."
    Read-Host " Press Enter to exit"
    exit 1
}
Write-Host " [OK]    Branch and remote configured."
Write-Host ""

# -- STEP 4: Show local changes ------------------------------------------------
Write-Host " [STEP 4/6]  Checking local files..."
Write-Host ""
$changed = git status --short
$fileCount = 0
foreach ($line in $changed) {
    Write-Host " [FILE]  $line"
    $fileCount++
}
if ($fileCount -eq 0) {
    Write-Host " [INFO]  No local file changes detected."
}
Write-Host ""

# -- STEP 5: Stage and commit --------------------------------------------------
Write-Host " [STEP 5/6]  Staging and committing local files..."
Write-Host ""

git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host " [ERROR] git add failed."
    Read-Host " Press Enter to exit"
    exit 1
}

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host " [INFO]  Nothing new to commit."
} else {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "Deploy revision notes $date"

    Write-Host " [GIT]   Committing: $commitMsg"
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        Write-Host " [ERROR] Commit failed."
        Read-Host " Press Enter to exit"
        exit 1
    }

    $newHash = git log -1 --pretty=format:%h
    $newMsg = git log -1 --pretty=format:%s
    Write-Host " [OK]    New HEAD: $newHash - $newMsg"
}
Write-Host ""

# -- STEP 6: Force push --------------------------------------------------------
Write-Host " [STEP 6/6]  Force pushing to origin/$BRANCH..."
git push -u origin $BRANCH --force
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host " [ERROR] Force push failed. Possible reasons:"
    Write-Host "         - No internet connection"
    Write-Host "         - GitHub authentication is not configured"
    Write-Host "         - Branch is protected on remote"
    Write-Host ""
    Write-Host "         Remote: $REMOTE_URL"
    Read-Host " Press Enter to exit"
    exit 1
}

$finalHash = git log -1 --pretty=format:%h
Write-Host " [OK]    GitHub is now at: $finalHash"
Write-Host ""

Write-Host " ====================================================="
Write-Host "  SUCCESS  |  Push complete"
Write-Host "  Commit  : $finalHash"
Write-Host "  Branch  : $BRANCH"
Write-Host "  Repo    : $REMOTE_URL"
Write-Host " ====================================================="
Write-Host ""
Read-Host " Press Enter to exit"
