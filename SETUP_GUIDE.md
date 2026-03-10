# 🎮 Albion Tools — Setup Guide

Welcome to Albion Tools! This guide will help you set up and run the application on your system.

## ⚙️ System Requirements

### Windows
- Windows 10 or later
- Node.js 16+ ([Download](https://nodejs.org))
- (Optional) Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))

### macOS
- macOS 10.12+
- Node.js 16+ ([Download](https://nodejs.org))
- (Optional) Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))

### Linux
- Node.js 16+ (use your package manager or [Download](https://nodejs.org))
- (Optional) Docker ([Install Guide](https://docs.docker.com/engine/install/))

## 🚀 Quick Start

### Option 1: Automated Setup (Easiest)

**Windows:**
```bash
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### Step 1: Clone the repository
```bash
git clone https://github.com/yourusername/albion-tools.git
cd albion-tools
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Build the database
```bash
npm run build-db
```

#### Step 4: Choose your running mode

**Web Server (Local):**
```bash
npm run web
```
Then open: http://localhost:3000

**Docker (Recommended for production):**
```bash
docker build -t albion-tools:latest .
docker run -p 3000:3000 -v $(pwd)/data:/app/data albion-tools:latest
```

**With Docker Compose:**
```bash
docker-compose up -d
```

## 📋 Running Modes

### 1. Web Server Mode
Best for: Development and testing

```bash
npm run web
```

- Runs on `http://localhost:3000`
- Files served directly from the filesystem
- Changes require server restart
- No containerization needed

### 2. Docker Mode
Best for: Production deployments

```bash
docker build -t albion-tools:latest .
docker run -p 3000:3000 -v $(pwd)/data:/app/data albion-tools:latest
```

Benefits:
- Isolated environment
- Consistent across systems
- Easy to deploy
- Health checks included

### 3. Docker Compose Mode
Best for: Multiple services and easy management

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f web

# Development mode with hot-reload
docker-compose --profile dev up
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```
NODE_ENV=production
PORT=3000
ALBION_API_BASE=https://west.albion-online-data.com/api/v2/stats
```

## 🗂️ Project Structure

```
albion-tools/
├── index.html              # Main application
├── server.js              # Express web server
├── main.js                # Electron entry point
├── build-db.js            # Database builder
├── Dockerfile             # Container image
├── docker-compose.yml     # Docker orchestration
├── package.json           # Dependencies
├── setup.sh              # Setup script (Linux/macOS)
├── setup.bat             # Setup script (Windows)
├── css/
│   ├── style.css         # Main styles
│   ├── themes.css        # Theme system
│   └── responsive.css    # Mobile/responsive
├── js/
│   ├── app.js            # Main application logic
│   ├── api.js            # API service
│   ├── craft.js          # Crafting calculator
│   ├── market.js         # Market analysis
│   ├── killboard.js      # Kill statistics
│   ├── avalon.js         # Avalon maps
│   ├── builds.js         # Build guide
│   ├── settings.js       # Settings & preferences
│   └── i18n.js           # Internationalization
├── data/
│   └── db.json           # Item database
└── .github/
    └── workflows/
        └── ci-cd.yml     # GitHub Actions pipeline
```

## 🌐 Accessing the Application

### Local Development
- **Web Server:** http://localhost:3000
- **API Health Check:** http://localhost:3000/api/health
- **Database API:** http://localhost:3000/api/db

### Features
✅ Crafting Calculator - Calculate profits and costs  
✅ Market Analysis - Track item prices  
✅ Kill Statistics - View recent kills  
✅ Avalon Maps - Explore resources and chests  
✅ Build Guide - Equipment recommendations  
✅ Multi-language - 10 languages supported  
✅ Dark Themes - 10+ color schemes  

## 📦 Deployment

### Docker Hub
```bash
docker build -t yourname/albion-tools:latest .
docker push yourname/albion-tools:latest
```

### Cloud Platforms

**Google Cloud Run:**
```bash
gcloud run deploy albion-tools \
  --source . \
  --platform managed \
  --region us-central1
```

**AWS (Docker):**
```bash
docker tag albion-tools:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/albion-tools:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/albion-tools:latest
```

**Heroku:**
```bash
heroku create albion-tools
heroku container:push web
heroku container:release web
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Change PORT in .env or use:
PORT=3001 npm run web
```

### Database not found
```bash
npm run build-db
```

### Docker build fails
```bash
docker build --no-cache -t albion-tools:latest .
```

### Permission denied on setup.sh
```bash
chmod +x setup.sh
./setup.sh
```

## 📝 Development

### Adding a New Feature

1. Create new JavaScript module in `js/`
2. Add translations in `js/i18n.js`
3. Update HTML in `index.html`
4. Add styles to `css/style.css`
5. Test locally with `npm run web`
6. Push to GitHub

### Testing
```bash
npm test
```

### Building Database
```bash
npm run build-db
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🔗 Links

- **GitHub Repository:** https://github.com/yourusername/albion-tools
- **Albion Online:** https://albiononline.com
- **Albion Data API:** https://www.albion-online-data.com
- **Issues/Support:** https://github.com/yourusername/albion-tools/issues

## 💡 Tips

- **For Production:** Always use Docker or Docker Compose
- **For Development:** Use `npm run web` for faster iteration
- **Database Updates:** Run `npm run build-db` regularly to get new items
- **Backups:** Keep backups of `data/db.json` before updates
- **Performance:** Check `docker stats` if experiencing slowness

---

**Questions?** Open an issue on GitHub or contact support.

Happy analyzing! 🎮✨
