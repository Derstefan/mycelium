const genusPrefixes = [
    "Agar", "Bolet", "Cortin", "Russul", "Lactar", "Amanit", "Clitoc",
    "Mycen", "Trichol", "Suill", "Psilocy", "Strophar", "Gymnop", "Paxill",
    "Entolom", "Hymeno" // added two entries to have 16 items
];
const genusSuffixes = [
    "icus", "atus", "ensis", "iformis", "oides", "aris", "ac" // added one more to have 7 items
];

const speciesPrefixes = [
    "alb", "nigr", "rubr", "flav", "virid", "cinere", "ochr",
    "purpur", "lute", "melan", "aure", "fusc", "grise", "ruber"
];
const speciesSuffixes = ["acea", "osa", "ata", "ula", "ella", "iformis"];
const speciesEndings = ["", "ensis", "anus", "icus", "ianus", "inus", "alis"];


export function mapNumberToMycelName(num: number): string | null {
    // Total number of combinations:
    //   Genus: 16 prefixes * 7 suffixes = 112
    //   Species: 14 prefixes * 6 suffixes * 7 endings = 588
    //   Total: 112 * 588 = 65856 names.
    const totalCombinations = genusPrefixes.length * genusSuffixes.length * 588;
    if (num < 0 || num >= totalCombinations) return null;

    // Determine genus and species indices
    const genusIndex = Math.floor(num / 588);
    const speciesIndex = num % 588;

    // Get genus: we now have 112 possibilities, split into 16 groups each of 7.
    const genusPrefixIndex = Math.floor(genusIndex / genusSuffixes.length);
    const genusSuffixIndex = genusIndex % genusSuffixes.length;
    const genus = genusPrefixes[genusPrefixIndex] + genusSuffixes[genusSuffixIndex];

    // Get species: speciesIndex is in the range 0 to 587.
    // It is split as: speciesPrefixes.length * speciesSuffixes.length * speciesEndings.length = 14*6*7 = 588.
    const speciesPrefixIndex = Math.floor(speciesIndex / (speciesSuffixes.length * speciesEndings.length));
    const remainder = speciesIndex % (speciesSuffixes.length * speciesEndings.length);
    const speciesSuffixIndex = Math.floor(remainder / speciesEndings.length);
    const speciesEndingIndex = remainder % speciesEndings.length;
    const species = speciesPrefixes[speciesPrefixIndex] +
        speciesSuffixes[speciesSuffixIndex] +
        speciesEndings[speciesEndingIndex];

    // Capitalize species: first letter uppercase, rest lowercase.
    const capitalizedSpecies = species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();

    return genus + " " + capitalizedSpecies;
}

// Parses a mushroom name and returns the corresponding index.
export function parseMycelName(name: string): number | null {
    const parts = name.split(" ");
    if (parts.length !== 2) return null;
    const genusPart = parts[0];
    const speciesPart = parts[1].toLowerCase(); // species always compared in lowercase

    // Find the genus index.
    let foundGenusIndex = -1;
    for (let i = 0; i < genusPrefixes.length; i++) {
        for (let j = 0; j < genusSuffixes.length; j++) {
            const candidate = genusPrefixes[i] + genusSuffixes[j];
            if (genusPart === candidate) {
                foundGenusIndex = i * genusSuffixes.length + j;
                break;
            }
        }
        if (foundGenusIndex !== -1) break;
    }
    if (foundGenusIndex === -1) return null;

    // Find the species index.
    let foundSpeciesIndex = -1;
    loop_species:
    for (let i = 0; i < speciesPrefixes.length; i++) {
        for (let j = 0; j < speciesSuffixes.length; j++) {
            for (let k = 0; k < speciesEndings.length; k++) {
                const candidate = speciesPrefixes[i] + speciesSuffixes[j] + speciesEndings[k];
                if (candidate === speciesPart) {
                    foundSpeciesIndex = i * (speciesSuffixes.length * speciesEndings.length) + j * speciesEndings.length + k;
                    break loop_species;
                }
            }
        }
    }
    if (foundSpeciesIndex === -1) return null;

    const num = foundGenusIndex * 588 + foundSpeciesIndex;
    // Ensure that the resulting number is in the allowed range.
    return num >= (genusPrefixes.length * genusSuffixes.length * 588) ? null : num;
}