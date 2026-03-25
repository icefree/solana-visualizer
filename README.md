# Solana CLI Visualizer 🚀

[English](#english) | [简体中文](#chinese)

<a name="english"></a>

## English

An intuitive visualization tool for Solana CLI interactions, designed to help developers and beginners understand core Solana concepts through animated simulations and real-time state tracking.

### 🌐 Live Demo

👉 **[View Live Demo: Solana CLI Visualizer](https://icefree.github.io/solana-visualizer/)**

---

### ✨ Key Features

- **CLI Simulation**: Real-time display of actual Solana CLI commands and outputs.
- **Dynamic State Tracking**: Synchronously visualizes wallet balance changes, token minting, transfers, and rent deductions.
- **Advanced Concepts**: Includes standard SPL Token and the latest **Token-2022 (Token Extensions)** metadata displays.
- **Auto Play & Interaction**: Supports step-by-step debugging or one-click auto-play of the full lifecycle.
- **Modern Interface**: Premium UI with glassmorphism effects and responsive design.

### 🛠️ Components Visualized

- **Local Wallet**: Simulates the current CLI system wallet.
- **Mint Account**: Covers vanity address generation ("wow..."), Mint authority, and Freeze authority.
- **ATA (Associated Token Account)**: Demonstrates Solana's unique token account model and rent logic.
- **Metadata**: Integrated on-chain metadata display based on Token-2022.

---

### 🚀 Quick Start

#### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/icefree/solana-visualizer.git
   cd solana-visualizer
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

#### Deployment

This project supports one-click deployment to GitHub Pages:

```bash
pnpm run deploy
```

---

<a name="chinese"></a>

## 简体中文

Solana 命令行交互可视化工具，旨在通过动画模拟和实时状态追踪，帮助开发者和初学者理解 Solana 的核心概念（如账户模型、ATA、Mint 权限、Token-2022 等）。

### 🌐 在线访问

👉 **[点击预览: Solana CLI Visualizer](https://icefree.github.io/solana-visualizer/)**

---

### ✨ 核心特性

- **终端模拟 (CLI Simulation)**: 实时展示真实的 Solana CLI 命令输入与输出。
- **动态状态可视化 (Live State Tracking)**: 同步展示钱包余额变化、代币铸造、转账过程及租金预扣。
- **高级概念展示**: 包含标准 SPL Token 以及最新的 **Token-2022 (Token Extensions)** 元数据展示。
- **自动播放与交互**: 支持单步调试或一键自动播放完整生命周期。
- **现代化界面**: 采用玻璃拟态 (Glassmorphism) 效果及响应式设计。

### 🛠️ 可见组件

- **Local Wallet**: 模拟当前的 CLI 系统钱包。
- **Mint Account**: 包含 "wow" 靓号地址生成、Mint 权限及 Freeze 权限展示。
- **ATA (Associated Token Account)**: 展示 Solana 独特的关联代币账户模型及租金逻辑。
- **Metadata**: 集成链上元数据展示（基于 Token-2022）。

---

## 📜 License

[MIT License](LICENSE)

---

### 🛡️ Recent Updates

- **UI Update**: Simplified ATA labels by changing "Owner (Authority)" to "Owner" for a cleaner interface.

---

_Created with ❤️ for the Solana Community._
