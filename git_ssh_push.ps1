# Run these commands in PowerShell to push via SSH:

git remote set-url origin git@github.com:zackwong0816-png/zack.git
git config core.sshCommand "ssh -i $HOME/.ssh/id_rsa"
git add -A
git commit -m "Upload source files with UTF-8 encoding"
git push origin main 2>&1