// Meteo a Torino adesso: una sola richiesta all'API di Open-Meteo, all'apertura della pagina.
// 1. Indirizzo della richiesta: coordinate di Torino, valori attuali richiesti e fuso orario.
const indirizzoMeteo = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=45.0703&longitude=7.6869'
  + '&current=temperature_2m,wind_speed_10m'
  + '&timezone=Europe%2FRome';

const messaggioMeteo = document.getElementById('meteo-messaggio');
const valoriMeteo = document.getElementById('meteo-valori');

function numeroItaliano(valore) {
  return valore.toLocaleString('it-IT', { maximumFractionDigits: 1 });
}

function momentoLeggibile(tempo) {
  // Open-Meteo restituisce l'ora di Torino nella forma 2026-11-17T20:15.
  const [giorno, ora] = tempo.split('T');
  const data = new Date(giorno + 'T12:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  return 'Dato delle ' + ora + ' di ' + data + '.';
}

// 2. Richiesta, lettura del JSON e stati: caricamento, successo, errore.
async function caricaMeteo() {
  messaggioMeteo.textContent = 'Caricamento del meteo…';
  valoriMeteo.textContent = '';
  try {
    const risposta = await fetch(indirizzoMeteo);
    if (!risposta.ok) throw new Error('Risposta meteo ' + risposta.status);
    const dati = await risposta.json();
    const attuale = dati.current;
    const unita = dati.current_units;
    if (!attuale || typeof attuale.temperature_2m !== 'number'
      || typeof attuale.wind_speed_10m !== 'number') {
      throw new Error('Dati meteo incompleti');
    }
    // 3. Dal JSON alla pagina: temperatura, vento e momento del dato.
    valoriMeteo.textContent = numeroItaliano(attuale.temperature_2m) + ' ' + unita.temperature_2m
      + ' · vento ' + numeroItaliano(attuale.wind_speed_10m) + ' ' + unita.wind_speed_10m;
    messaggioMeteo.textContent = momentoLeggibile(attuale.time);
  } catch (errore) {
    valoriMeteo.textContent = '';
    messaggioMeteo.textContent = 'Il meteo non è disponibile in questo momento.';
    console.error(errore);
  }
}

caricaMeteo();
