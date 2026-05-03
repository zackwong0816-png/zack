# 临时修复 git-remote-https
# 在 PowerShell 中运行以下命令检查 git 版本

git version

# 如果版本 >= 2.36，用这个命令修复：
git config --global http.https://github.com.proxy ""

# 或者如果上面的不行，试试：
git clone --depth 1 https://github.com/zackwong0816-png/zack.git D:\temp_git_push_test 2>&1
