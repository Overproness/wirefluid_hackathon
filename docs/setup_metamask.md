---
title: Setup MetaMask Wallet
description: Complete guide to installing and configuring MetaMask for WireFluid development
---

# Setup MetaMask Wallet

To deploy smart contracts or interact with applications on **WireFluid**, you need a digital wallet to manage your keys and sign transactions. We recommend **MetaMask**, the industry-standard wallet for Ethereum-compatible blockchains.

> **ℹ️ Quick Info**  
> **Time Required:** ~5-10 minutes  
> **Difficulty:** Beginner  
> **What You'll Install:** MetaMask Browser Extension or Mobile App

---

## What is MetaMask?

**MetaMask** is a cryptocurrency wallet and gateway to blockchain applications. It allows you to:

- Manage your **$WIRE** tokens and other assets
- Connect to decentralized applications (dApps) on WireFluid
- Deploy smart contracts using tools like Remix and Hardhat
- Sign transactions securely

---

## System Requirements

MetaMask is compatible with most modern browsers and mobile devices.

| Platform    | Supported Browsers/OS                  |
| ----------- | -------------------------------------- |
| **Desktop** | Chrome, Firefox, Brave, Edge, Opera    |
| **Mobile**  | iOS (App Store), Android (Google Play) |

---

## Installation Instructions

Choose your platform:

### Desktop Browser (Recommended for Developers)

<details>
<summary><strong>Click to expand Browser instructions</strong></summary>

**Step 1: Download the Extension**

1. Visit the official [metamask.io](https://metamask.io/) website.
2. Click **"GET STARTED"**.
3. Select your browser (e.g., "Install MetaMask for Chrome").
4. Click **"Add to Chrome"** (or your browser's equivalent button).
5. Confirm the installation in the pop-up window.

**Step 2: Initialize MetaMask**

Once installed, the MetaMask fox icon should appear in your browser toolbar. Click it to get started.

1. Click **"Create a new wallet"**.
2. Review the data usage policy and click "I Agree" or "No Thanks".
3. **Create a Password:**
   - This password unlocks the wallet _only on this device_.
   - Make it strong (min 8 characters).

**Step 3: Secure Your Wallet (Critical)**

MetaMask will generate a **Secret Recovery Phrase** (12 words).

> **⚠️ Warning**
> **Your Secret Recovery Phrase is the ONLY way to recover your funds.**
> Never share it with anyone. If you lose it, your wallet is lost forever.

1. Click "Secure my wallet (recommended)".
2. Click "Reveal Secret Recovery Phrase".
3. **Write down the 12 words on a piece of paper** in the exact order.
4. Store the paper in a secure location.
5. Verify the phrase by selecting the missing words as prompted.
6. Click **"Confirm"**.

</details>

---

### Mobile App

<details>
<summary><strong>Click to expand Mobile instructions</strong></summary>

**Step 1: Download the App**

- **iOS:** Search "MetaMask" in the Apple App Store.
- **Android:** Search "MetaMask" in the Google Play Store.

**Step 2: Create Wallet**

1. Open the app and tap **"Get Started"**.
2. Tap **"Create a new wallet"**.
3. Create a strong password (or enable biometrics like FaceID).
4. Follow the prompts to secure your wallet with the **Secret Recovery Phrase**.

**Step 3: Sync with Desktop (Optional)**

If you already created a wallet on your desktop, you can import it to mobile using your Secret Recovery Phrase rather than creating a new one.

</details>

---

## Pinning MetaMask

For easy access during development, pin the extension to your toolbar.

1. Click the **Extensions** icon (puzzle piece) in your browser's top right corner.
2. Find **MetaMask** in the list.
3. Click the **Pin** icon next to it.

---

## Verification

To ensure your wallet is ready:

1. Click the MetaMask fox icon.
2. You should see your account balance (defaulting to `0 ETH`) and the network dropdown (defaulting to "Ethereum Mainnet").
3. Your account address is shown at the top (e.g., `0x123...abc`).

> **💡 Tip:** Click the copy icon next to your address to copy it to your clipboard. You will need this to receive test tokens.

---

## Next Steps

Now that you have a wallet, you need to connect it to the WireFluid network.

- **[Configure WireFluid Network →](/developer-guide/prerequisites/network-config)** - Add the WireFluid RPC details to MetaMask
- **[Get Testnet Tokens →](/developer-guide/prerequisites/testnet-tokens)** - Request free test $WIRE
- **[Install Node.js & npm →](/developer-guide/prerequisites/install-nodejs)** - (If you haven't already)

---

## Troubleshooting

### Common Issues

#### "MetaMask window keeps closing"

**Solution:**
Click the MetaMask icon to reopen it. If you click outside the popup, it closes automatically. To keep it open, click the three dots (`...`) and select **"Expand view"** to open it in a full browser tab.

#### "I forgot my password"

**Solution:**
If you still have your **Secret Recovery Phrase**, you can reset the password by clicking "Forgot password?" on the login screen and entering your 12-word phrase.

#### "I lost my Secret Recovery Phrase"

**Solution:**
If you are still logged in, you can view it in **Settings > Security & Privacy > Reveal Secret Recovery Phrase**. If you are locked out and lost the phrase, the wallet cannot be recovered.

---

> **Success!**
> **Congratulations!** Your digital wallet is set up. You are now ready to connect to WireFluid.
