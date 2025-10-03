# Font & Typography Test Report Template

## Executive summary
- One-paragraph summary of the font loading behavior and key accessibility and performance findings.

## Font inventory
- List of fonts requested (local and remote); include formats (woff2/woff) and sizes.
- Location in project (path) and CSS @font-face snippet.

## Findings
- FOIT/FOUT observations (screenshots before/after).
- LCP metrics and affected elements.
- Accessibility issues affecting typography/contrast.
- CSS smells or misuses (e.g., heavy text-shadow, non-performant webfonts).

## Prioritized recommendations
1. Ensure font-display: swap on all @font-face declarations.
2. Preload critical fonts with appropriate as="font" crossorigin attributes.
3. Limit variable font axes used in production to minimize weight.
4. Use font subsets for non-Latin scripts.
5. Improve contrast to reach WCAG AA where failing.

## Example CSS fixes (snippets)
- Preload:
```html
<link rel="preload" href="/public/assets/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
