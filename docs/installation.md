---
title: Install Node.js & npm
description: Complete guide to installing Node.js and npm for WireFluid smart contract development
---

# Install Node.js & npm

Before you can develop smart contracts on WireFluid using professional tools like Hardhat, you need to install **Node.js** and **npm** (Node Package Manager).

> **ℹ️ Quick Info**  
> **Time Required:** ~5-10 minutes  
> **Difficulty:** Beginner  
> **What You'll Install:** Node.js v18 or higher and npm (included with Node.js)

---

## What is Node.js?

**Node.js** is a JavaScript runtime that allows you to run JavaScript code outside of a web browser. It's essential for:

- Running development tools like Hardhat and Foundry
- Installing and managing smart contract libraries
- Compiling and deploying contracts from the command line
- Running automated tests for your contracts

**npm** (Node Package Manager) comes bundled with Node.js and is used to install JavaScript packages and dependencies.

---

## System Requirements

Before installing, ensure your system meets these requirements:

| Requirement             | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| **Operating System**    | macOS, Windows 10/11, or Linux (Ubuntu, Debian, Fedora) |
| **Disk Space**          | At least 500 MB of free disk space                      |
| **RAM**                 | Minimum 4 GB (8 GB recommended)                         |
| **Internet Connection** | Required for downloading packages                       |

---

## Check if Node.js is Already Installed

Before installing, check if Node.js is already on your system:

### Step 1: Open your terminal

- **macOS:** Press `Cmd + Space`, type "Terminal", and press Enter
- **Windows:** Press `Win + R`, type "cmd", and press Enter
- **Linux:** Press `Ctrl + Alt + T`

### Step 2: Check Node.js version

```bash
node --version
```

### Step 3: Check npm version

```bash
npm --version
```

**If you see version numbers:**

- Node.js version should be **v18.0.0 or higher**
- npm version should be **9.0.0 or higher**

If your versions are lower, follow the installation steps below to update.

> **⚠️ Warning**  
> **Node.js v16 and below are no longer supported.** Make sure to install v18 or higher for compatibility with modern development tools.

---

## Installation Instructions

Choose your operating system:

### macOS

<details>
<summary><strong>Click to expand macOS instructions</strong></summary>

There are two recommended methods for installing Node.js on macOS:

#### Method 1: Using Homebrew (Recommended)

**Homebrew** is a package manager for macOS that makes installing software easy.

**Step 1: Install Homebrew (if not already installed)**

Open Terminal and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions. You may need to enter your password.

**Step 2: Install Node.js**

```bash
brew install node@20
```

This installs Node.js version 20 (LTS - Long Term Support).

**Step 3: Verify installation**

```bash
node --version
npm --version
```

You should see:

```
v20.x.x
10.x.x
```

#### Method 2: Using Official Installer

**Step 1: Download the installer**

Visit [nodejs.org](https://nodejs.org/) and download the **LTS (Long Term Support)** version for macOS.

**Step 2: Run the installer**

1. Open the downloaded `.pkg` file
2. Follow the installation wizard
3. Click "Continue" through all steps
4. Enter your password when prompted
5. Click "Install"

**Step 3: Verify installation**

Open Terminal and run:

```bash
node --version
npm --version
```

> **💡 Tip:** If the commands are not recognized, close and reopen your Terminal to refresh the environment variables.

#### Updating Node.js on macOS

If you installed via Homebrew:

```bash
brew upgrade node
```

If you used the official installer, download and run the latest installer from nodejs.org.

</details>

---

### Windows

<details>
<summary><strong>Click to expand Windows instructions</strong></summary>

**Step 1: Download the installer**

Visit [nodejs.org](https://nodejs.org/) and download the **LTS (Long Term Support)** version for Windows.

Choose the **Windows Installer (.msi)** for your system:

- **64-bit** (most common)
- **32-bit** (older systems)

**Step 2: Run the installer**

1. Double-click the downloaded `.msi` file
2. Click "Next" on the welcome screen
3. Accept the license agreement
4. Choose the installation location (default is fine)
5. Keep all default features selected (especially "Add to PATH")
6. Click "Install"
7. Wait for installation to complete
8. Click "Finish"

**Step 3: Verify installation**

Open **Command Prompt** (press `Win + R`, type `cmd`, press Enter) and run:

```bash
node --version
npm --version
```

You should see:

```
v20.x.x
10.x.x
```

> **⚠️ Important:** Make sure "Add to PATH" is checked during installation. This allows you to run `node` and `npm` commands from any directory.

#### Alternative: Using Windows Package Manager (winget)

If you have Windows 10/11 with winget:

```bash
winget install OpenJS.NodeJS.LTS
```

#### Updating Node.js on Windows

Download and run the latest installer from nodejs.org. The new version will automatically replace the old one.

#### Troubleshooting Windows Installation

**Command not found error:**

1. Close and reopen Command Prompt
2. If still not working, add Node.js to PATH manually:
   - Search "Environment Variables" in Windows
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Add: `C:\Program Files\nodejs\`

</details>

---

### Linux

<details>
<summary><strong>Click to expand Linux instructions</strong></summary>

#### Ubuntu / Debian

**Step 1: Update package index**

```bash
sudo apt update
```

**Step 2: Install Node.js from NodeSource**

NodeSource maintains up-to-date Node.js packages for Debian/Ubuntu.

For Node.js 20.x LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Step 3: Verify installation**

```bash
node --version
npm --version
```

> **ℹ️ Note:** The default Ubuntu repositories often have outdated Node.js versions. Using NodeSource ensures you get the latest LTS release.

**Updating Node.js:**

```bash
sudo apt update
sudo apt upgrade nodejs
```

---

#### Fedora / RHEL / CentOS

**Step 1: Install Node.js from NodeSource**

For Node.js 20.x LTS:

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

For CentOS/RHEL 7:

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

**Step 2: Verify installation**

```bash
node --version
npm --version
```

---

#### Using NVM (Node Version Manager) - Recommended for Linux

**NVM** allows you to install and switch between multiple Node.js versions easily.

**Step 1: Install NVM**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

**Step 2: Reload your shell configuration**

```bash
source ~/.bashrc
# or
source ~/.zshrc
```

**Step 3: Install Node.js**

```bash
nvm install 20
nvm use 20
nvm alias default 20
```

**Step 4: Verify installation**

```bash
node --version
npm --version
```

**Benefits of NVM:**

- Switch between Node.js versions easily
- No need for `sudo` when installing packages globally
- Perfect for testing across different Node.js versions

**Common NVM commands:**

```bash
nvm list                  # List installed versions
nvm install 18            # Install Node.js 18
nvm use 18                # Switch to Node.js 18
nvm alias default 20      # Set default version
```

</details>

---

## Post-Installation Configuration

After installing Node.js and npm, follow these steps to optimize your setup:

### 1. Configure npm for Global Packages

By default, npm installs global packages to a system directory that requires administrator privileges. Change this to a local directory:

**macOS/Linux:**

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

Add this line to your `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`:

```bash
export PATH=~/.npm-global/bin:$PATH
```

Reload your shell:

```bash
source ~/.bashrc
# or
source ~/.zshrc
```

**Windows:**

```bash
npm config set prefix "%APPDATA%\npm"
```

The PATH should be updated automatically. If not, add `%APPDATA%\npm` to your system PATH.

### 2. Update npm to Latest Version

Even though npm comes with Node.js, you can update it to the latest version:

```bash
npm install -g npm@latest
```

Verify the update:

```bash
npm --version
```

### 3. Test Your Installation

Create a test file to ensure everything works:

```bash
mkdir ~/test-node
cd ~/test-node
echo "console.log('Node.js is working!');" > test.js
node test.js
```

You should see:

```
Node.js is working!
```

---

## Essential npm Commands

Now that you have npm installed, here are the most common commands you'll use:

```bash
# Install a package locally (in your project)
npm install <package-name>

# Install a package globally (available system-wide)
npm install -g <package-name>

# Install all dependencies from package.json
npm install

# Initialize a new Node.js project
npm init

# Check for outdated packages
npm outdated

# Update packages
npm update

# Uninstall a package
npm uninstall <package-name>
```

---

## Installing Development Tools for WireFluid

Now that Node.js and npm are installed, you can install the tools needed for WireFluid development:

### Install Hardhat (Recommended)

```bash
npm install -g hardhat
```

Verify installation:

```bash
npx hardhat --version
```

### Install TypeScript (Optional but Recommended)

```bash
npm install -g typescript
```

### Install pnpm (Alternative to npm, faster)

```bash
npm install -g pnpm
```

> **💡 What's next?** After installing Node.js and npm, proceed to [Setup MetaMask Wallet](/developer-guide/prerequisites/metamask) to configure your blockchain wallet.

---

## Troubleshooting

### Common Issues and Solutions

#### "node: command not found"

**Solution:**

1. Close and reopen your terminal
2. Check if Node.js is in your PATH:
   ```bash
   echo $PATH
   ```
3. Reinstall Node.js and ensure "Add to PATH" is selected

#### "npm: command not found" (but Node.js works)

**Solution:**

```bash
# macOS/Linux
brew reinstall node

# Windows
# Reinstall Node.js from nodejs.org
```

#### Permission denied when installing packages globally

**Solution:**

- **DON'T use sudo with npm!**
- Follow the [Post-Installation Configuration](#post-installation-configuration) steps above
- Or use NVM instead

#### "EACCES: permission denied" errors

**Solution (macOS/Linux):**

```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Slow npm installations

**Solution:**

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Use a faster package manager:
   ```bash
   npm install -g pnpm
   ```

#### Different Node.js version needed for different projects

**Solution:**
Use NVM to manage multiple versions:

```bash
nvm install 18
nvm install 20
nvm use 18  # Switch to Node 18
nvm use 20  # Switch to Node 20
```

---

## Verifying Your Setup

Run this comprehensive check to ensure everything is properly installed:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if npx is available (comes with npm 5.2+)
npx --version

# Test Node.js execution
node -e "console.log('Node.js is working')"

# Test npm by listing global packages
npm list -g --depth=0
```

**Expected output:**

```
v20.x.x
10.x.x
10.x.x
Node.js is working
/usr/local/lib
└── npm@10.x.x
```

---

## Next Steps

Now that Node.js and npm are installed, continue with the prerequisites:

- **[Setup MetaMask Wallet →](/developer-guide/prerequisites/setup-metamask-wallet)** - Install and configure your blockchain wallet
- **[Configure WireFluid Network →](/developer-guide/prerequisites/network-config)** - Connect MetaMask to WireFluid
- **[Get Testnet Tokens →](/developer-guide/prerequisites/testnet-tokens)** - Request free test $WIRE
- **[Choose Your Development Path →](/developer-guide/paths/comparison)** - Remix, Hardhat, or Foundry?

---

## Additional Resources

- [Official Node.js Documentation](https://nodejs.org/learn)
- [npm Documentation](https://docs.npmjs.com)
- [NVM GitHub Repository](https://github.com/nvm-sh/nvm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

> **Success!**  
> **Congratulations!** You've successfully installed Node.js and npm. You're ready to start building on WireFluid!

---
