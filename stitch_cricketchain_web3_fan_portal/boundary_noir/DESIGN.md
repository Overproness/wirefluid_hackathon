# Design System Document: The Stadium Nocturne

## 1. Overview & Creative North Star
The "Stadium Nocturne" is our Creative North Star. It avoids the sterile, boxy layouts of traditional DeFi and instead leans into the high-octane atmosphere of a floodlit cricket stadium at night. We are building a "Digital Arena"—an experience that feels editorial, immersive, and premium.

To break the "template" look, we utilize **intentional asymmetry**. Layouts should feel like dynamic sports broadcasts, with overlapping elements (e.g., a player’s silhouette breaking the frame of a card) and high-contrast typography scales that prioritize "vibe" as much as information. This system is designed to evoke the tension of the final over and the prestige of a championship trophy.

## 2. Colors & Atmospheric Depth
Our palette is rooted in the deep shadows of the pitch, punctuated by the electric glow of the floodlights.

### The Foundation
- **Background:** `#020617` (Near-black slate). This is the "void" of the stadium beyond the lights.
- **Primary (Action):** `#10B981` (Emerald Green). Used for the "Go" signal—betting, minting, and primary CTAs.
- **Secondary (Rewards/XP):** `#F59E0B` (Amber Gold). Reserved for value, progression, and achievement.
- **Tertiary (Governance):** `#38BDF8` (Sky Blue). Represents the "cool heads" of the DAO and community decisions.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Traditional borders create "boxes"; we want "spaces." Boundaries must be defined solely through:
1. **Background Shifts:** Placing a `surface-container-low` section on a `surface` background.
2. **Tonal Transitions:** Using subtle `surface-container-highest` headers to anchor a page.

### The "Glass & Gradient" Rule
To ensure the dApp feels premium and Web3-native:
- **Glassmorphism:** All floating cards must use semi-transparent surface colors with a `20px` to `40px` backdrop-blur. 
- **Signature Textures:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#4edea3) to `primary_container` (#10b981) at a 135-degree angle to provide "soul" and depth.

## 3. Typography: The Scoreboard Aesthetic
The typography system balances the aggressive energy of sports with the technical precision of blockchain.

- **Display & Headlines (Bebas Neue / Space Grotesk):** These are our "Scoreboard" fonts. Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to command authority. They should feel loud, echoing the stadium announcer.
- **Body (Inter / Geist):** Our workhorse. Used for high readability in market stats and news feeds. `body-md` is the standard for fan engagement content.
- **Data (JetBrains Mono):** All wallet addresses, transaction hashes, and block numbers must use this monospaced font. It signals "Technical Truth" to the user.

## 4. Elevation & Depth: Tonal Layering
We reject the drop-shadow defaults of the 2010s. Hierarchy is achieved through "statically stacked" surfaces.

### The Layering Principle
Think of the UI as physical layers of frosted glass.
- **Surface (Base):** `#0c1324`.
- **Surface-Container-Low:** Use for large structural areas (like a side rail).
- **Surface-Container-High:** Use for interactive cards or modular components.
- **Surface-Bright:** Use for tooltips or active popovers to ensure they "pop" against the dark background.

### Ambient Shadows & Ghost Borders
- **Shadows:** Only use shadows for floating elements (Modals/Dropdowns). Use a `24px` blur at 8% opacity, tinted with `#38BDF8` (Sky Blue) to mimic the cool ambient light of a stadium.
- **The "Ghost Border":** If a separator is required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

## 5. Components & Primitive Styling

### Buttons (The "Power Hit")
- **Primary:** 6px radius. Emerald-to-Dark-Green gradient. On hover, apply an `8px` outer glow (drop-shadow) using the `primary` color at 40% opacity.
- **Tiered Buttons:** For Tier-specific actions, the button color must match the Tier (e.g., a "Claim Gold Reward" button uses `#FFD700`).

### Cards (The "Glass Suite")
- **Rule:** Forbid divider lines within cards. Separate the header from the body using a `surface-container-highest` background for the header and `surface-container-low` for the body.
- **Radius:** 12px for outer containers; 8px for nested elements.

### Tier Badges (The "Medal Room")
Badges utilize a "Prismatic Shimmer" effect:
- **Diamond Tier:** Uses a multi-stop linear gradient (`#B9F2FF`, `#FFFFFF`, `#B9F2FF`) with a subtle `animate-pulse` to mimic light hitting a facet.
- **Platinum:** A shimmering blue gradient using `tertiary` tokens.

### Input Fields
- Dark backgrounds (`surface-container-lowest`).
- No border on idle.
- On focus, a 1px "Ghost Border" appears in `primary` with a soft green inner glow.

## 6. Do’s and Don’ts

### Do:
- **Do** use "Stadium Crowd Bokeh" imagery in the background of hero sections to add texture and depth.
- **Do** use `JetBrains Mono` for all numbers relating to $tokens or XP to emphasize the "Web3" nature of the app.
- **Do** allow elements like cricket balls or player cards to "overflow" their containers (asymmetric layout).

### Don’t:
- **Don’t** use pure white (#FFFFFF) for body text. Use `on-surface-variant` (#bbcabf) to reduce eye strain in dark mode.
- **Don’t** use sharp 90-degree corners. Everything must feel machined and ergonomic (8-12px radius).
- **Don’t** use standard "Material Design" blue for links. Everything is Sky Blue (`tertiary`), Emerald (`primary`), or Amber (`secondary`).