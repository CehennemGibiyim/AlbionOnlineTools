# Contributing to Albion Tools

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome all contributions
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Fork & Clone
```bash
git clone https://github.com/yourusername/albion-tools.git
cd albion-tools
```

### Set Up Development Environment
```bash
npm install
npm run build-db
npm run web:dev
```

### Create a Branch
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Make Changes
- Edit files in appropriate directories
- Update styles in `css/`
- Add JavaScript in `js/`
- Modify HTML in `index.html`

### 2. Test Locally
```bash
npm run web:dev
```
- Test in browser
- Check all features work
- Test responsive design

### 3. Database Updates
If adding new items or data:
```bash
npm run build-db
```

### 4. Commit Changes
```bash
git add .
git commit -m "Add feature: description"
```

Use clear, descriptive commit messages:
- ✅ `Add market price history chart`
- ✅ `Fix killboard player search`
- ✅ `Update German translations`
- ❌ `fix stuff`
- ❌ `changes`

### 5. Push & Create PR
```bash
git push origin feature/your-feature-name
```

Create Pull Request on GitHub:
- Describe what you changed
- Explain why you made changes
- Reference related issues

## Code Style

### JavaScript
```javascript
// Use clear variable names
const craftProfitMargin = (sellPrice - totalCost) / totalCost;

// Use template literals
const message = `Profit: ${margin}%`;

// Use arrow functions
const filtered = items.filter(item => item.tier >= 5);

// Comment complex logic
// Calculate average price across all cities
const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
```

### CSS
```css
/* Use consistent naming */
.section-title { }
.content-item { }
.btn-primary { }

/* Organize by purpose */
/* Layout */
/* Colors */
/* Typography */
/* Effects */

/* Use CSS variables */
color: var(--accent-gold);
background: var(--bg-dark);
```

### HTML
```html
<!-- Use semantic HTML -->
<header></header>
<nav></nav>
<main></main>
<aside></aside>
<footer></footer>

<!-- Use data attributes for JS -->
<button data-action="calculate">Calculate</button>

<!-- Use meaningful classes -->
<div class="craft-table-row">
  <span class="item-name"></span>
</div>
```

## Translation Guidelines

When adding new text:

1. Add to `js/i18n.js`:
```javascript
const TRANSLATIONS = {
    tr: { newKey: "Türkçe metin" },
    en: { newKey: "English text" },
    de: { newKey: "Deutscher Text" },
    // ... other languages
};
```

2. Use in HTML:
```html
<span data-i18n="newKey"></span>
```

3. Or in JavaScript:
```javascript
const text = t('newKey');
```

## Testing

### Manual Testing
- ✅ Test in Chrome, Firefox, Safari, Edge
- ✅ Test on mobile (use DevTools)
- ✅ Test all features work together
- ✅ Test with and without internet
- ✅ Test all themes and languages

### Checklist Before PR
- [ ] Feature works locally
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Database builds successfully
- [ ] Translations added for all languages
- [ ] Documentation updated

## Documentation

Update docs when:
- Adding new features
- Changing configuration
- Adding environment variables
- Modifying API endpoints

Files to update:
- `README.md` - Feature list
- `SETUP_GUIDE.md` - Instructions
- `DEVELOPMENT.md` - Developer info
- Code comments - Complex logic

## Reporting Bugs

### Before Reporting
- Check if bug already exists
- Reproduce the issue
- Note browser/OS/version
- Collect error messages

### Bug Report Template
```
**Title:** [Bug] Short description

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Node: 18.14.0

**Steps to Reproduce:**
1. Open application
2. Click on Market Analysis
3. Search for "Iron Ore"

**Expected Behavior:**
Shows price history chart

**Actual Behavior:**
Chart fails to load, console error: ...

**Screenshots/Logs:**
[Include if relevant]
```

## Feature Requests

### Feature Request Template
```
**Title:** [Feature] Clear description

**Use Case:**
Why is this needed? What problem does it solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other approaches explored

**Additional Context:**
Screenshots, examples, references
```

## Build Process

### Local Development
```bash
npm run web:dev
```

### Production Build
```bash
npm run build
```

### Docker Build
```bash
docker build -t albion-tools:latest .
```

### Database Update
```bash
npm run build-db
```

## Version Control

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements
- `perf/description` - Performance improvements

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be specific: "Update market chart colors" not "Update stuff"
- Reference issues: "Fix #123"

## Performance Tips

- Minimize DOM operations
- Use event delegation
- Cache API responses
- Optimize database queries
- Use CSS transforms for animations
- Lazy load components

## Security Considerations

- Never commit API keys or secrets
- Validate user input
- Use HTTPS in production
- Keep dependencies updated
- Report security issues privately

## Getting Help

- **Documentation:** Check SETUP_GUIDE.md
- **Issues:** Search existing GitHub issues
- **Discussions:** Use GitHub Discussions
- **Discord:** Join community server

## Thank You! 🙏

Your contributions help make Albion Tools better for everyone. We appreciate your time and effort!

---

**Happy Contributing!** 🚀
