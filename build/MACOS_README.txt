Lumis 使用说明
==============

【安装步骤】
1. 将 Lumis 拖拽到 Applications 文件夹

【Python 环境要求】
本应用需要 Python 3.8+ 才能运行视频处理功能。

安装 Python 的方法：

方法一 - Homebrew（推荐）：
  brew install python@3.11

方法二 - 官方安装包：
  访问 https://www.python.org/downloads/ 下载

方法三 - pyenv：
  brew install pyenv
  pyenv install 3.11.7
  pyenv global 3.11.7

【首次启动】
由于应用未使用 Apple Developer 证书签名，首次打开可能被阻止。

【一键解决】
复制以下命令到终端并回车：

xattr -cr /Applications/Lumis.app && open /Applications/Lumis.app

【其他方法】
右键点击应用 > 选择"打开" > 点击"打开"确认

或：系统设置 > 隐私与安全性 > 点击"仍要打开"

【更多帮助】
GitHub: https://github.com/indulgeback/lumis
