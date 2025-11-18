# LookTalkAI - AI Photo Analysis

An interactive web service where users upload a photo, and an AI analyzes it from the perspective of various personas, delivering the creative interpretation as a voice message.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the app**
   ```bash
   npm run dev
   ```

## 🎭 Features

- **AI Photo Analysis**: Advanced computer vision analysis of uploaded photos
- **Multiple Personas**: Choose from 11 unique AI personalities for different perspectives
- **Voice Interpretations**: High-quality text-to-speech delivery of analysis
- **Debate Mode**: Two personas debate about the same photo sequentially
- **Multi-language Support**: Korean, English, Chinese with voice synthesis
- **Secure Upload**: Clean, simple interface for photo uploads with drag & drop
- **Social Sharing**: Share to multiple platforms including KakaoTalk
- **Responsive Design**: Works perfectly on desktop and mobile
- **PWA Support**: Install as an app on any device
- **Completely Free**: 1000 free analyses per day

## 🧠 AI Personas

| Persona | Personality | Analysis Style |
|---------|-------------|----------------|
| **The Witty Entertainer** | Fun, charming, slightly sassy | Style, vibe, and stories behind the photo |
| **The Insightful Art Critic** | Professional, analytical | Composition, lighting, color theory, artistic merit |
| **The Warm Psychologist** | Empathetic, understanding | Emotions, mood, unspoken feelings |
| **The Gruff Sea Captain** | Weathered pirate with maritime wisdom | Nautical perspective with salty humor |
| **The Affectionate Nagging Mom** | Loving but constantly worrying mother | Maternal care with endless concerns |
| **The Energetic Streamer** | High-energy content creator | Explosive reactions and modern slang |
| **The Noir Detective** | World-weary investigator | Crime scene analysis with melancholic wisdom |
| **The Zombie** | Undead creature with primal instincts | Guttural sounds and primal reactions |
| **The Cute Affectionate Girl** | Sweet and charming with excessive cuteness | Adorable expressions and giggles |
| **The Clingy Ex-Boyfriend** | Overly attached former lover | Desperate attempts to reconnect |
| **The Bitter Ex-Girlfriend** | Resentful former lover | Sharp sarcasm and passive-aggressive commentary |

## 🛠 Technologies

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI Vision**: Gemini Vision API (photo analysis)
- **AI Script**: Gemini Flash (persona-driven interpretation)
- **Voice**: ElevenLabs API (high-quality TTS)
- **Database**: Supabase (sharing and storage)
- **Build**: Vite + PWA

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Ready**: Works without internet connection
- **App-like Experience**: Full-screen, native feel
- **Auto-updates**: Seamless updates when available

## 📱 Usage

### Single Analysis Mode
1. **Upload Photo** - Drag & drop or click to select (selfies work best)
2. **Choose Persona** - Select which AI personality to analyze your photo
3. **Get Analysis** - AI analyzes and delivers creative interpretation via voice
4. **Listen & Share** - Play, download, or share your personalized analysis

### Debate Mode
1. **Upload Photo** - Same photo upload process
2. **Choose Two Personas** - Select two different AI personalities
3. **Start Debate** - AI generates sequential conversation between personas
4. **Listen to Debate** - Enjoy mixed audio with both personas discussing the photo

## 🎯 Features

### Free Experience
- ✅ 1000 analyses per day
- ✅ 11 unique AI personas
- ✅ High-quality voice synthesis
- ✅ AI vision analysis
- ✅ Full audio player
- ✅ Multi-language support
- ✅ Social sharing
- ✅ Debate mode

### PWA Installation
- ✅ Install on mobile devices
- ✅ Install on desktop
- ✅ Offline functionality
- ✅ App-like experience

## 🔧 Development

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## 🚀 Deployment

The app is a pure client-side PWA that can be deployed to any static hosting service:

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables:
   - `VITE_GEMINI_API_KEY` (for AI vision analysis)
   - `VITE_ELEVENLABS_API_KEY` (for voice synthesis)
   - Voice IDs for each persona (see .env.example)

## 📄 License

MIT License

---

**Transform your photos into creative AI interpretations!** Upload, analyze, and listen to unique perspectives on your images from 11 different AI personas.