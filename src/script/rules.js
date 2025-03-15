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

  //  return uniqueRules;
  return minimizeRuleSet(uniqueRules);
}

// Erzeugt ein zufälliges Regelset basierend auf einem Seed
export function generateRuleSetCycle(numRules = 12, elementNumber, seed) {
  if (seed === undefined || seed === null) {
    seed = Math.random() + "";
  }
  //console.log("Seed:", seed);
  let rng = createSeededRandom(seed);
  const ruleSet = [];

  //array with first element 1 length elementNumber-2
  /*
  const array1 = [0];
  const array2 = [1];
  const array3 = [2];
  const array4 = [3];
  for (let j = 0; j < elementNumber - 3; j++) {
    array1.push(0);
    array2.push(0);
    array3.push(0);
    array4.push(0);
  }
  const randomElement = Math.floor(rng() * 3);
  if (randomElement === 0) {
    ruleSet.push(new Rule(0, array1, 1));

  } else if (randomElement === 1) {
    ruleSet.push(new Rule(0, array2, 1));

  } else {
    ruleSet.push(new Rule(0, array3, 1));
    ruleSet.push(new Rule(0, array4, 1));
  }

*/

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

    let resultElement;
    if (fromElement === elementNumber - 1) {
      resultElement = 0;
    } else if (fromElement === 0) {
      resultElement = 1;
    } else {
      if (rng() < 0.8) {
        resultElement = fromElement + 1;
      }
      else {
        resultElement = fromElement;
      }
    }


    console.log(fromElement, elementSums, resultElement);
    // const resultElement = 1;
    ruleSet.push(new Rule(fromElement, elementSums, resultElement));
  }

  // Entferne Duplikate
  const uniqueRules = removeDuplicatesAndSort(ruleSet);

  //  return uniqueRules;
  return minimizeRuleSet(uniqueRules);
}

export function minimizeRuleSet(ruleSet) {
  return ruleSet.filter(rule =>
    rule.fromElement !== rule.elementId
  )
}



export function generateRuleSetByIndex(index) {
  // Total valid indices: 3 * 4096 = 12288
  const maxIndex = 3 * 4096; // 12288
  if (index < 0 || index >= maxIndex) {
    throw new Error(`Index must be between 0 and ${maxIndex - 1}.`);
  }

  // Split index into constrained part (0-2) and free part (0-4095)
  const partA = Math.floor(index / 4096); // Determines (0,1) and (0,2)
  const partB = index % 4096; // Controls other rules

  // Set (0,1) and (0,2) based on partA
  let sum1Bit, sum2Bit;
  switch (partA) {
    case 0: sum1Bit = 0; sum2Bit = 1; break; // (0, [1],0), (0, [2],1)
    case 1: sum1Bit = 1; sum2Bit = 0; break; // (0, [1],1), (0, [2],0)
    case 2: sum1Bit = 1; sum2Bit = 1; break; // Both set to 1
  }

  // Force (0,3) and (0,4) to always be 1
  const constrainedBits = (sum1Bit | (sum2Bit << 1) | (1 << 2) | (1 << 3));

  // Combine with free rules and invert upper 8 bits
  let modifiedIndex = constrainedBits | (partB << 4);
  modifiedIndex = (modifiedIndex & 0x00FF) | (~modifiedIndex & 0xFF00);

  // Generate rules
  const rules = [];
  for (let fromElement = 0; fromElement < 2; fromElement++) {
    for (let sum = 1; sum <= 8; sum++) {
      const bitPosition = fromElement * 8 + (sum - 1);
      const resultElement = (modifiedIndex >> bitPosition) & 1;
      rules.push(new Rule(fromElement, [sum], resultElement));
    }
  }

  return minimizeRuleSet(rules);
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
// Berechnet die minimale Bitanzahl, um einen Wert < maxValue abzubilden.
function calcBitWidth(maxValue) {
  return Math.ceil(Math.log2(maxValue));
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
// Encodes a RuleSet into a compact string 

export function encodeRuleSetCompact(ruleSet) {
  if (ruleSet.length === 0) {
    return "0:0:0";
  }
  const n = ruleSet[0].elementSums.length;
  for (const rule of ruleSet) {
    if (rule.elementSums.length !== n) {
      throw new Error("All rules must have elementSums of the same length");
    }
  }
  const totalPossibilities = (n + 1) ** 2 * (9 ** n);
  const bitWidth = calcBitWidth(totalPossibilities);

  const indicesSet = [];
  for (const rule of ruleSet) {
    let bValue = 0;
    for (let i = 0; i < n; i++) {
      bValue = bValue * 9 + rule.elementSums[i];
    }
    const index = rule.fromElement * (9 ** n) * (n + 1) + bValue * (n + 1) + rule.elementId;
    indicesSet.push(index);
  }

  const ruleCount = indicesSet.length;
  let packed = 0n;
  for (const index of indicesSet) {
    packed = (packed << BigInt(bitWidth)) | BigInt(index);
  }

  return `${n}:${ruleCount}:${packed.toString(36)}`;
}

// Decodes a compact string back into a RuleSet
export function decodeRuleSetCompact(id) {
  const parts = id.split(":");
  if (parts.length !== 3) throw new Error("Invalid ID format");
  const n = parseInt(parts[0], 10);
  const ruleCount = parseInt(parts[1], 10);
  const encoded = parts[2];

  const totalPossibilities = (n + 1) ** 2 * (9 ** n);
  const bitWidth = calcBitWidth(totalPossibilities);

  const packed = bigIntFromBase36(encoded);

  const indices = [];
  let tempPacked = packed;
  const mask = (1n << BigInt(bitWidth)) - 1n;
  for (let i = 0; i < ruleCount; i++) {
    indices.unshift(Number(tempPacked & mask));
    tempPacked = tempPacked >> BigInt(bitWidth);
  }

  const rules = [];
  const factor = (9 ** n) * (n + 1);
  for (const index of indices) {
    const a = Math.floor(index / factor);
    const rem = index % factor;
    const bValue = Math.floor(rem / (n + 1));
    const c = rem % (n + 1);

    const bArray = [];
    let temp = bValue;
    for (let i = 0; i < n; i++) {
      bArray.unshift(temp % 9);
      temp = Math.floor(temp / 9);
    }
    rules.push(new Rule(a, bArray, c));
  }

  return rules;
}