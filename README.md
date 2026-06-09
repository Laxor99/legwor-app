# Legwor Labs Admin Portal

Személyes havi adminisztrációs webalkalmazás Ferenc Kiss számára – munkaidő, utazási elszámolás, számlák, fizetések, EUR/HUF árfolyam, email asszisztens és szerződéskezelés.

## Tech stack

- **Frontend/Backend:** SvelteKit
- **Adatbázis:** PostgreSQL + Drizzle ORM
- **Stílus:** Tailwind CSS v4
- **Export:** SheetJS (Excel), pdfmake (PDF)

## Telepítés

```bash
# PostgreSQL indítása
docker compose up -d

# Függőségek
npm install

# Környezeti változók
cp .env.example .env

# Adatbázis séma + seed
npm run db:push
npm run db:seed
```

## Fejlesztés

```bash
npm run dev
```

Az alkalmazás: http://localhost:5173

## Aktív hónap logika

Az app mindig **aktuális hónap − 1** adataival dolgozik (januárban az előző év decembere). A headerben választható másik hónap is.

## PIN védelem (opcionális)

Állítsd be a `.env` fájlban: `APP_PIN=1234` – belépéskor PIN kód kell. Ha üres, nincs védelem.

## PDF feltöltés

Számlákhoz és szerződésekhez PDF csatolható. Fájlok: `uploads/` mappa (`UPLOAD_DIR` env).

## Modulok

| Modul | Útvonal |
|-------|---------|
| Havi Összesítő | `/dashboard` |
| Munkaidő | `/worktime` |
| Utazási elszámolás | `/car` |
| Számlák | `/invoices` |
| Email Asszisztens | `/email` |
| EUR/HUF Árfolyam | `/rates` |
| Szerződések | `/contracts` |
| Fizetések | `/payments` |

## Cég adatok

**LEGWOR LABS SZÁMÍTÁSTECHNIKAI KERESKEDELMI ÉS SZOLGÁLTATÓ BETÉTI TÁRSASÁG**  
9700 Szombathely, Irottkő u. 5.  
Adószám: 21480799-2-18
