const elenco = document.getElementById('elenco-eventi');
const messaggio = document.getElementById('messaggio');
let eventi = [];
let sedi = [];

const elencoNotizie = document.getElementById('elenco-notizie');
const messaggioNotizie = document.getElementById('messaggio-notizie');

const URL_NOTIZIE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoD9R4Lfq5wsTJ2H3BoEvLKNZPdhnsf4v05_rYEjbWcRoCFCG8VM-7WL91IhXZdU12bmBAmIOG893/pub?gid=761735776&single=true&output=csv';

const URL_EVENTI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoD9R4Lfq5wsTJ2H3BoEvLKNZPdhnsf4v05_rYEjbWcRoCFCG8VM-7WL91IhXZdU12bmBAmIOG893/pub?gid=2058830147&single=true&output=tsv';
const URL_SEDI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoD9R4Lfq5wsTJ2H3BoEvLKNZPdhnsf4v05_rYEjbWcRoCFCG8VM-7WL91IhXZdU12bmBAmIOG893/pub?gid=1307868616&single=true&output=csv';

function creaElemento(tag, classe, testo) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (testo !== undefined) elemento.textContent = testo;
  return elemento;
}

function dataLeggibile(data) {
  const giorno = new Date(data + 'T12:00:00');
  return giorno.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function leggiTabella(url, delimitatore = '') {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      delimiter: delimitatore,
      skipEmptyLines: true,
      complete: risultato => {
        if (risultato.errors.length > 0) {
          reject(new Error(risultato.errors[0].message));
          return;
        }
        resolve(risultato.data);
      },
      error: errore => reject(errore)
    });
  });
}

async function caricaNotizie() {
  try {
    const notizie = await leggiTabella(URL_NOTIZIE);
    elencoNotizie.replaceChildren();

    if (notizie.length === 0) {
      messaggioNotizie.textContent = 'Nessuna notizia disponibile.';
      return;
    }

    for (const notizia of notizie) {
      const elemento = document.createElement('li');
      const collegamento = document.createElement('a');

      collegamento.href = notizia.link;
      collegamento.textContent = notizia.titolo;
      collegamento.target = '_blank';
      collegamento.rel = 'noopener noreferrer';

      elemento.appendChild(collegamento);

      if (notizia.data) {
        const data = document.createElement('span');
        data.textContent = ' · ' + notizia.data;
        elemento.appendChild(data);
      }

      elencoNotizie.appendChild(elemento);
    }

    messaggioNotizie.textContent = '';
  } catch (errore) {
    elencoNotizie.replaceChildren();
    messaggioNotizie.textContent =
      'Le notizie non sono disponibili al momento.';
    console.error(errore);
  }
}

function creaScheda(evento) {
  const sede = sedi.find(sede => sede.id === evento.sede_id);
  if (!sede) console.warn('Sede inesistente per evento', evento.id, evento.sede_id);

  const scheda = creaElemento('article', 'event-card');
  const immagine = creaElemento('img');
  immagine.src = evento.immagine;
  immagine.alt = evento.immagine_alt;
  immagine.width = 900;
  immagine.height = 600;

  const corpo = creaElemento('div', 'event-body');
  const meta = creaElemento(
    'p',
    'event-meta',
    dataLeggibile(evento.data) + ' · ' + evento.orario + ' · ' + evento.categoria
  );
  const titolo = creaElemento('h3', '', evento.titolo);
  const descrizione = creaElemento('p', '', evento.descrizione);
  const luogo = creaElemento('p', 'event-place');
  const etichetta = creaElemento('strong', '', 'Sede: ');

  luogo.appendChild(etichetta);
  luogo.appendChild(document.createTextNode(sede ? sede.nome : 'Sede da definire'));
  corpo.append(meta, titolo, descrizione, luogo);
  scheda.append(immagine, corpo);

  return scheda;
}

function mostraProgramma() {
  elenco.replaceChildren();

  if (eventi.length === 0) {
    messaggio.textContent = 'Nessun evento in programma.';
    return;
  }

  messaggio.textContent = eventi.length === 1
    ? '1 evento in programma.'
    : eventi.length + ' eventi in programma.';

  for (const evento of eventi) {
    elenco.appendChild(creaScheda(evento));
  }
}

async function caricaProgramma() {
  elenco.replaceChildren();
  messaggio.textContent = 'Caricamento del programma…';

  try {
    // Gli eventi sono TSV (valori separati da tabulazioni).
    const [datiEventi, datiSedi] = await Promise.all([
      leggiTabella(URL_EVENTI, '\t'),
      leggiTabella(URL_SEDI)
    ]);

    if (!Array.isArray(datiEventi) || !Array.isArray(datiSedi)) {
      throw new Error('I dati pubblicati non hanno il formato previsto');
    }

    eventi = datiEventi;
    sedi = datiSedi;
    mostraProgramma();
  } catch (errore) {
    elenco.replaceChildren();
    messaggio.textContent = 'Il programma non è disponibile. Riprova più tardi.';
    console.error(errore);
  }
}

caricaProgramma();
caricaNotizie();
