# JadisArt Home Categories & Multilingual Interface

## Goal
Enhance the existing JadisArt experience without changing its established antique-luxury identity: a richer dark-gold category showcase on Home, category-aware navigation, and a persistent English/French/Arabic interface with RTL support.

## Implementation

### 1. Shared language system
- Add a lightweight translation provider for English, French, and Arabic.
- Persist the selected language in browser storage and restore it safely after hydration.
- Update the document `lang` and `dir` attributes; Arabic uses RTL while French and English remain LTR.
- Provide reusable translations for navigation, common buttons, category labels, headings, and key Home/Marketplace content.

### 2. Header language selector
- Add an elegant compact language dropdown to the desktop and mobile header.
- Show the selected language clearly and provide the three requested choices: العربية, Français, English.
- Translate navigation labels and accessible control labels without altering existing account, cart, admin, or responsive behavior.

### 3. Premium Home category section
- Replace the current light generic tile grid with a dark, editorial collection band that fits the existing espresso-and-gold system.
- Use the existing category catalog and assign a distinct, meaningful line icon to every category.
- Add subtle gold borders, refined icon framing, restrained lift/reveal transitions, keyboard focus states, and responsive 2/3/5-column layouts.
- Keep every card linked to Marketplace with the canonical category value so filtering continues to work in all languages.

### 4. Key interface translation
- Translate the Home page’s hero, featured collection, categories, trust, story, testimonials, and CTA labels.
- Translate Marketplace headings, filters, sort options, result labels, pagination, and empty states while preserving category filtering.
- Translate shared Product Card, Newsletter, and Footer interface text and category labels.
- Keep product titles/descriptions and company-provided content in their stored source language; this avoids inventing translated catalog data.

### 5. Responsive and runtime validation
- Verify language persistence after reload and route navigation.
- Verify Arabic RTL, the header dropdown, category links/filtering, and Home layouts at desktop and mobile widths.
- Check for console/runtime errors and confirm the existing routes and interactions remain intact.

## Technical details
- React context/hook for locale state and typed translation keys.
- Browser storage access only after hydration to avoid SSR mismatch.
- Semantic Tailwind tokens only; no hardcoded colors in feature components.
- Category query values remain English database keys; only their visible labels are localized.
