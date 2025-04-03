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

export function minimizeRuleSet(ruleSet) {
  return ruleSet.filter(rule =>
    rule.fromElement !== rule.elementId
  )
}


export function generateRuleSetByIndexExpanding(index) {
  // Total valid indices: 3 * 4096 = 12288
  const maxIndex = 3 * 4096; // 12288
  if (index < 0 || index >= maxIndex) {
    throw new Error(`Index must be between 0 and ${maxIndex - 1}.`);
  }

  // Split index into constrained part (0-2) and free part (0-4095)
  const partA = Math.floor(index / 4096); // Determines which condition is active
  const partB = index % 4096; // Controls other rules

  // Set bits based on partA to satisfy one of the three conditions
  let sum1Bit, sum2Bit, sum3Bit, sum4Bit;
  sum3Bit = 0;
  sum4Bit = 0;

  switch (partA) {
    case 0:
      sum1Bit = 1; // (0,[1],1)
      sum2Bit = 0;
      break;
    case 1:
      sum1Bit = 0;
      sum2Bit = 1; // (0,[2],1)
      break;
    case 2:
      sum1Bit = 0;
      sum2Bit = 0;
      sum3Bit = 1; // (0,[3],1) and (0,[4],1)
      sum4Bit = 1;
      break;
    default:
      throw new Error("Invalid partA value");
  }

  // Combine constrained bits (bits 0-3)
  const constrainedBits = sum1Bit | (sum2Bit << 1) | (sum3Bit << 2) | (sum4Bit << 3);

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

export function getIndexFromRuleSetExpanding(rules) {
  console.log("rules", rules)
  const resultElements = new Array(8).fill(0).concat(new Array(8).fill(1));
  //7-15 = 0


  // Populate resultElements from the rules
  for (const rule of rules) {
    const fromElement = rule.fromElement;
    for (const sum of rule.elementSums) {
      const s = parseInt(sum, 10);
      if (s < 1 || s > 8) continue;
      const position = fromElement * 8 + (s - 1);
      resultElements[position] = position < 8 ? 1 : 0;
    }
  }
  console.log("resultElements", resultElements)

  // Check the validity conditions
  const sum1 = resultElements[0]; // (0,[1],sum1)
  const sum2 = resultElements[1]; // (0,[2],sum2)
  const sum3 = resultElements[2]; // (0,[3],sum3)
  const sum4 = resultElements[3]; // (0,[4],sum4)

  // The valid conditions are:
  // sum1 === 1 OR sum2 === 1 OR (sum3 === 1 && sum4 === 1)
  const valid = (sum1 === 1) || (sum2 === 1) || (sum3 === 1 && sum4 === 1);
  if (!valid) {
    throw new Error('Ruleset does not meet the required conditions.');
  }

  // Reconstruct the modifiedIndex
  let lowerByte = 0;
  for (let i = 0; i < 8; i++) {
    lowerByte |= (resultElements[i] << i);
  }

  let upperByte = 0;
  for (let i = 8; i < 16; i++) {
    upperByte |= (resultElements[i] << (i - 8));
  }
  upperByte = (~upperByte) & 0xFF;

  const originalModifiedIndex = (upperByte << 8) | lowerByte;

  // Extract constrained bits (bits 0-3)
  const constrainedBits = originalModifiedIndex & 0x0F;

  // Determine partA based on sum1 and sum2
  let partA;
  const sum1Bit = constrainedBits & 1;
  const sum2Bit = (constrainedBits >> 1) & 1;

  if (sum1Bit === 0 && sum2Bit === 1) {
    partA = 0;
  } else if (sum1Bit === 1 && sum2Bit === 0) {
    partA = 1;
  } else if (sum1Bit === 1 && sum2Bit === 1) {
    partA = 2;
  } else {
    // If neither sum1 nor sum2 is 1, check if sum3 and sum4 are 1
    if (sum3 === 1 && sum4 === 1) {
      partA = 2; // Both sum3 and sum4 are 1, treated as partA=2
    } else {
      throw new Error('Invalid constrained bits combination.');
    }
  }

  // Extract partB
  const partB = (originalModifiedIndex >> 4) & 0x0FFF;

  // Calculate index
  const index = partA * 4096 + partB;
  if (index < 0 || index >= 3 * 4096) {
    throw new Error('Index out of valid range.');
  }

  return index;
}


export function generateRuleSetByIndex(index) {
  const maxIndex = 65536; // 2^16
  if (index < 0 || index >= maxIndex) {
    throw new Error(`Index must be between 0 and ${maxIndex - 1}.`);
  }

  const modifiedIndex = index;

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

export function getIndexFromRuleSet(rules) {
  const resultElements = new Array(8).fill(0).concat(new Array(8).fill(1));

  for (const rule of rules) {
    const fromElement = rule.fromElement;
    for (const sum of rule.elementSums) {
      const s = parseInt(sum, 10);
      if (s < 1 || s > 8) continue;
      const position = fromElement * 8 + (s - 1);
      resultElements[position] = position < 8 ? 1 : 0;
    }
  }

  let lowerByte = 0;
  for (let i = 0; i < 8; i++) {
    lowerByte |= (resultElements[i] << i);
  }

  let upperByte = 0;
  for (let i = 8; i < 16; i++) {
    upperByte |= (resultElements[i] << (i - 8));
  }

  console.log(resultElements)

  const modifiedIndex = (upperByte << 8) | lowerByte;

  return modifiedIndex;
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