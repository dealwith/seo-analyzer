# SEO Keyword Analyzer

A Next.js web application for analyzing text to identify keyword density and combinations.

## Features

- **Keyword Analysis**: Identifies top 20 keywords with frequency and percentage
- **Phrase Detection**: Finds top 10 two-word and three-word combinations
- **Text Statistics**: Shows characters, total words, and meaningful words count
- **Interactive Highlighting**:
  - Each top 20 keyword is highlighted with a unique color
  - Click on any keyword in the text or table to emphasize all instances
  - Color indicators next to each keyword for easy identification
- **Persistent Storage**: Text and analysis saved in localStorage (survives page reloads)
- **Clean Interface**: Split-panel design with text input on left, analytics on right
- **Responsive Design**: Works seamlessly on desktop and mobile devices

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

1. **Enter Text**: Paste your text in the left panel textarea
2. **Analyze**: Click "Analyze Text" button
3. **View Results**: The right panel displays:
   - Statistics overview (characters, words, meaningful words)
   - Top 20 keywords with color indicators, count, and percentage
   - Top 10 two-word phrase combinations
   - Top 10 three-word phrase combinations
4. **Interactive Features**:
   - After analysis, keywords are highlighted in the text with unique colors
   - Click any keyword (in text or table) to emphasize all instances with a blue outline
   - Click "Edit Text" to modify the content
   - Click "Clear All" to reset everything
5. **Auto-Save**: Your text and analysis are automatically saved and restored on page reload

## Technology Stack

- Next.js 14
- React 18
- TypeScript
- CSS Modules
