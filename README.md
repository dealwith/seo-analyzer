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
- **Resizable Panels**:
  - Drag the divider between text and analytics to adjust panel sizes
  - Minimum width: 20% for each panel
  - Panel sizes saved in localStorage
- **Persistent Storage**: Text, analysis, and panel sizes saved in localStorage (survives page reloads)
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
- Jest (Testing Framework)
- Husky (Git Hooks)
- GitHub Actions (CI/CD)

## Testing

Run the comprehensive test suite:

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report
```

Tests automatically run:
- Before each commit (via Husky pre-commit hook)
- Before each build (via prebuild script)
- On every push/PR (via GitHub Actions)

**Test Coverage**: 34 tests covering analyzer logic, storage, and hooks

## License

**Dual Licensed: AGPL-3.0 OR Commercial**

### Open Source (AGPL-3.0)

This project is licensed under the GNU Affero General Public License v3.0 for open-source use.

**You can use this software for free if:**
- ✅ You keep your modifications open source (AGPL-3.0)
- ✅ You publish source code if providing network services
- ✅ You are an individual, small business, or non-profit
- ✅ You comply with all AGPL-3.0 requirements

**Key AGPL-3.0 Requirements:**
- If you modify this software, you must make your source code available
- If you run this as a web service, you must provide source code to users
- Any derivative work must also be AGPL-3.0 licensed

Full license: [LICENSE](./LICENSE)

### Commercial License

**A commercial license is required if:**
- ❌ You are a corporation with revenue exceeding $1,000,000/year
- ❌ You want to keep your modifications proprietary
- ❌ You cannot comply with AGPL-3.0 open-source requirements
- ❌ You provide SaaS without publishing source code

**Commercial License Benefits:**
- Use software without open-source obligations
- Keep modifications private
- Priority support and updates
- Custom deployment assistance

**Pricing:**
- Small Corps ($1M-$10M revenue): $5,000/year
- Medium Corps ($10M-$100M revenue): $15,000/year
- Large Corps ($100M+ revenue): $50,000/year
- Enterprise (Custom): Contact for pricing

For commercial licensing: [Contact for details]

See [LICENSE.COMMERCIAL](./LICENSE.COMMERCIAL) for full terms.

### Why Dual License?

This model ensures:
1. **Free for open source**: Individuals and small teams can use it freely
2. **Fair for creators**: Commercial users contribute back financially
3. **Sustainable development**: Revenue supports ongoing maintenance
4. **Community growth**: Open source encourages collaboration

### License Summary

| Use Case | License Required |
|----------|------------------|
| Personal projects | AGPL-3.0 (Free) |
| Open source projects | AGPL-3.0 (Free) |
| Small business (<$1M) | AGPL-3.0 (Free)* |
| Non-profit organization | AGPL-3.0 (Free) |
| Large corporation (>$1M) | Commercial (Paid) |
| Proprietary SaaS | Commercial (Paid) |
| Closed-source product | Commercial (Paid) |

\* Must comply with AGPL-3.0 source code requirements
