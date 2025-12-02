# Riccardo Ungaro – CV

Curriculum vitae statico, data-driven (JSON), con tema scuro/chiaro, layout reattivo e stili di stampa.

## Caratteristiche
- Contenuti da JSON (`data/*.json`) caricati via `fetch`
- SEO: meta tag e JSON‑LD (`Person`) generato in runtime
- Tema: segue quello di sistema di default; toggle per forzare Light/Dark (con salvataggio)
- Responsive: layout adattivo, avatar e spaziature fluide; avatar sotto il nome su mobile
- Stampa: fogli di stile dedicati per esportazione pulita in PDF
- Avatar: supporto a immagine personalizzata con fallback automatico (UI Avatars)

## Struttura
```
index.html
styles.css
scripts.js
data/
  contacts.json
  education.json
  experience.json
  profile.json
  skills.json
```

## Avvio locale
Aprire con un piccolo server locale (necessario per `fetch` dei JSON):

```powershell
# Con Python (se installato)
python -m http.server 8000
# Poi: http://localhost:8000/
```

```powershell
# Con Node.js (serve via npx)
npx serve -l 8000 .
# Poi: http://localhost:8000/
```

## Personalizzazione
- Dati: modifica i file in `data/` (nome, profilo, esperienze, competenze, ecc.)
- Foto: aggiungi un file (es. `assets/foto.jpg`) e imposta in `data/profile.json`:
  ```json
  {
    "name": "Riccardo Ungaro",
    "profile": "...",
    "photo": "assets/foto.jpg"
  }
  ```
- Tema: il toggle è un pulsante flottante in basso a destra; segue il sistema finché non lo forzi
  - Per tornare a seguire il sistema: rimuovi la preferenza
    ```js
    localStorage.removeItem('theme'); location.reload();
    ```

## Esportazione PDF
Usa Stampa del browser (Ctrl/Cmd+P). Consigli: A4, margini default, attiva grafica di sfondo.

## Deploy rapido (GitHub Pages)
- Pubblica il contenuto della cartella su un repository pubblico
- Imposta GitHub Pages su “Deploy from branch” (branch `master`/`main`, cartella root)
- Apri l’URL generato (es. `https://<utente>.github.io/<repo>/`)
