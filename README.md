# GFK Begleiter 🦒

Ein empathischer KI-Chat basierend auf **Gewaltfreier Kommunikation (GFK)** nach Marshall B. Rosenberg.

![WhatsApp-Style Chat Interface](https://img.shields.io/badge/UI-WhatsApp%20Style-25D366?style=flat-square)
![DeepSeek AI](https://img.shields.io/badge/AI-DeepSeek-blue?style=flat-square)
![Netlify Ready](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square)

## ✨ Features

- **WhatsApp-ähnliches Design** – Vertraute, intuitive Chat-Oberfläche
- **GFK-geschulte KI** – Übersetzt "Wolfssprache" empathisch in "Giraffensprache"
- **4 Schritte der GFK** – Beobachtung, Gefühl, Bedürfnis, Bitte
- **100% Privat** – API-Key bleibt lokal im Browser
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

🎉 **Fertig!** Deine App ist in wenigen Sekunden live.

---

## 🔑 DeepSeek API Key

Die App benötigt einen DeepSeek API Key, den jeder Nutzer selbst eingibt:

1. Registriere dich bei [platform.deepseek.com](https://platform.deepseek.com/)
2. Erstelle einen API Key
3. Gib den Key beim ersten App-Start ein

> **Sicherheit:** Der Key wird nur lokal im Browser gespeichert (`localStorage`) und nie an fremde Server gesendet.

---

## 📁 Projektstruktur

```
├── index.html      # Haupt-HTML mit UI
├── style.css       # Custom WhatsApp-Styling
├── script.js       # DeepSeek Integration & Chat-Logik
├── netlify.toml    # Netlify-Konfiguration
├── .gitignore      # Git Ignore-Regeln
└── README.md       # Diese Datei
```

---

## 🛡️ Sicherheit

- **CSP Headers** konfiguriert in `netlify.toml`
- **Kein Backend** – Alle Daten bleiben im Browser
- **HTTPS only** auf Netlify

---

## 💡 Lokale Entwicklung

```bash
# Option 1: Mit npx serve
npx serve .

# Option 2: Mit Python
python -m http.server 8000

# Option 3: Mit VS Code Live Server Extension
```

Öffne dann `http://localhost:8000` (oder den angezeigten Port)

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
