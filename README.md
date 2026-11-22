# Frontend — Bốn Mùa Gió

React + Vite user interface. `public/images/` contains optimized WebP copies of the 21 numbered photos, in numeric order. The set is resized for the slide viewport and reduced from about 19 MB to about 3.7 MB; the frontend preloads adjacent slides. Story text is positioned over each photo in CSS to follow the Canva composition reference; the Canva exports themselves are not used. Free-response forms appear on slides 2, 3, and 16; yes/no forms appear on slides 15 and 21. Slides 10 and 14 are prompts without response fields. Draft answers are stored in the browser and submitted to the Apps Script endpoint from the final slide.

From this folder run:

```powershell
npm install
npm run dev
```

Build with `npm run build`.
