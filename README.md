# SAMIDAK Invoice System

A professional offline-first invoice, quotation, and waybill management system.

## Features

- 📄 Create Invoices, Quotations, and Waybills
- 🔢 Automatic unique serial numbers (INV-2025-00001, QUO-2025-00001, WBL-2025-00001)
- 📱 Fully responsive - works on desktop, tablet, and mobile
- 🔌 Works offline (PWA with IndexedDB storage)
- 🖨️ Print and download as PDF
- 💰 Multi-currency support (NGN, USD, EUR, GBP)
- 👥 Customer management
- ⚙️ Customizable company settings

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/samidak-invoice)

### Option 2: CLI Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Git Integration
1. Push this project to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy automatically

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Dexie.js (IndexedDB wrapper)
- jsPDF (PDF generation)
- next-pwa (Service Worker)
- Zustand (State management)

## Offline Support

The app works completely offline after the first visit. All data is stored locally in IndexedDB and the app can be installed as a PWA on any device.
