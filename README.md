# SEO Keyword Analyzer

A Next.js web application for analyzing text to identify keyword density and combinations.

## Features

- Keyword frequency analysis
- 2-word and 3-word phrase detection
- Text statistics (characters, total words, meaningful words)
- Clean split-panel interface
- Responsive design

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and deploy

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Usage

1. Enter or paste your text in the left panel
2. Click "Analyze Text"
3. View the analysis results in the right panel:
   - Statistics overview
   - Top 20 keywords with frequency and percentage
   - Top 10 two-word combinations
   - Top 10 three-word combinations

## Technology Stack

- Next.js 14
- React 18
- TypeScript
- CSS Modules
