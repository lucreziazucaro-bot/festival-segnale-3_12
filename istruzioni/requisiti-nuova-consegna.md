# Segnale — Dati da un foglio di calcolo

Il Programma del tuo sito non legge più i JSON della repository, ma un **foglio di calcolo Google pubblicato sul web**: così un evento si può cambiare senza toccare il codice e senza commit. Facoltativo: nella Home puoi aggiungere un riquadro **Notizie da Torino** con i titoli di un feed RSS, letti attraverso lo stesso foglio (punto 4).

## Da dove partire

**Se hai svolto la consegna precedente, continua dal tuo sito**, conservando le tue personalizzazioni. Se non l’hai svolta, usa come base di recupero il sito dello ZIP: il Programma generato dai JSON e il meteo sono già fatti; il PDF `progettazione/moodboard.pdf` è un esempio docente, non una moodboard tua.

Per creare il foglio ti servono i dati in CSV: chiedi al chatbot di convertire `dati/eventi.json` e `dati/sedi.json` in due file `dati/eventi.csv` e `dati/sedi.csv`, con i nomi dei campi nella prima riga, e controlla che ci siano sei eventi e tre sedi.

Ti serve un account Google, anche personale. Nel foglio metti solo dati che potrebbero stare su un cartellone: una volta pubblicato, chiunque abbia l’indirizzo può leggerlo.

## 1. Crea il foglio

Crea un nuovo foglio Google, per esempio «Segnale — dati». Importa i due CSV con **File > Importa > Carica**, scegliendo **Inserisci nuovi fogli** e togliendo la spunta a **Converti testo in numeri, date e formule**. Otterrai due schede, `eventi` e `sedi`: la prima riga contiene i nomi dei campi, gli stessi dei JSON. Elimina la scheda vuota iniziale.

Se nella consegna precedente hai cambiato eventi o sedi, correggi le righe nel foglio. Scrivi le date come `2026-06-12` e gli orari come `10:00`, come nei JSON.

## 2. Pubblica il foglio

Con **File > Condividi > Pubblica sul web** pubblica le schede `eventi` e `sedi`, una alla volta, nel formato **CSV**. Ottieni due indirizzi: aprili nel browser per vedere che cosa riceverà il sito. Pubblicare non è condividere: chiunque può leggere quei dati, ma solo tu puoi modificarli.

## 3. Il Programma legge il foglio

Fai in modo che `programma.html` legga eventi e sedi dai due indirizzi CSV invece che dai JSON. Tutto il resto resta come prima: schede, stile, nome della sede, messaggi di caricamento, di nessun evento e d’errore, «Sede da definire». Per leggere il CSV puoi usare la libreria Papa Parse da CDN, citata nella lezione 7.

Attenzione: nel CSV ogni valore è testo, anche `id` e `sede_id`. I JSON possono restare in `dati/` come copia, ma la pagina non li legge più.

## 4. Facoltativo: Notizie da Torino

Questo punto è facoltativo: se lo salti, la consegna riguarda soltanto il Programma.

### La scheda delle notizie

Il browser non può leggere direttamente il feed RSS di un altro sito (CORS, lezione 7). Lo legge Google: aggiungi una scheda `notizie`, scrivi `titolo`, `link` e `data` nelle celle A1, B1 e C1, poi questa formula in A2. Prende le ultime cinque notizie del feed di ANSA Piemonte e ne tiene titolo, collegamento e data, che riempiono da sole le colonne A, B e C:

```text
=CHOOSECOLS(IMPORTFEED("https://www.ansa.it/piemonte/notizie/piemonte_rss.xml";"items";FALSO;5);1;2;3)
```

Incolla la formula con **Ctrl+Maiusc+V** (**Cmd+Maiusc+V** su Mac): così non copi anche colori e caratteri dell’editor. Se compare `#REF!`, fai clic sulla cella e scegli **Consenti l’accesso**. Non scrivere nulla in B2 e C2: se una cella è occupata, la formula non può riempirla e mostra un errore. Se il tuo foglio è in inglese, separa con `,` invece di `;` e scrivi `FALSE` invece di `FALSO`.

Poi pubblica anche la scheda `notizie` in formato CSV, come le altre due.

### La sezione nella Home

Nella Home aggiungi una sezione **Notizie da Torino**, nello stile del tuo sito, che legga l’indirizzo CSV della scheda `notizie` e:

- mostri al massimo cinque notizie, ciascuna con la data in italiano e il titolo collegato all’articolo originale;
- citi la fonte, per esempio «Notizie dal feed RSS di ANSA Piemonte. I contenuti appartengono ad ANSA»;
- se la richiesta non riesce, mostri un messaggio senza bloccare il resto della pagina.

La data serve anche a capire quanto è recente una notizia: il foglio aggiorna il feed a intervalli, non a ogni visita, e a volte tiene per giorni le stesse notizie. Se le tue notizie hanno qualche giorno, non hai sbagliato nulla: è la copia che Google conserva per quell’indirizzo.

### Facoltativo: notizie aggiornate ogni ora

Google conserva una copia del feed per ogni indirizzo. Questo script cambia ogni ora l’indirizzo nella formula che hai già scritto in A2, aggiungendo `?v=` e un numero, così il foglio rilegge il feed. Scrivi prima la formula della scheda `notizie` e controlla che funzioni. Il PDF `guida-script-notizie.pdf` mostra ogni passaggio con le schermate.

1. Nel foglio apri **Estensioni > Apps Script**, cancella il codice presente e incolla questo:

```js
// Notizie aggiornate ogni ora nella scheda «notizie».
// Google conserva una copia del feed per ogni indirizzo: cambiando il numero dopo ?v=
// l'indirizzo è nuovo e IMPORTFEED rilegge il feed.
// Lo script cambia soltanto l'indirizzo dentro la formula già scritta in A2,
// così separatori e FALSO restano quelli del tuo foglio.

function aggiornaNotizie() {
  const cella = SpreadsheetApp.getActive().getSheetByName('notizie').getRange('A2');
  const nuova = cella.getFormula().replace(/"(https:\/\/[^"?]+)(\?v=\d+)?"/, '"$1?v=' + Date.now() + '"');
  cella.setFormula(nuova);
}

// Da eseguire una volta sola: crea l'attivatore che chiama aggiornaNotizie ogni ora.
function attivaOgniOra() {
  ScriptApp.newTrigger('aggiornaNotizie').timeBased().everyHours(1).create();
  aggiornaNotizie();
}
```

2. Salva, scegli la funzione `attivaOgniOra` nel menu in alto e fai clic su **Esegui**, una volta sola.
3. Google chiede l’autorizzazione. Può chiederti di verificare l’account con il numero di telefono, poi avvisa che l’app non è verificata e consiglia di non dare l’accesso: l’app è il tuo script, nel tuo foglio, e nessun altro la usa. Scegli **Avanzate**, poi il collegamento in basso **Apri Progetto senza titolo (non sicura)**; nella pagina delle autorizzazioni spunta **Seleziona tutto** e fai clic su **Continua**.
4. Torna al foglio: nella formula di A2 c’è `?v=` e le notizie sono di oggi. In Apps Script, alla voce **Attivatori**, c’è un attivatore orario.

## 5. Verifica

Apri il sito con Live Preview. Fai queste prove una alla volta, ripristinando ogni volta foglio e file:

- Nel foglio cambia il nome di una sede: ricaricando il Programma, cambia nelle schede dei suoi eventi, senza commit. Possono servire alcuni minuti.
- Nel foglio scrivi un `sede_id` inesistente: l’evento compare con «Sede da definire».
- Nel foglio taglia le righe degli eventi, lasciando la riga dei nomi dei campi: compare il messaggio di nessun evento. Poi incollale di nuovo.
- Nel codice cambia una lettera dell’indirizzo CSV degli eventi: compare il messaggio d’errore.
- Se hai fatto le notizie: nel codice cambia una lettera dell’indirizzo delle notizie; compare il messaggio d’errore delle notizie, mentre il resto della Home funziona.

Controlla anche, a larghezza di telefono e di computer, che il resto del sito funzioni come prima, meteo compreso.

## 6. Scheda dati, AI e pubblicazione

In `dati/SCHEMA.md` aggiorna la scheda: i dati ora stanno nel foglio pubblicato e chi li aggiorna lo fa dal foglio, senza commit.

Puoi usare un chatbot o lavorare sul codice. Fornisci scheda dati, file e indirizzi CSV, chiedi una modifica alla volta e verifica il risultato. Non servono abbonamenti AI, Node.js, npm o un database. Aggiungi al resoconto `progettazione/resoconto-ai.md` una sezione `## Sessione N` per ogni sessione di lavoro, come nella consegna precedente.

Aggiorna la stessa repository e le stesse GitHub Pages. Prima di terminare apri la versione pubblica: il Programma, e le notizie se le hai fatte, devono mostrare i dati del foglio anche lì.

La scadenza e la modalità di raccolta saranno comunicate dal docente.
