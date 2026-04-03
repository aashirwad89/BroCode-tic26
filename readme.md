TECHNOCRATS INNOVATION CHALLENGE 2026 Hackathon Project 

# ShadowSafe---AI-

## 🧠 Problem Statement

In real-life emergency situations, especially involving women’s safety, victims often face severe limitations:

* They cannot make calls for help
* They are unable to openly use their phones
* They cannot collect evidence due to fear, pressure, or threat
* Later, when reporting the incident, there is **no proof available**

### Core Problem:

> **How can someone secretly trigger help and collect strong evidence during an emergency without alerting the attacker?**

---

## 💡 Our Solution

We are building a **stealth-based mobile safety application** that works invisibly in critical situations.

### Key Idea:

A **secret trigger-based system** that:

* Activates silently in the background
* Starts collecting evidence automatically
* Sends alerts and live location to trusted contacts
* Works even without internet (via SMS fallback)

All of this happens **without the attacker knowing anything**.

---

## ⚙️ How It Works (Flow)

### 1. Secret Trigger Activation

User performs a hidden action:

* Multiple screen taps (e.g., 10–15 taps)
* OR hardware button pattern (power/volume sequence)
📳 Mobile shake detection — user shakes phone rapidly 2–3 times

➡️ App activates **silently in the background**

---

### 2. Stealth Mode Execution

* Screen appears normal or locked
* No visible UI change
* No sound or indication

➡️ Completely undetectable

---

### 3. Evidence Collection

Once activated:

* 🎤 Audio recording starts automatically
* 📷 (Optional) Front camera recording
* 📍 Live location tracking begins
* 🕒 Timestamp logging

---

### 4. Alert System

* Sends emergency alert to trusted contacts:

  * “I need help” message
  * Live location link
* Uses:

  * Internet (primary)
  * SMS (fallback if no internet)

---

### 5. Cloud Backup (Critical Feature)

* All recordings are uploaded automatically
* Ensures:

  * Data is safe even if phone is destroyed
  * Evidence cannot be deleted locally

---

## 🎯 MVP Scope (Hackathon Build)

We will focus only on **core functionality** for the hackathon:

### Must-Have Features:

* Secret trigger system (tap/button pattern)
📳 Shake detection (important addition)
* Background audio recording
* Location tracking (GPS)
* SMS-based alert system
* Basic UI for setup (contacts, permissions)

### Optional (If time allows):

* Camera recording
* Cloud upload (basic version)
* Live tracking dashboard

---

## 🤖 AI Chatbot (RAG-Based Legal Assistant)

### Purpose:

To help users understand:

* Legal rights
* IPC sections related to harassment/assault
* Immediate steps to take in emergencies

### Features:

* Answers queries like:

  * “What to do in harassment case?”
  * “Which IPC section applies?”
  * “How to file FIR?”
* Retrieval-based system (RAG):

  * Uses stored legal documents
  * Provides accurate, context-aware answers

---

## 🏗️ Tech Stack

### 📱 Frontend (Mobile App)

* React Native
* Expo (for faster development)
* Sensors API (for shake detection using accelerometer)
* Native modules (for hardware button detection)

---

### ⚙️ Backend

* Node.js
* Express.js

---

### 🗄️ Database

* MongoDB
* Stores:

  * User data
  * Emergency contacts
  * Logs

---

### ☁️ Cloud & Storage

* Firebase / AWS S3 (for storing recordings)
* Real-time upload of evidence

---

### 📡 Communication

* SMS API (e.g., Twilio / Fast2SMS)
* Push notifications (optional)

---

### 📍 Location Services

* React Native Location APIs
* Google Maps API (for tracking)

---

### 🤖 AI Chatbot (RAG)

* Backend: Node.js / Python (optional microservice)
* Embeddings: OpenAI / HuggingFace
* Vector DB: Pinecone / FAISS
* Data: Legal documents (IPC sections, safety laws)

---

## 👥 Team Responsibilities (Suggested Split)

### 1. Frontend Developer

* Build UI (minimal but functional)
* Handle trigger system integration
* Permissions handling

---

### 2. Backend Developer

* API development
* Database setup
* Cloud upload integration

---

### 3. AI/ML Developer

* Build RAG chatbot
* Prepare legal dataset
* Integrate query-response system

---

## 🔐 Key Features Summary

* ✅ Invisible activation system
* ✅ Background audio/video recording
* ✅ Live location tracking
* ✅ Emergency SMS alerts
* ✅ Cloud evidence backup
* ✅ Legal AI chatbot (RAG-based)

---

## 🚀 Why This Project Stands Out

| Normal Apps ❌                | Our Solution ✅                        |
| ---------------------------- | ------------------------------------- |
| Visible SOS button           | Completely hidden trigger             |
| Manual interaction needed    | Automatic background execution        |
| Easy to detect               | Fully stealth mode                    |
| Limited real-world usability | Designed for real emergency scenarios |

---

## 📌 Final Goal

To create a **real-world usable safety system** that:

* Works under pressure
* Protects the user silently
* Ensures **help reaches fast**
* Preserves **undeniable evidence**

---

## ⚠️ Important Notes

* Privacy and security are critical
* Permissions must be handled transparently during setup
* App should be optimized for:

  * Low battery usage
  * Fast activation
  * Reliability

---

## 🏁 Hackathon Strategy

Focus on:

1. Working trigger system
2. Reliable audio recording
3. SMS alert functionality

👉 Even a simple but **working MVP** will have strong impact.

---

If executed correctly, this project is not just a hackathon idea — it has **real startup potential**.

