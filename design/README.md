# Opo Marketing Portal – UI/UX Design Spec

## Visual Theme
- **Dark‑mode first** – base background `hsl(210, 15%, 12%)`.
- **Primary accent** – `hsl(220, 90%, 60%)` (vivid blue).  
- **Secondary accent** – `hsl(340, 70%, 65%)` (soft magenta).  
- **Neutral palette** – grayscale from `hsl(210, 10%, 20%)` to `hsl(210, 10%, 80%)`.
- **Typography** – Google Font **Inter** (weights 400‑700).  
- **Iconography** – Feather icons, line style.

## Glass‑morphism Card
```css
.card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

## Buttons & Interactive Elements
```css
.button {
  background: hsl(220,90%,60%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s;
}
.button:hover { background: hsl(220,90%,55%); }
.button:active { transform: scale(0.97); }
```

## Micro‑animations
- **Fade‑in** on page load: `opacity 0→1` over 300 ms.
- **Hover lift** for cards: `transform: translateY(-4px)` with subtle shadow.
- **View‑transition** for navigation between modules (Chrome API).

## Layout & Responsiveness
- Use **CSS container queries** to adapt module grids.
- Breakpoints: `@media (min-width: 640px)`, `@media (min-width: 1024px)`, `@media (min-width: 1440px)`.
- All typography scales with `clamp(0.9rem, 1.2vw, 1.2rem)`.

## Accessibility
- Minimum contrast ratio 4.5:1 (checked with WCAG AA).  
- Focus outline: `outline: 2px solid hsl(220,90%,60%);`.
- Keyboard‑navigable menus, `aria‑labels` on icons.

## Mock‑up
Below is a high‑level dashboard mock‑up illustrating the card layout, navigation bar, and color theme.

![Dashboard mock‑up](file:///Users/mac/.gemini/antigravity-ide/brain/939b5bf8-c34f-418e-982e-b94d074b7c60/artifacts/dashboard_mockup.png)
