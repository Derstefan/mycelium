


export function generateRandomColors(count, seed) {
  return Array.from({ length: count }, (_, i) => generateSeededColor(seed + "_" + i));
}




export function generateSeededColor(seed) {
  if (seed === undefined || seed === null) {
    seed = Math.random() + "";
  }
  const seededRandom = createSeededRandom(seed);
  return '#' + Math.floor(seededRandom() * 16777215)
    .toString(16)
    .padStart(6, '0');
}

export function setStartValues(length, w, h, seed) {
  if (seed === undefined || seed === null) {
    seed = Math.random() + "";
  }
  let seededRandom = createSeededRandom(seed);
  const pos = [];
  for (let i = 0; i < length; i++) {
    const startX = Math.floor(seededRandom() * (w - 2)) + 1;
    const startY = Math.floor(seededRandom() * (h - 2)) + 1;
    pos.push({ x: startX, y: startY });
  }
  return pos;
}


// Konvertiert einen String in eine 32-Bit-Zahl (falls der Seed kein Number ist)
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // in 32-Bit-Zahl umwandeln
  }
  return Math.abs(hash);
}

// Erstellt einen einfachen Linear Congruential Generator (LCG)
// Gibt eine Funktion zurück, die bei jedem Aufruf eine Zahl zwischen 0 und 1 liefert
export function createSeededRandom(seed) {
  // Falls seed kein Number ist, in eine Zahl umwandeln
  if (typeof seed !== "number") {
    seed = hashString(seed);
  }

  const m = 0x80000000; // 2^31
  const a = 1103515245;
  const c = 12345;
  let state = seed % m;

  return function () {
    state = (a * state + c) % m;
    return state / m;
  }
}


export function arraysAreTheSame(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function isWithinRadius(x, y, clickedX, clickedY, d) {
  return Math.sqrt((x - clickedX) ** 2 + (y - clickedY) ** 2) <= d;
}