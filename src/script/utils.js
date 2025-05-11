


export function generateRandomColors(count, seed) {
  return Array.from({ length: count }, (_, i) => generateSeededColor(seed + "_" + i));
}




export function generateSeededColor(seed, darker = false) {
  if (seed === undefined || seed === null) {
    seed = Math.random() + "";
  }
  const seededRandom = createSeededRandom(seed);
  if (!darker) {
    return '#' + Math.floor(seededRandom() * 16777215)
      .toString(16)
      .padStart(6, '0');
  } else {
    return '#' + Math.floor(seededRandom() * 16777215 / 2)
      .toString(16)
      .padStart(6, '0');
  }
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


//for variant 0-8 as colorarray
export function catchColor(color) {
  if (color === undefined || color === null) {
    return "#000000";
  }
  if (!/^#([0-9A-Fa-f]{6})$/.test(color)) {
    throw new Error("Ungültige Eingabe");
  }
  const colorArray = [];
  for (let i = 0; i < 8; i++) {
    colorArray.push(adjustColor(color, i));
  }
  return colorArray;
}

export function adjustColor(color, variant) {
  if (color === undefined || color === null) {
    return "#000000";
  }
  if (!/^#([0-9A-Fa-f]{6})$/.test(color) || variant < 0 || variant > 8) {
    throw new Error("Ungültige Eingabe");
  }

  const adjustments = [
    { r: 50, g: 0, b: 0 },   // Röter
    { r: 0, g: 50, b: 0 },   // Grüner
    { r: 0, g: 0, b: 50 },   // Blauer
    { r: -50, g: -50, b: -50 }, // Dunkler
    { r: 50, g: 50, b: 50 }, // Heller
    { r: 50, g: -25, b: -25 }, // Wärmer
    { r: -25, g: 25, b: 50 },  // Kälter
    { r: -50, g: 50, b: -25 }, // Grünlicher
    { r: -25, g: -25, b: 50 }  // Violetter
  ];

  let r = parseInt(color.substr(1, 2), 16) + adjustments[variant].r;
  let g = parseInt(color.substr(3, 2), 16) + adjustments[variant].g;
  let b = parseInt(color.substr(5, 2), 16) + adjustments[variant].b;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}