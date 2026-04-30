# Headshot Generator

AI-powered professional headshot generator. Upload face photos, configure enhancements, download LinkedIn-ready portraits.

## Stack

- Next.js 14 (App Router)
- Replicate API (GFPGAN, Real-ESRGAN, SDXL)
- Tailwind CSS
- Vercel deployment

## Features

- **Multi-image input** — Upload 1-4 reference photos for better face representation
- **Background options** — Keep original, blur, or replace with studio/office backgrounds
- **Enhancement pipeline** — Face enhancement (GFPGAN), quality upscaling (Real-ESRGAN), background processing (SDXL)
- **Color grading** — Natural, warm, cool, vibrant, corporate styles
- **Skin smoothing** — Optional face enhancement

## How it works

1. User uploads face photos
2. Photos sent to Replicate API for headshot generation
3. Multi-step enhancement: face → quality → background → color
4. Returns downloadable professional headshot

## Setup

```bash
npm install
cp .env.example .env
# Add REPLICATE_API_TOKEN to .env
npm run dev
```

## Environment

```
REPLICATE_API_TOKEN=r8_...
```

## Status

Experimental side project. Functional but not production-hardened.
