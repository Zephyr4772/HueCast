# AirWatch - Real-time Air Quality Index Monitor

![AirWatch Logo](https://via.placeholder.com/150x50/2563eb/ffffff?text=AirWatch)

A modern, comprehensive air quality monitoring application that provides real-time AQI data for cities worldwide with health recommendations, interactive maps, and AI-powered assistance.

## 🌟 Features

### Core Functionality
- **Real-time AQI Data**: Get current air quality index for any city worldwide
- **Health Recommendations**: Personalized advice based on current air quality levels
- **Global Coverage**: Monitor air quality in thousands of cities across the globe
- **Detailed Pollutant Analysis**: View breakdown of PM2.5, PM10, O₃, NO₂, SO₂, and CO levels

### Interactive Components
- **Smart Search**: Intelligent city search with autocomplete and history
- **Interactive Maps**: Global air quality visualization with real-time data overlays
- **Favorites Management**: Save and quickly access your frequently monitored cities
- **Historical Charts**: View air quality trends over time
- **City Filtering**: Filter cities by air quality levels (Good, Poor, Hazardous)

### AI Assistant
- **Gemini AI Integration**: Ask questions about air quality and get expert advice
- **Context-aware Responses**: AI understands AQI terminology and health implications
- **Conversational Interface**: Natural language interaction for air quality queries

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Automatic theme switching based on user preference
- **Accessibility**: WCAG compliant with screen reader support
- **Offline Support**: Basic functionality available without internet connection
- **Fast Performance**: Optimized bundle size and lazy loading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- World Air Quality Index API key
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/airwatch-aqi-monitor.git
   cd airwatch-aqi-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Required: World Air Quality Index API
   VITE_WAQI_API_KEY=your_waqi_api_key_here
   
   # Optional: Google Gemini AI (for chat assistant)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional: Custom API endpoints
   VITE_API_BASE_URL=https://api.waqi.info
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### API Keys Setup

#### World Air Quality Index API
1. Visit [WAQI API Token](https://aqicn.org/data-platform/token/)
2. Register for a free account
3. Generate your API token
4. Add it to your `.env` file as `VITE_WAQI_API_KEY`

#### Google Gemini AI (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

### Customization Options

#### Theme Configuration
Edit `tailwind.config.js` to customize colors and themes:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom AQI level colors
        'aqi-good': '#10b981',
        'aqi-moderate': '#f59e0b',
        // ... more customizations
      }
    }
  }
}
```

#### Feature Toggles
Disable features by modifying component imports in `src/App.tsx`:
```typescript
// Disable AI chat
// import GeminiChat from './components/GeminiChat';

// Disable maps
// import AQIMap from './components/AQIMap';
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

#### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in site settings

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context API
- **Routing**: React Router
- **Charts**: Chart.js + React Chart.js 2
- **Maps**: Leaflet
- **AI**: Google Gemini API
- **HTTP Client**: Axios

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AQICard.tsx     # Air quality display card
│   ├── SearchBar.tsx   # Smart city search
│   ├── AQIMap.tsx      # Interactive map
│   └── ...
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Home dashboard
│   ├── CityDetail.tsx  # Individual city view
│   └── About.tsx       # AQI information
├── utils/              # Utility functions
│   ├── aqiApi.ts       # API integration
│   ├── storage.ts      # Local storage management
│   └── aqiLevels.ts    # AQI calculation utilities
├── types/              # TypeScript type definitions
├── context/            # React context providers
└── styles/             # Global styles
```

### Data Flow
1. **User Input** → Search for city or select from favorites
2. **API Request** → Fetch data from WAQI API
3. **Data Processing** → Parse and validate AQI data
4. **State Update** → Update React context and local storage
5. **UI Render** → Display updated information with animations

## 🧪 Testing

### Unit Tests
```bash
npm run test
# or
yarn test
```

### E2E Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

### Linting & Type Checking
```bash
# ESLint
npm run lint

# TypeScript check
npm run type-check

# Fix auto-fixable issues
npm run lint:fix
```

## 🔍 API Reference

### WAQI API Endpoints
- **City Feed**: `https://api.waqi.info/feed/{city}/?token={token}`
- **Search**: `https://api.waqi.info/search/?keyword={keyword}&token={token}`
- **Map Stations**: `https://api.waqi.info/map/bounds/?latlng={lat1},{lng1},{lat2},{lng2}&token={token}`

### Response Format
```json
{
  "status": "ok",
  "data": {
    "aqi": 42,
    "idx": 1234,
    "city": {
      "name": "New York",
      "geo": [40.7128, -74.0060]
    },
    "dominentpol": "pm25",
    "iaqi": {
      "pm25": {"v": 28},
      "pm10": {"v": 35},
      "o3": {"v": 42}
    },
    "time": {
      "s": "2024-01-15 14:00:00",
      "tz": "-05:00"
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **World Air Quality Index Project** for providing comprehensive air quality data
- **Google** for Gemini AI integration
- **OpenStreetMap** for map data
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/airwatch-aqi-monitor/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/airwatch-aqi-monitor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/airwatch-aqi-monitor/discussions)
- **Email**: support@airwatch.com

## 🗺️ Roadmap

### Upcoming Features
- [ ] Push notifications for air quality alerts
- [ ] Weather data integration
- [ ] Air quality forecasting
- [ ] Social sharing capabilities
- [ ] Offline map caching
- [ ] Multi-language support
- [ ] Health impact calculator
- [ ] Data export functionality

### Version History
- **v1.0.0** - Initial release with core AQI monitoring
- **v1.1.0** - Added AI chat assistant
- **v1.2.0** - Enhanced mobile experience
- **v1.3.0** - Interactive maps and charts

---

Made with ❤️ for cleaner air and healthier communities.