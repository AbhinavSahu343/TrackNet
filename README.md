# 🚆 Tracknet: Seamless Connectivity & Offline Intranet for Railways

Tracknet is a low-cost, plug-and-play Edge-AI hardware and software gateway designed to solve the critical digital connectivity gap during transit. The system uses smart multi-carrier bandwidth aggregation to combat fluctuating cellular signals and provides a fully localized offline captive portal when crossing cellular dead zones.

---

## 🚨 The Problem: The Transit Blackout

For millions of train passengers, there is no reliable onboard internet connection. When trains enter tunnels, valleys, or rural dead zones, connectivity is lost entirely, leaving passengers without essential travel information, SOS alerts, and offline services.

### The Journey of Rakesh

Meet Rakesh, an ambitious professional traveling on a 15-hour train journey to a critical career interview. While trying to review preparation materials online, the train enters a rural valley. His connection drops to 0%, leaving him staring at a spinning loader. He has no way to track his live train status, notify others of delays, or access emergency services — his digital agency is completely stripped away.

### Why Current Solutions Fail

Existing hardware and software approaches leave passengers vulnerable through three compounding design failures:

- **The Single-Carrier Trap** — Standard mobile devices are locked to one network at a time. When that carrier fails, the passenger is completely isolated, even if competing networks (Airtel, Vi) have available signal on the same corridor.
- **Reactive Switching Lag** — Existing routers wait until signal reaches 0% before initiating a carrier switch. This causes massive packet loss, broken TCP sessions, and dropped calls during the handoff window, often lasting 10–30 seconds.
- **Cloud Dependency Failure** — Passenger portals and assistance systems break entirely in tunnels because they lack local server-side logic. There is no on-device intelligence to serve any request when the upstream cloud is unreachable.

---

## 💡 The Solution: Software-Defined Edge Gateway

Tracknet is a compact, retrofittable gateway requiring no major infrastructure rebuild. It provides high-speed onboard internet connectivity and a seamless local offline mode when external connectivity drops to zero.

```
                   [ ONLINE ZONE ]
[ Passenger Mobile ] <──(Wi-Fi)──> [ Edge Gateway ] <──(Aggregated WAN)──> [ Cloud Services ]
                                          │
                                          ▼ [ DEAD ZONE ] (Internet Drops to 0%)
                                   [ Captive Portal ]
                                   ├─ Real-time Offline GPS Mapping
                                   ├─ Quantized Offline LLM Assistant
                                   └─ Transactional Offline Food Booking Queue
```

---

## 📋 Key Features

### 1. Predictive Multi-Carrier Aggregation
- **The Tech:** Dynamically binds cellular WAN connections from Jio, Airtel, and Vi into a single stable pipe on an edge gateway.
- **Edge ML:** A local Python predictive model analyzes real-time GPS coordinates against route signal logs to predict upcoming cellular dropouts 60 seconds early.
- **The Action:** Pre-emptively shifts routing tables to the strongest carrier before packet loss occurs, bypassing the "Single-Carrier Trap."

### 2. Offline GPS Journey Mapping
- **Zero-Data Telemetry:** Streams real-time latitude and longitude coordinate telemetry from the train's local microcontroller directly to passenger devices over low-latency WebSockets.
- **The UI/UX:** Renders high-fidelity interactive route maps on the client side using Next.js App Router, Tailwind CSS, and Spline 3D animations — operating 100% offline on the local coach network.

### 3. Local Offline Agentic Assistance
- **Hybrid AI Routing:** Uses the Vercel AI SDK to stream cloud-based responses via a cloud LLM when cellular WAN is active.
- **Local Fallback:** When a complete blackout is detected, queries are automatically re-routed to an offline server.
- **Zero-Cloud Reasoning:** Processes natural language passenger queries locally using a quantized local LLM running directly on the edge gateway's NPU.

### 4. Transactional Offline Food Booking Queue
- **Local Commerce:** Allows passengers to browse station menus and place orders inside dead zones.
- **IndexedDB Caching:** Next.js intercepts failed order requests, serializing and saving them to a local browser transaction queue.
- **Auto-Cloud Sync:** A background thread on the gateway monitors cellular latency and automatically synchronizes queued transactions back to the cloud database the instant signal is restored.

---

## 🛠️ The Developer Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend & Design** | React, Next.js App Router, Tailwind CSS, Spline (3D journey visualization), Figma |
| **Backend & Database** | Node.js, Next.js API Routes, WebSockets, Supabase (PostgreSQL + Auth) |
| **Edge & AI** | Raspberry Pi 5 (central gateway, local server, ML inference engine), ESP32 (peripheral sensing), Python (predictive ML signal model), Gemini API & Vercel AI SDK |
| **Deployment** | Vercel (global CDN for cloud portal), Local Linux Server (on Pi 5 for edge deployment) |

---

## 📁 System Architecture: Cloud-to-Edge Sync

The architecture is divided into two operational states:

**Internet Layer — Connected Mode**
Aggregated Cellular WAN (Jio / Airtel / Vi) ──> Raspberry Pi 5 Gateway ──> Vercel AI SDK for full cloud-based reasoning, live map data, and passenger services. Multi-WAN bonding ensures the highest available bandwidth is always used.

**Local Layer — Tunnel Mode Fallback**
ESP32 sensors monitor environment ──> Raspberry Pi 5 Local Server (Next.js) ──> Localized captive portal serving cached maps, offline AI assistance, and critical safety information via WebSockets — fully functional with zero internet connectivity.

```
tracknet/
├── tracknet-frontend/            # Next.js App Client
│   ├── src/
│   │   ├── app/                  # Application Routes (Passenger Portal & Admin Telemetry)
│   │   ├── components/           # Reusable UI Elements (ConnectionBanner, SignalCard, FoodMenu)
│   │   ├── hooks/                # Client-Side Hooks (useOfflineQueue for IndexedDB transactions)
│   │   └── styles/                # Global Tailwind CSS Stylesheets
├── tracknet-backend/              # Node.js API & WebSocket Server
│   ├── server.js                  # Local WebSocket broadcaster & cellular switching router
│   └── database/                  # Local database syncing schemas
└── tracknet-hardware/             # Microcontroller telemetry scripts
    ├── esp32_telemetry.py         # GPS & cellular RSSI sensor polling script
    └── predictive_model.py        # Python-based carrier signal threshold predictor
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- Python (v3.10 or higher)
- Edge hardware (Raspberry Pi 5 & ESP32) is optional; simulation scripts are included for evaluation.

### 1. Client Setup (Next.js & Tailwind)
```bash
cd tracknet-frontend
npm install
npm run dev
```

### 2. Local Edge Server Setup (Node.js & WebSockets)
```bash
cd tracknet-backend
npm install
node server.js
```

### 3. Hardware Simulation Layer (Python)
To test the live coordinate streaming and signal switching logic without physical hardware, run the simulation script:
```bash
cd tracknet-hardware
pip install -r requirements.txt
python predictive_model.py
```

---

## 🎬 Demo Walkthrough: "The Tunnel Blackout" Test

To execute a flawless 90-second demo:

1. **Active Signal Monitoring (0–30s)** — Open the Admin Telemetry Dashboard. Show active aggregated signal graphs (Jio, Airtel, Vi) moving dynamically as coordinates stream from the simulated ESP32.
2. **Pulling the Plug (30–60s)** — Disconnect your machine's WAN network. The global connection status banner instantly transitions to Local Edge Mode without a single page reload or error crash.
3. **Offline Continuity (60–90s)** — Show that the train's 3D route map continues to update. Place a food order; the UI displays an offline notification: *"Order cached in local transaction queue."* Restore internet; show the transaction instantly syncing and updating in your cloud database dashboard.

---

## 📈 Scalability & Future Scope

- **Infinite Scaling (Coach-to-Network):** Designed to scale from a single coach to an entire route corridor to the national rail grid with zero coach structural modifications.
- **The €150 Retrofit Advantage:** A plug-and-play edge hardware setup (Raspberry Pi 5 + ESP32) bypasses multi-billion-rupee telecom or rail line overhauls.
- **High-Concurrency Stability:** Local query queueing and static caches support hundreds of concurrent passenger devices per carriage.
- **Multilingual Voice Assistant:** Integrating automated local spoken-language translation layers for diverse regional languages and digital literacy levels.
- **Richer Transit Intelligence:** Fetching and caching deeper real-world data, including live station platform layouts and localized weather alerts.
- **Central Railway API Integration:** Direct telemetry from national railway scheduling networks instead of local microcontroller simulation. GPS sensors to official, real-time national railway scheduling feeds [246].
