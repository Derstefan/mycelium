const genusPrefixes = [
    "Agar", "Bolet", "Cortin", "Russul", "Lactar", "Amanit", "Clitoc",
    "Mycen", "Trichol", "Suill", "Psilocy", "Strophar", "Gymnop", "Paxill"
];
const genusSuffixes = ["icus", "atus", "ensis", "iformis", "oides", "aris"];

const speciesPrefixes = [
    "alb", "nigr", "rubr", "flav", "virid", "cinere", "ochr",
    "purpur", "lute", "melan", "aure", "fusc", "grise", "ruber"
];
const speciesSuffixes = ["acea", "osa", "ata", "ula", "ella", "iformis"];
const speciesEndings = ["", "ensis", "anus", "icus", "ianus", "inus", "alis"];


/* --- Umrechnungsfunktionen --- */
// Wandelt eine Zahl (0-12187) in einen lateinisch klingenden Pilznamen um.
export function mapNumberToMycelName(num: number): string | null {
    if (num < 0 || num > 12187) return null;



    const genusIndex = Math.floor(num / 588);
    const speciesIndex = num % 588;

    const genusPrefixIndex = Math.floor(genusIndex / 6);
    const genusSuffixIndex = genusIndex % 6;
    const genus = genusPrefixes[genusPrefixIndex] + genusSuffixes[genusSuffixIndex];

    const speciesPrefixIndex = Math.floor(speciesIndex / 42);
    const remainder = speciesIndex % 42;
    const speciesSuffixIndex = Math.floor(remainder / 7);
    const speciesEndingIndex = remainder % 7;
    const species = speciesPrefixes[speciesPrefixIndex] +
        speciesSuffixes[speciesSuffixIndex] +
        speciesEndings[speciesEndingIndex];

    const capitalizedSpecies = species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();

    return genus + " " + capitalizedSpecies;
}

// Parst einen Pilznamen und gibt den zugehörigen Index zurück.
export function parseMycelName(name: string): number | null {

    const parts = name.split(" ");
    if (parts.length !== 2) return null;
    const genusPart = parts[0];
    const speciesPart = parts[1].toLowerCase(); // Artteil immer in Kleinbuchstaben vergleichen

    // Genus-Prüfung
    let foundGenusIndex = -1;
    for (let prefixIndex = 0; prefixIndex < genusPrefixes.length; prefixIndex++) {
        for (let suffixIndex = 0; suffixIndex < genusSuffixes.length; suffixIndex++) {
            if (genusPart === genusPrefixes[prefixIndex] + genusSuffixes[suffixIndex]) {
                foundGenusIndex = prefixIndex * 6 + suffixIndex;
                break;
            }
        }
        if (foundGenusIndex !== -1) break;
    }
    if (foundGenusIndex === -1) return null;

    // Art-Prüfung mit optimierter Suche
    let foundSpeciesIndex = -1;
    loop_species:
    for (let i = 0; i < speciesPrefixes.length; i++) {
        for (let j = 0; j < speciesSuffixes.length; j++) {
            for (let k = 0; k < speciesEndings.length; k++) {
                const candidate = speciesPrefixes[i] + speciesSuffixes[j] + speciesEndings[k];
                if (candidate === speciesPart) {
                    foundSpeciesIndex = i * 42 + j * 7 + k;
                    break loop_species;
                }
            }
        }
    }
    if (foundSpeciesIndex === -1) return null;

    const num = foundGenusIndex * 588 + foundSpeciesIndex;
    return num > 12187 ? null : num;
}