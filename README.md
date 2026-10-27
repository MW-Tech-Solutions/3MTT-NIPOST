# RescuePost NG
### Bilingual (Hausa/English) Emergency & Fire Dispatch PWA
**Powered by NIPOST National Digital Postcode API, Naija Speech ASR, and Google Gemini**

RescuePost NG is a production-grade civic-tech emergency dispatch Progressive Web App (PWA) designed for citizens and emergency response agencies across Nigeria. It enables citizens—particularly Hausa speakers in high-density markets, rural communities, and urban hubs—to trigger an instant **1-tap voice SOS** during fire outbreaks or emergencies.

The system processes indigenous voice audio via **NCAIR1 / Naija Speech ASR**, triages the incident with **Google Gemini (gemini-2.5-flash)**, resolves exact rooftop coordinates and building use status using **Nigeria's NIPOST Digital Postcode API (`api.postcode.gov.ng`)**, and routes the dispatch ticket to the assigned Fire Station command desk with real-time perimeter evacuation controls.

---

## System Architecture

```
[ Citizen Mobile PWA (Hausa/English Voice SOS) ]
                      │
           (1-Tap Voice Recording)
                      ▼
   [ Express.js Backend Server (:5000) ]
       ├── 1. NCAIR1 / Naija Speech ASR (Hausa Speech-to-Text)
       ├── 2. Google Gemini 2.5 Flash (Triage, Number Normalization & Translation)
       ├── 3. NIPOST Postcode API (Assembly & Level-5 Rooftop Verification with X-API-Key)
       ├── 4. Admin Access Guard (Code: 12345678)
       ├── 5. Firebase Firestore (Live Emergency Tickets Collection)
       └── 6. 1-Click Sector Evacuation Broadcast (NIPOST District Grid)
                      │
                      ▼
[ Federal Fire Service Command Desk (Real-Time Dispatch Console & Map) ]
```

---

## Key Features

1. **Pure Mobile Citizen View:**
   - Default user interface is strictly a streamlined, mobile-first emergency app with a high-visibility SOS button.
   - Citizens can cache their 11-character postcode (e.g. `FC-01-A01-KP-27`) for offline emergency readiness.
   - Audio feedback and reassuring voice responses in authentic Hausa and English.

2. **Dispatcher Admin Authorization (Access Code: `12345678`):**
   - The Fire Command Center is protected by security access code **`12345678`**.
   - Admin actions (status updates, perimeter evacuation broadcasts) require validated access credentials via `x-admin-code`.
   - Dispatchers can toggle between Command Console and Split-Screen Pitch View, or lock the console.

3. **NIPOST API Key & Map Layer Integration:**
   - Leaflet map utilizes the official NIPOST API Key (`X-API-Key`) for Level-5 rooftop telemetry, verification stamps, and 500m evacuation perimeter zones.
   - Verified rooftop markers show exact building use status, landmark, and assigned Fire Station.

4. **1-Tap Voice SOS & Number Normalization:**
   - Built-in acoustic and linguistic intelligence converts spoken Hausa numbers into normalized alphanumeric unit codes (e.g., *"K-P ashirin da bakwai"* -> `KP-27`, *"SB goma sha tara"* -> `SB-19`).

5. **100% Semantic Font Awesome Icons:**
   - All legacy emojis have been upgraded to scalable, professional civic-tech vector icons.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
```ini
PORT=5000
NODE_ENV=development

# NIPOST Postcode API
NIPOST_BASE_URL=https://api.postcode.gov.ng/v1
NIPOST_API_KEY=your_nipost_key

# NCAIR1 / Naija Speech ASR
NAIJA_ASR_API_URL=https://asr.naijallm.com/v1/audio/transcriptions
NAIJA_ASR_API_KEY=your_naija_asr_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_key

# Admin Security Access Code
ADMIN_ACCESS_CODE=12345678
```

### 3. Run the Server
```bash
npm start
```
Open **http://localhost:5000** in your browser.

---

## Security & Dispatcher Credentials

- **Admin Access Code:** `12345678`
- **Protected Actions:** 
  - Status updates (`EN_ROUTE`, `ON_SCENE`, `RESOLVED`)
  - Perimeter Evacuation Broadcasts (`/api/v1/emergency/broadcast-evacuation`)
  - Full Command Center Telemetry
