import { Rule } from "./models";
import { createSeededRandom } from "./utils";

// Erzeugt ein zufälliges Regelset basierend auf einem Seed
export function generateRuleSet(numRules = 12, elementNumber, seed) {
  if (seed === undefined || seed === null) {
    seed = Math.random() + "";
  }
  //console.log("Seed:", seed);
  let rng = createSeededRandom(seed);
  const ruleSet = [];

  for (let i = 0; i < numRules; i++) {
    // Bestimme zufällig die Länge des elementSums-Arrays (zwischen 1 und 8)
    const elementSums = [];

    let sum = 0;
    for (let j = 0; j < elementNumber - 2; j++) {

      const value = Math.floor(rng() * (8 - sum));
      if (sum < 8 && value > 0) {
        sum += value;
        elementSums.push(value);
      } else {
        elementSums.push(0);
      }
    }
    //elementSums.push(0);

    const fromElement = Math.floor(rng() * (elementNumber - 1));
    const resultElement = Math.floor(rng() * (elementNumber - 1));
    // const resultElement = 1;
    ruleSet.push(new Rule(fromElement, elementSums, resultElement));
  }

  // Entferne Duplikate
  const uniqueRules = removeDuplicatesAndSort(ruleSet);

  return uniqueRules;
}



function removeDuplicatesAndSort(rules) {
  const uniqueRules = new Map();

  rules.forEach(rule => {
    // Create a key using the first parameter and second parameter directly
    const key = `${rule.fromElement}-${rule.elementSums.join('|')}`;

    // Only store the first occurrence of a unique rule
    if (!uniqueRules.has(key)) {
      uniqueRules.set(key, rule);
    }
  });

  // Convert back to an array and sort
  return Array.from(uniqueRules.values()).sort((a, b) => {
    if (a.fromElement !== b.fromElement) return a.fromElement - b.fromElement;

    // Compare elementSums array element by element
    for (let i = 0; i < Math.min(a.elementSums.length, b.elementSums.length); i++) {
      if (a.elementSums[i] !== b.elementSums[i]) {
        return a.elementSums[i] - b.elementSums[i];
      }
    }

    // If arrays are equal up to the shortest length, compare length
    if (a.elementSums.length !== b.elementSums.length) {
      return a.elementSums.length - b.elementSums.length;
    }

    // Finally, compare elementId
    return a.elementId - b.elementId;
  });
}

// Wandelt einen Base‑36‑String in einen BigInt um.
function bigIntFromBase36(str) {
  const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = 0n;
  for (const char of str.toLowerCase()) {
    const d = BigInt(digits.indexOf(char));
    result = result * 36n + d;
  }
  return result;
}

// Berechnet die minimale Bitanzahl, um einen Wert < maxValue abzubilden.
function calcBitWidth(maxValue) {
  return Math.ceil(Math.log2(maxValue));
}



/**
 * Encodiert ein Array von Rule-Objekten in eine kompakte Zeichenkette.
 * Annahme: Es gilt
 *   index = rule.fromElement * (n * 9ⁿ) + bValue * n + rule.elementId,
 * wobei bValue aus rule.elementSums (Länge n) gebildet wird.
 * Insgesamt gibt es n³ * 9ⁿ Möglichkeiten.
 */
export function encodeRuleSetCompact(ruleSet, n = 1) {
  const totalPossibilities = n ** 3 * (9 ** n); // Gesamtzahl möglicher Indizes
  const bitWidth = calcBitWidth(totalPossibilities);

  const indicesSet = [];
  for (const rule of ruleSet) {
    if (rule.elementSums.length !== n) {
      throw new Error("elementSums muss genau n Elemente enthalten");
    }
    // Berechne bValue aus dem Array elementSums
    let bValue = 0;
    for (let i = 0; i < n; i++) {
      bValue = bValue * 9 + rule.elementSums[i];
    }
    // Berechne den Index anhand der Formel
    const index = rule.fromElement * (n * (9 ** n)) + bValue * n + rule.elementId;
    indicesSet.push(index);
  }

  const ruleCount = indicesSet.length;
  let packed = 0n;
  // Packe alle Indizes in einen BigInt, indem jeweils bitWidth-Bits verschoben und hinzugefügt werden.
  for (const index of indicesSet) {
    packed = (packed << BigInt(bitWidth)) | BigInt(index);
  }

  // Erzeuge den Ausgabe-String: n:AnzahlRegeln:Base36-kodierter Wert
  return `${n}:${ruleCount}:${packed.toString(36)}`;
}

/**
 * Dekodiert den kompakten String zurück in ein Array von Rule-Objekten.
 * Dabei wird der Base‑36‑String über die Funktion bigIntFromBase36 korrekt in einen BigInt umgewandelt.
 */
export function decodeRuleSetCompact(id) {
  const parts = id.split(":");
  if (parts.length !== 3) throw new Error("Ungültiges ID-Format");
  const n = parseInt(parts[0], 10);
  const ruleCount = parseInt(parts[1], 10);
  const encoded = parts[2];

  const totalPossibilities = n ** 3 * (9 ** n);
  const bitWidth = calcBitWidth(totalPossibilities);

  // Umwandlung des Base‑36‑Strings in einen BigInt ohne Präzisionsverlust
  const packed = bigIntFromBase36(encoded);

  const indices = [];
  let tempPacked = packed;
  const mask = (1n << BigInt(bitWidth)) - 1n;
  // Extrahiere die einzelnen Indizes (in umgekehrter Reihenfolge)
  for (let i = 0; i < ruleCount; i++) {
    indices.unshift(Number(tempPacked & mask));
    tempPacked = tempPacked >> BigInt(bitWidth);
  }

  const rules = [];
  const factor = n * (9 ** n);
  // Zerlege jeden Index in die ursprünglichen Bestandteile
  for (const index of indices) {
    const a = Math.floor(index / factor);
    const rem = index % factor;
    const bValue = Math.floor(rem / n);
    const c = rem % n;
    const bArray = [];
    let temp = bValue;
    // Zerlege bValue zurück in ein Array mit Länge n (Elemente zwischen 0 und 8)
    for (let i = 0; i < n; i++) {
      bArray.unshift(temp % 9);
      temp = Math.floor(temp / 9);
    }
    rules.push(new Rule(a, bArray, c));
  }

  return rules;
}


