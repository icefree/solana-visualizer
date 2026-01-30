# Solana CLI Visualizer 🚀

一个直观的 Solana 命令行交互可视化工具，旨在通过动画模拟和实时状态追踪，帮助开发者和初学者理解 Solana 的核心概念（如账户模型、ATA、Mint 权限、Token-2022 等）。

## 🌐 在线访问

👉 **[点击预览: Solana CLI Visualizer](https://icefree.github.io/solana-visualizer/)**

---

## ✨ 核心特性

- **终端模拟 (CLI Simulation)**: 实时展示真实的 Solana CLI 命令输入与输出。
- **动态状态可视化 (Live State Tracking)**: 同步展示钱包余额变化、代币铸造、转账过程及租金预扣。
- **高级概念展示**: 包含标准 SPL Token 以及最新的 **Token-2022 (Token Extensions)** 元数据展示。
- **自动播放与交互**: 支持单步调试或一键自动播放完整生命周期。
- **全中文交互界面**: 友好的中文说明与交互反馈。

## 🛠️ 可见组件

- **Local Wallet**: 模拟当前的 CLI 系统钱包。
- **Mint Account**: 包含 "wow" 靓号地址生成、Mint 权限及 Freeze 权限展示。
- **ATA (Associated Token Account)**: 展示 Solana 独特的关联代币账户模型及租金逻辑。
- **Metadata**: 集成链上元数据展示（基于 Token-2022）。

---

## 🚀 快速开始

### 本地开发

1. **克隆仓库**

   ```bash
   git clone https://github.com/icefree/solana-visualizer.git
   cd solana-visualizer
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   ```

### 部署

本项目支持一键部署到 GitHub Pages：

```bash
pnpm run deploy
```

---

## 📜 许可证

[MIT License](LICENSE)

---

_Created with ❤️ for the Solana Community._
