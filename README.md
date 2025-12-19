# GFK Begleiter 🦒

Ein empathischer KI-Chat basierend auf **Gewaltfreier Kommunikation (GFK)** nach Marshall B. Rosenberg.

![WhatsApp-Style Chat Interface](https://img.shields.io/badge/UI-WhatsApp%20Style-25D366?style=flat-square)
![DeepSeek AI](https://img.shields.io/badge/AI-DeepSeek-blue?style=flat-square)
![Netlify Ready](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square)

## ✨ Features

- **WhatsApp-ähnliches Design** – Vertraute, intuitive Chat-Oberfläche
- **GFK-geschulte KI** – Übersetzt "Wolfssprache" empathisch in "Giraffensprache"
- **4 Schritte der GFK** – Beobachtung, Gefühl, Bedürfnis, Bitte
- **100% Privat** – Serverless Function hält den API Key sicher
- **Mobile First** – Perfekt auf iPhone & Android
- **Dark Mode** – Automatische Anpassung an Systemeinstellungen

---

## 🚀 Deployment auf Netlify

### Schritt 1: Repository auf GitHub erstellen

1. Gehe zu [github.com/new](https://github.com/new)
2. Repository-Name: z.B. `gfk-begleiter`
3. Visibility: **Public** oder **Private**
4. **Create repository** klicken

### Schritt 2: Code hochladen

```bash
# Im Projektordner
git init
git add .
git commit -m "Initial commit: GFK Begleiter Chat App"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/gfk-begleiter.git
git push -u origin main
```

### Schritt 3: Auf Netlify deployen

1. Gehe zu [app.netlify.com](https://app.netlify.com)
2. **"Add new site"** → **"Import an existing project"**
3. **GitHub** auswählen und Repository verbinden
4. Build-Einstellungen werden automatisch aus `netlify.toml` gelesen
5. **"Deploy site"** klicken

### Schritt 4: API Key als Umgebungsvariable setzen ⚠️

**WICHTIG:** Nach dem ersten Deploy musst du den API Key hinzufügen:

1. Gehe zu **Site settings** → **Environment variables**
2. Klicke **"Add a variable"**
3. Setze:
   - **Key:** `DEEPSEEK_API_KEY`
   - **Value:** Dein DeepSeek API Key (beginnt mit `sk-...`)
4. Klicke **Save**
5. Gehe zu **Deploys** → **Trigger deploy** → **Deploy site**

🎉 **Fertig!** Deine App ist live und alle User nutzen deinen API Key.

---

## 🔑 DeepSeek API Key erstellen

1. Registriere dich bei [platform.deepseek.com](https://platform.deepseek.com/)
2. Gehe zu **API Keys**
3. Erstelle einen neuen Key
4. Kopiere den Key und füge ihn als Netlify Umgebungsvariable ein

---

## 📁 Projektstruktur

```
├── index.html              # Haupt-HTML mit UI
├── style.css               # Custom WhatsApp-Styling
├── script.js               # Chat-Logik & Frontend
├── netlify/
│   └── functions/
│       └── chat.js         # Serverless Function (API Proxy)
├── netlify.toml            # Netlify-Konfiguration
├── .gitignore              # Git Ignore-Regeln
└── README.md               # Diese Datei
```

---

## 🛡️ Sicherheit

- **API Key auf Server** – Key ist in Netlify Umgebungsvariablen gesichert
- **Kein Key im Frontend** – User sehen den API Key nie
- **CSP Headers** konfiguriert in `netlify.toml`
- **HTTPS only** auf Netlify

---

## 💡 Lokale Entwicklung

Für lokale Entwicklung mit Netlify Functions:

```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Projekt starten (mit Functions)
netlify dev
```

Oder ohne Functions (nur Frontend):

```bash
npx serve .
```

---

## 🦒 Was ist GFK?

Die **Gewaltfreie Kommunikation** ist ein Kommunikationsmodell von Marshall B. Rosenberg. Sie hilft, Konflikte zu lösen und echte Verbindung herzustellen durch:

1. **Beobachtung** – Was ist passiert? (ohne Bewertung)
2. **Gefühl** – Wie fühle ich mich dabei?
3. **Bedürfnis** – Was brauche ich?
4. **Bitte** – Worum möchte ich bitten?

---

## 📝 Lizenz

MIT License – Frei zur Nutzung und Modifikation.

---

**Made with 💚 for empathic connection**
