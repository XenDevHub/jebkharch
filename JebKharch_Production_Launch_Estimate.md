# 📋 Project Launch Proposal & Cost Estimation
**Project Name:** Jeb Kharch – Mobile Quiz & Earning Platform  
**Target Market:** Pakistan  
**Document Type:** Production Launch Checklist & Pay-As-You-Go Cost Estimation  
**Date:** July 30, 2026  

---

## 🎯 Executive Summary: Pay-As-You-Go Lean Launch Model

The **Jeb Kharch** ecosystem (Mobile Application, NestJS API Backend, PostgreSQL Database, and React Admin Panel) is architected using a **Pay-As-You-Go / Scale-as-you-grow** strategy. 

This model minimizes fixed upfront capital requirements. In the initial launch phase, operational costs remain extremely low and scale dynamically only as active daily users (DAU) and quiz traffic grow.

---

## 📑 1. Financial Cost Breakdown

### 1.1 One-Time Fixed Upfront Costs (Initial Setup)

These are mandatory one-time setup expenses required before publishing the application to the Google Play Store.

| Sl. | Item / Asset | Provider / Description | Billing Type | Cost (USD) |
| :---: | :--- | :--- | :---: | :---: |
| 1.1 | **Google Play Developer Account** | Google Play Console (Mandatory for Android release) | One-time | **$25.00** |
| 1.2 | **Custom Domain Name (`.com`)** | Namecheap / Cloudflare (For API & Admin Panel subdomains) | Yearly | **~$12.00 / yr** |
| 1.3 | **Apple Developer Account *(Optional)*** | Apple App Store (Only required if launching iOS version) | Yearly | *$99.00 / yr (Optional)* |
| **TOTAL** | **Mandatory Upfront Fixed Setup Cost** | | **Initial** | **~$37.00 - $40.00** |

---

### 1.2 Monthly Pay-As-You-Go Infrastructure & Services (Scale-as-You-Grow)

These services scale flexibly based on traffic, user signups, and active quiz sessions.

| Sl. | Service Description | Service Provider & Capacity | Tier / Pricing Model | Estimated Starting Cost (USD) |
| :---: | :--- | :--- | :---: | :---: |
| **2.1** | **Cloud VPS Server** | Hetzner / Vultr / DigitalOcean (2GB RAM, 2 Core CPU) | Pay-As-You-Go (Monthly) | **~$5.00 - $8.00 / mo** |
| **2.2** | **CDN & SSL Security** | Cloudflare Free Tier (DDoS protection, Global CDN) | Free Tier | **$0.00** |
| **2.3** | **Cloud Storage (Media/Avatars)** | Cloudflare R2 ($0 Egress fees / 10GB free storage) | Pay-As-You-Go | **$0.00** *(Free initially)* |
| **2.4** | **OTP SMS Verification Gateway** | Local Pakistan SMS API (e.g. BrandSMS, Infobip, Twilio) | Pay-As-You-Go (~$0.003/SMS) | **~$3.00 - $5.00** *(Per 1,000 users)* |
| **2.5** | **Push Notifications** | Google Firebase Cloud Messaging (FCM) | Free Tier | **$0.00** |
| **2.6** | **Ad Monetization Platform** | Google AdMob Integration | Free | *Revenue Earning Channel* |
| **2.7** | **AI Question Generator *(Optional)*** | OpenAI API (`gpt-4o` / `gpt-4o-mini`) | Pay-As-You-Go | **~$1.00 - $3.00 / mo** *(or $0 using seeded Qs)* |
| **2.8** | **Support & System Email** | Resend / Brevo / SMTP (Up to 3,000 emails/mo) | Free Tier | **$0.00** |
| **TOTAL** | **Estimated Month 1 Operating Infrastructure** | *(Scales with user volume)* | **Monthly** | **~$5.00 - $13.00 / mo** |

---

## 🔑 2. Required Client Accounts & Access Credentials

To deploy and configure the production environment seamlessly, the engineering team will require access to the following accounts/keys from the client:

1. **Google Play Console Account**: Access or invite to publish the Android `.aab` app bundle.
2. **Google Play Developer API Service Account**: Service Account JSON key to validate Google Play In-App Billing (IAP) for Pro Subscriptions.
3. **Domain Registrar / DNS Access**: Registrar login or Cloudflare access to map `api.jebkharch.com` and `admin.jebkharch.com`.
4. **Pakistan OTP SMS Gateway Credentials**: Account API key & Sender ID from a regional SMS vendor (BrandSMS, Infobip, or Twilio) for sending +92 OTPs.
5. **Google AdMob Account**: App ID and Ad Unit IDs (Banner Ads & Rewarded Video Ads) for revenue tracking.
6. **Firebase Console Project**: For push notification configuration (`google-services.json` file & FCM Server Key).
7. **OpenAI API Key *(Optional)***: Required only if automated AI-driven question generation is enabled (`OPENAI_API_KEY`).
8. **Support Email Account**: Active email address (e.g., `support@jebkharch.com`) or API Key (Resend/Brevo) for user support.

---

## 🎨 3. Required Branding & Visual Store Assets

The client or graphic design team must provide the following high-resolution assets for Google Play Store listing:

* 📱 **App Icon**: `1024 x 1024 px` PNG (High Resolution, Transparent or Solid Background).
* 🚀 **Splash Screen Logo**: Vector SVG or high-resolution transparent PNG logo for app startup screen.
* 🖼️ **Feature Graphic Banner**: `1024 x 500 px` PNG/JPG for Google Play Store store page header.
* 📸 **App Store Screenshots**: 4–6 high-quality screenshots showcasing key app screens (Quiz, 1v1 Battle, Wallet, Rewards).

---

## 📜 4. Legal & App Store Compliance Requirements

Google Play Store enforces strict guidelines for reward and cash-earning applications:

* 🔒 **Privacy Policy Webpage**: A publicly accessible URL explaining data handling (phone number, device IDs, wallet details).
* 📜 **Terms of Service Webpage**: Rules governing quiz participation, anti-cheating policies, and payout terms.
* ✉️ **Support Email**: Official contact email listed publicly on the Play Store page.

---

## 💰 5. Operational Capital & Local Payout Channels (Pakistan)

Because **Jeb Kharch** features direct cash withdrawals for Pakistani users:

* 💳 **Supported Payout Channels**:
  * **JazzCash**
  * **Easypaisa**
  * **SadaPay / NayaPay**
  * **Direct Bank Transfer (IBFT Pakistan)**
* 🏦 **Payout Disbursement Account**: An active JazzCash/Easypaisa business account or bank account for sending cash to users upon admin payout approval.
* 💵 **Initial Reserve Liquidity Pool**: Recommended starting reserve pool (**PKR 15,000 - PKR 30,000**) reserved for fulfilling user reward cashouts.

---

## 🛡️ 6. Data Security & Disaster Recovery Strategy

To ensure absolute protection of user wallet balances, transaction records, and quiz stats:

* 🔄 **Automated Daily Database Dumps**: Scheduled cron job executing encrypted PostgreSQL database backups.
* ☁️ **Offsite Storage Replication**: Daily database snapshots synced automatically to Cloudflare R2 / AWS S3 storage.

---

### 📝 Document Authorization & Sign-Off

*This document represents an official, client-ready proposal and technical prerequisite checklist for deploying the Jeb Kharch ecosystem into production in Pakistan under a Pay-As-You-Go model.*

**Prepared by:** Engineering Team  
**Document Status:** Approved & Ready for Client Delivery  
