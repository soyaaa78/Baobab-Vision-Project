# Design System

## Direction
- Tone: Branded admin access screen with warm Baobab Vision identity, restrained operational forms, and concise state feedback.
- Density: Centered auth card with generous input spacing; inline auth steps should stay compact enough for mobile card layouts.
- Contrast: Cream page background, white form card, dark primary actions, warm amber focus/action accents, and clear red/green message states.

## Tokens
- Spacing scale: 8px base with common form gaps at 16px, 20px, 25px, and 40px.
- Radius scale: 6px for messages, 7-8px for inputs/buttons, 10px for the auth card.
- Typography scale: Rubik for form controls and Red Rose for brand/title text; compact helper text at 0.85-0.95rem.
- Color roles: Primary action #171717, primary hover #000000, warm accent #eab676, accessible secondary action #6f5844, secondary action hover #5c4737, page background #fcf7f2, text #252525/#2a383d, error #c33 on #fee, success #176d2d on #efe.

## Components
- Button: Full-width dark primary submit button with darker secondary text/outline actions (#6f5844, hover #5c4737); disabled state lowers emphasis and removes lift.
- Input: Cream input fill with left icon, 8px radius, amber focus border and soft focus ring.
- Card: White auth card with subtle shadow, 10px radius, responsive padding that tightens on mobile.
- Modal: Not used on the login page; auth recovery remains inline in the card instead of introducing overlays.

## Motion
- Duration scale: 0.25-0.3s for control hover/focus, 1.2s for slideshow fade, 7s slide movement, 38s stripe marquee.
- Easing: Standard ease/ease-in-out for UI controls and slideshow transitions; linear only for continuous marquee motion.

## Notes
- 2026-06-11: Added admin forgot-password inline flow direction. Reset steps reuse the existing auth card, input, button, and message language; reset token remains in component state only; helper and secondary actions use compact text styles to avoid mobile overflow.
