# 📦 Raktárkezelő Webalkalmazás

Egyszerű, magyar nyelvű raktárkezelő kis családi vállalkozás számára. Vonalkódos termékbevételezés és kivételezés, készletnyilvántartás, mobilon is használható felület.

## Funkciók

- **Irányítópult** — összesítő kártyák + utolsó mozgások
- **Készlet** — termékek listája kategória-szűréssel, státuszokkal (Rendben / Alacsony / Elfogyott)
- **Bevételezés** — vonalkód beolvasás → mennyiség → készlet növelése + naplózás
- **Kivételezés** — vonalkód beolvasás → mennyiség → készlet csökkentése + naplózás (negatív készlet ellenőrzéssel)
- **Termékek** — termékek felvitele, szerkesztése, törlése
- **Kategóriák** — kategóriák kezelése (Konnektorok, Klímák, Vezetékek, Kapcsolók, Csavarok, Szerszámok, Egyéb)
- **Mozgások** — minden bevételezés és kivételezés naplózása
- **Vonalkód-olvasó támogatás** — külső vonalkódolvasó Enter-rel küldi a kódot
- **Reszponzív dizájn** — mobilon és asztali gépen is jól használható

## Technológiák

- **Frontend:** React + Tailwind CSS (Vite build)
- **Backend:** Node.js + Express
- **Adatbázis:** SQLite (better-sqlite3)
- **Nyelv:** Magyar

## Telepítés és indítás (helyi)

```bash
# 1. Lépj be a projekt mappába
cd Raktar_app

# 2. Telepítsd a függőségeket
npm install

# 3. Build-eld a frontendet
npm run build

# 4. Indítsd a szervert
npm run server

# Az alkalmazás elérhető: http://localhost:3000
```

Vagy egy paranccsal:

```bash
npm start
```

Ez build-eli a frontendet, majd indítja a szervert.

## Használat

### Vonalkódos bevételezés / kivételezés

1. Kattints a **Bevételezés** vagy **Kivételezés** menüpontra
2. Olvasd be a vonalkódot vonalkódolvasóval (vagy írd be kézzel)
3. Nyomj Enter-t (vagy kattints a Keresés gombra)
4. Add meg a mennyiséget
5. Kattints a Bevételezés / Kivételezés gombra

### Új termék felvitele

1. Kattints a **Termékek** menüpontra
2. Kattints az **+ Új termék** gombra
3. Töltsd ki az adatokat (név és vonalkód kötelező)
4. Kattints a **Létrehozás** gombra

### Kategória szerinti szűrés

A **Készlet** oldalon válassz kategóriát a legördülő listából.

## Alapértelmezett tesztadatok

Az alkalmazás első indításakor automatikusan létrejönnek:

- 7 kategória (Konnektorok, Klímák, Vezetékek, Kapcsolók, Csavarok, Szerszámok, Egyéb)
- 3 példa termék:
  - Schneider konnektor (vonalkód: 5991234567890, készlet: 25 db)
  - Réz vezeték 3x1,5 (vonalkód: 5999876543210, készlet: 120 méter)
  - Klíma beltéri egység (vonalkód: 5991111222233, készlet: 5 db)

## Railway deploy

A projekt tartalmaz `railway.toml` konfigurációt:

```bash
# Railway-en automatikusan:
# - Build: npm install && npm run build
# - Start: node server/index.js
# - Port: a Railway által beállított PORT környezeti változó (alapértelmezetten 3000)

# Kézi deploy:
# 1. Hozz létre egy új projektet a Railway-en
# 2. Kapcsold össze a GitHub repóval
# 3. Railway automatikusan felismeri a railway.toml-t és deploy-ol
```

Fontos: Az SQLite adatbázis fájl (`raktar.db`) az alkalmazás mappájában jön létre. Railway-en a free tier-en az adatok a deploy-ok között megmaradnak, de érdemes persistent volume-ot beállítani az adatbázis fájl számára.

## Projekt szerkezet

```
Raktar_app/
├── index.html              # Belépési pont
├── package.json            # Függőségek és script-ek
├── railway.toml            # Railway deploy konfiguráció
├── vite.config.js          # Vite konfiguráció (fejlesztés)
├── tailwind.config.js      # Tailwind CSS konfiguráció
├── postcss.config.js       # PostCSS konfiguráció
├── server/
│   ├── index.js            # Express szerver
│   ├── database.js         # SQLite adatbázis inicializálás + seed
│   └── routes.js           # API végpontok
├── src/
│   ├── main.jsx            # React belépési pont
│   ├── App.jsx             # Fő komponens (navigáció)
│   ├── api.js              # API kliens
│   ├── index.css           # Tailwind + egyéni stílusok
│   ├── components/
│   │   └── Layout.jsx      # Elrendezés (fejléc, menü, tartalom)
│   └── pages/
│       ├── Dashboard.jsx   # Irányítópult
│       ├── Stock.jsx       # Készlet
│       ├── StockIn.jsx     # Bevételezés
│       ├── StockOut.jsx    # Kivételezés
│       ├── Products.jsx    # Termékek
│       ├── Categories.jsx  # Kategóriák
│       └── Movements.jsx   # Mozgások
└── dist/                   # Build-elt fájlok (npm run build után)
```

## Fejlesztés

```bash
# Frontend fejlesztői szerver (hot reload)
npm run dev
# Elérhető: http://localhost:5173
# API proxy: a /api kérések a 3000-es portra mennek

# Backend szerver külön
npm run server
# Elérhető: http://localhost:3000
```
