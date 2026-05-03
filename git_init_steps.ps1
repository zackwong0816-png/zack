# Run these commands in PowerShell:

git init
git remote add origin https://github.com/zackwong0816-png/zack.git
git remote -v

# Then check if git-remote-https works:
git fetch origin main 2>&1

# If fetch fails (remote-https broken), try SSH:
# git remote set-url origin git@github.com:zackwong0816-png/zack.git
# git fetch origin main 2>&1