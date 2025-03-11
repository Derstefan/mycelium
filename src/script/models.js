import { createSeededRandom, generateSeededColor } from "./utils";
import { encodeRuleSetCompact, decodeRuleSetCompact, generateRuleSet } from "./rules";


export class Element {
  constructor(id, name, color) {
    this.id = id;//int
    this.name = name;//string
    this.color = color;//string
  }
}

export class Field {
  constructor(element, shroom) {
    this.element = element;//int
    this.shroom = shroom; // int
    this.age = 0;//int
  }
}

export class Shroom {
  constructor(player, ruleSet) {
    this.player = player;//string
    this.ruleSet = ruleSet;//Rule[]
  }
}

export class Rule {
  constructor(fromElement, elementSums, elementId) {
    this.fromElement = fromElement;//int
    this.elementSums = elementSums;//int[]
    this.elementId = elementId;//int
  }
  toString() {
    return `${this.fromElement},[${this.elementSums.join(',')}],${this.elementId}`;
  }
}


export class ElementConfig {
  constructor(numberOfElements, seed) {
    if (seed === undefined || seed === null) {
      seed = Math.random() + "";
    }
    let seededRandom = createSeededRandom(seed);

    let zeroElement = [new Element(0, "0", "#000000")];
    this.elements = [];
    for (let i = 1; i <= numberOfElements + 1; i++) {
      this.elements.push(new Element(i, i.toString(), `#${Math.floor(seededRandom() * 16777215).toString(16)}`));
    }
    this.allElements = zeroElement.concat(this.elements);
  }
}

export class ShroomsConfig {
  constructor(allElements, numberOfShrooms, numberOfRules, seed) {
    if (seed === undefined || seed === null) {
      seed = Math.random() + "";
    }
    let seededRandom = createSeededRandom(seed);

    this.shrooms = [];
    this.shroomColors = [];
    for (let i = 0; i < numberOfShrooms; i++) {
      const s = seededRandom() + "" + i;
      this.shrooms.push(generateRuleSet(numberOfRules, allElements.length, s));
      const index = encodeRuleSetCompact(this.shrooms[i]);
      const indexCheck = decodeRuleSetCompact(index);
      if (index !== encodeRuleSetCompact(indexCheck)) {
        console.warn("error in indexing " + index + " " + indexCheck);
      }
      this.shroomColors.push(generateSeededColor(index));
    }
    //TODO: shroom id -> new color seed
    //encodeRules(this.shrooms, allElements.length)

  }
}
