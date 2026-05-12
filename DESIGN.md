---
version: 1.0.0
name: SmartIoT Chat Design System
description: Dark-first technical SaaS design system for a frontend-only realtime support and IoT operations chat SPA.
colors:
  background:
    DEFAULT: "oklch(0.145 0.025 255)"
    raised: "oklch(0.18 0.028 255)"
    subtle: "oklch(0.21 0.03 255)"
  surface:
    DEFAULT: "oklch(0.205 0.028 255 / 0.84)"
    elevated: "oklch(0.255 0.032 255 / 0.88)"
    overlay: "oklch(0.145 0.025 255 / 0.72)"
  card:
    DEFAULT: "oklch(0.235 0.03 255 / 0.86)"
    hover: "oklch(0.285 0.035 255 / 0.9)"
  border:
    DEFAULT: "oklch(0.78 0.035 255 / 0.14)"
    strong: "oklch(0.82 0.045 255 / 0.24)"
    focus: "oklch(0.72 0.18 245)"
  primary:
    DEFAULT: "oklch(0.62 0.21 260)"
    hover: "oklch(0.68 0.2 255)"
    foreground: "oklch(0.985 0.005 255)"
  secondary:
    DEFAULT: "oklch(0.58 0.18 300)"
    hover: "oklch(0.64 0.17 300)"
    foreground: "oklch(0.985 0.005 255)"
  success:
    DEFAULT: "oklch(0.72 0.18 155)"
    subtle: "oklch(0.72 0.18 155 / 0.14)"
    foreground: "oklch(0.95 0.05 155)"
  warning:
    DEFAULT: "oklch(0.78 0.16 75)"
    subtle: "oklch(0.78 0.16 75 / 0.15)"
    foreground: "oklch(0.98 0.04 85)"
  destructive:
    DEFAULT: "oklch(0.64 0.22 25)"
    subtle: "oklch(0.64 0.22 25 / 0.14)"
    foreground: "oklch(0.98 0.02 25)"
  muted:
    DEFAULT: "oklch(0.72 0.025 255)"
    foreground: "oklch(0.78 0.02 255)"
    subtle: "oklch(0.48 0.02 255)"
  foreground:
    DEFAULT: "oklch(0.94 0.01 255)"
    strong: "oklch(0.985 0.005 255)"
    inverse: "oklch(0.15 0.02 255)"
typography:
  fontFamily:
    sans: "Inter, ui-sans-serif, system-ui, sans-serif"
    code: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  display:
    fontSize: "2.5rem"
    lineHeight: "1.05"
    fontWeight: 700
  h1:
    fontSize: "2rem"
    lineHeight: "1.15"
    fontWeight: 700
  h2:
    fontSize: "1.5rem"
    lineHeight: "1.2"
    fontWeight: 650
  h3:
    fontSize: "1.125rem"
    lineHeight: "1.3"
    fontWeight: 650
  body:
    fontSize: "1rem"
    lineHeight: "1.6"
    fontWeight: 400
  body-sm:
    fontSize: "0.875rem"
    lineHeight: "1.45"
    fontWeight: 400
  label:
    fontSize: "0.8125rem"
    lineHeight: "1.25"
    fontWeight: 600
  caption:
    fontSize: "0.75rem"
    lineHeight: "1.3"
    fontWeight: 500
  code:
    fontSize: "0.8125rem"
    lineHeight: "1.5"
    fontWeight: 500
spacing:
  base: "4px"
  scale:
    0: "0"
    1: "0.25rem"
    2: "0.5rem"
    3: "0.75rem"
    4: "1rem"
    5: "1.25rem"
    6: "1.5rem"
    8: "2rem"
    10: "2.5rem"
    12: "3rem"
    16: "4rem"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  2xl: "1.25rem"
  full: "9999px"
components:
  app-shell:
    background: "colors.background.DEFAULT"
    layout: "desktop three-panel, mobile sheet/tabs"
  sidebar:
    width: "18rem"
    background: "colors.surface.DEFAULT"
    border: "colors.border.DEFAULT"
  room-item:
    height: "3.5rem"
    radius: "rounded.lg"
    activeColor: "colors.secondary.DEFAULT"
  message-list:
    scroll: "internal"
    gap: "spacing.4"
  message-bubble:
    maxWidth: "min(42rem, 86%)"
    radius: "rounded.xl"
  message-input:
    minHeight: "3rem"
    maxLength: 500
  avatar-initials:
    size: "2.5rem"
    radius: "rounded.full"
    imageUploads: false
  user-presence:
    onlineColor: "colors.success.DEFAULT"
    warningColor: "colors.warning.DEFAULT"
  badge-role:
    radius: "rounded.full"
    variants: ["guest", "technician", "admin", "bot", "sensor"]
  alert-card:
    background: "colors.warning.subtle"
    border: "colors.warning.DEFAULT"
  empty-state:
    icon: "lucide-react"
    tone: "muted"
  loading-skeleton:
    background: "colors.muted.subtle"
  dialog:
    background: "colors.surface.elevated"
    radius: "rounded.2xl"
  sheet:
    background: "colors.surface.elevated"
    radius: "rounded.2xl"
  button-primary:
    background: "colors.primary.DEFAULT"
    foreground: "colors.primary.foreground"
  button-secondary:
    background: "colors.secondary.DEFAULT"
    foreground: "colors.secondary.foreground"
  button-ghost:
    background: "transparent"
    hover: "colors.card.hover"
  input:
    background: "colors.background.subtle"
    border: "colors.border.DEFAULT"
  textarea:
    background: "colors.background.subtle"
    border: "colors.border.DEFAULT"
  card:
    background: "colors.card.DEFAULT"
    radius: "rounded.2xl"
  toast:
    background: "colors.surface.elevated"
    border: "colors.border.strong"
---

## Overview

SmartIoT Chat uses a dark technical SaaS interface for realtime support, small-team operations, and IoT alert triage. The visual mood is calm but sharp: deep navy surfaces, restrained electric blue actions, violet selection states, and semantic status colors for connected devices, warnings, and critical failures.

The product should feel like a real operations console, not a tutorial app. It should sit closer to Linear, Vercel, Raycast, and a technical Discord workspace than to Bootstrap dashboards with decorative sparkle. Every screen should support repeated use, fast scanning, and clear decision-making.

## Colors

`background` is the full-viewport near-black navy base. Use it for the app shell and page-level negative space.

`surface` is for persistent panels such as the rooms sidebar, chat frame, right rail, sheets, and dialogs. It should remain translucent only when contrast stays readable.

`card` is for contained repeated units: room items, alert cards, user rows, empty states, and small settings panels.

`border` separates dark surfaces with subtle slate lines. Prefer borders over heavy shadows for dense UI.

`primary` is electric indigo/blue for main actions such as send, sign in, confirm, and active command states.

`secondary` is violet/purple for selected rooms, tabs, filters, or alternate emphasis. Do not use it as a general background wash.

`success` marks online, connected, delivered, and healthy device states.

`warning` marks IoT alerts, degraded device states, latency, and attention-needed notices.

`destructive` marks auth errors, failed send states, critical alerts, and dangerous actions.

`muted` is for timestamps, helper text, metadata, placeholder copy, and inactive icons.

`foreground` is slightly softened white. Avoid pure white for large text blocks.

## Typography

Use Inter as the primary font. The hierarchy should be compact and SaaS-oriented: strong enough for scanning, never oversized inside panels. Display and `h1` are reserved for auth or major empty states, not normal chat panel headings.

Body text uses generous line-height for message readability. Labels and captions stay dense for timestamps, roles, statuses, and metadata. Code uses the system monospace stack for device IDs, event codes, channel names, and technical diagnostics.

## Layout

Desktop uses a three-panel full-viewport layout: left sidebar for rooms, central chat, and right panel for online users or room info. The app shell owns viewport height; the message list scrolls internally. Avoid global page scroll during normal chat usage.

Tablet can collapse the right panel first. Keep rooms available as a narrower rail or a sheet depending on width.

Mobile is one primary task at a time. The chat remains central, rooms move into a Sheet or horizontal tabs, and room info or online users move into a Sheet or bottom tab. Touch targets must be at least 44px high. Composer remains reachable and should not cause horizontal overflow.

## Elevation & Depth

Depth comes from layered surfaces, translucent overlays, soft shadows, and borders. Use shadows sparingly: dialogs, sheets, active room items, focused composer, and toasts may have glow-like depth. Avoid neumorphism and heavy floating cards.

Panel separation should mostly use `border` tokens. Overlays should dim the app with navy transparency, not black opacity alone.

## Shapes

`sm` is for small chips and inner elements.

`md` is for compact buttons, inputs, badges, and icon controls.

`lg` is for room items, message bubbles, and toolbar controls.

`xl` is for composer containers and larger repeated rows.

`2xl` is for cards, sheets, dialogs, and major panels.

`full` is for presence dots, pill badges, and circular avatar initials.

## Components

**Button**
Use shadcn/ui Button variants as the base. Primary buttons use electric blue, secondary buttons use violet or slate depending on context, and ghost buttons remain transparent until hover. Focus rings must be visible. Icon size should usually be 16px or 18px.

**Card**
Cards are for repeated or framed content only. Use `card` surface, subtle border, `2xl` radius, and light shadow only when elevation is needed.

**Input/Textarea**
Inputs use dark subtle surfaces, slate borders, readable placeholder text, and strong focus rings. Textarea for messages must enforce the 500-character limit and render content as plain text.

**RoomItem**
Room rows should show room name, last activity, unread/alert state, and an icon. Active rooms use secondary violet or blue border emphasis. Warning rooms may add amber status, but not replace selection state.

**MessageBubble**
Messages have readable line-height, plain text only, and max width constrained for scanning. Own messages may use primary tone; bot/sensor/error messages use semantic styling. Never render raw HTML.

**AvatarInitials**
Avatars never use uploaded images or remote URLs. Generate initials from display name or role. Use circular or rounded-square shapes, centered text, and role/hash-derived background.

**BadgeRole**
Role badges cover `guest`, `technician`, `admin`, `bot`, and `sensor`. Use semantic colors with accessible contrast. Badges should remain small and scannable.

**AlertCard**
Alert cards show IoT warning or critical states with lucide icons, clear title, status, and timestamp. Warning uses amber, destructive uses red. Include non-color cues through text and icon.

**OnlineUsers**
Online user lists use presence dots, role badges, initials avatars, and short metadata. Avoid hiding status using color alone.

**Sheet/Dialog**
Use shadcn/ui Sheet and Dialog. Mobile navigation, room info, settings, and confirmations should live here. Use focus trap, labelled titles, and visible close controls.

**Toast**
Use Sonner. Toasts are for send failures, auth state changes, copied metadata, and connection changes. Keep copy short and actionable.

## Do's and Don'ts

Do:

- Use tokens from this file before adding new colors, radii, or spacing.
- Maintain readable contrast across all dark surfaces.
- Use avatars without images: initials, emojis, local icons, or CSS forms only.
- Design mobile-first interactions with sheets, tabs, and stable touch targets.
- Keep loading, error, empty, offline, and demo states explicit.
- Use lucide-react icons at consistent sizes with accessible labels when icon-only.
- Keep message scrolling internal to the chat panel.
- Keep Firebase usage limited to Auth and Realtime Database.

Don't:

- Do not upload images.
- Do not use Firebase Storage.
- Do not store blobs, base64 image data, attachments, or files in Realtime Database.
- Do not use loud gradients or decorative glow everywhere.
- Do not use colors outside the token system without documenting the exception.
- Do not break GitHub Pages base path or SPA behavior.
- Do not create one-off visual components that conflict with shadcn/ui patterns.
- Do not use remote avatar images.
- Do not render message text as HTML.

## Implementation Notes for Agents

When creating React components, Codex should treat this file as the visual source of truth. Prefer shadcn/ui primitives first, then compose feature components around them. Use Tailwind CSS v4 and map these tokens into CSS variables where possible.

Keep components reusable and feature-scoped. Use semantic class names, CSS variables, and shadcn variants instead of hardcoded color literals. If a hardcoded value is unavoidable, choose from this document and add a short comment only when needed.

Use lucide-react for icons and keep icon sizing consistent. Preserve accessibility: visible focus, labelled controls, keyboard paths, readable contrast, and clear status text. Validate desktop and mobile visually before declaring UI work complete.
