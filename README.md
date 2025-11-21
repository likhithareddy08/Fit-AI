# 📘 AI Fitness Coach

## 🏋️‍♂️ Project Overview
AI Fitness Coach is a smart web application that provides AI-powered workout suggestions, diet recommendations, and fitness tracking features. It is built using modern web technologies including React, TypeScript, and TailwindCSS.  


## 🚀 Features

### 🧠 AI-Powered Fitness Suggestions
- Personalized workout recommendations  
- Diet and calorie guidance  
- Intelligent exercise planning  

### 📊 Interactive Dashboard
- Track user progress  
- View workout history  
- Analyze calorie intake and activity
  

### 🎨 Modern UI/UX
- Clean responsive interface  
- Built with React + TailwindCSS  
- Smooth interactions with ShadCN components  


## 📁 Project Structure

```
ai-fitness-coach-main/
│
├── public/
│ └── (images, icons, static assets)
│
├── src/
│ ├── assets/
│ ├── components/
│ ├── pages/
│ ├── utils/
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
│
├── supabase/
│ ├── config.toml
│ ├── functions/
│ │ ├── ai-coach/
│ │ │ └── index.ts
│ │ └── analyze-nutrition/
│ │ └── index.ts
│ └── migrations/
│ ├── 20251121062044_.sql
│ └── 20251121062118_.sql
│
├── .env
├── .gitignore
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```
---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ai-fitness.git
cd ai-fitness-coach-main
```
2️⃣ Install Dependencies
```
npm install
or
bun install
```
3️⃣ Configure Environment Variables
Create a .env file in the root folder:

```
VITE_API_KEY=your_api_key_here
```
4️⃣ Run the Development Server
```
npm run dev
```
5️⃣ Create a Production Build
```
npm run build
```
6️⃣ Preview the Build
```
npm run preview
```
