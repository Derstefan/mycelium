/**
 * Konvertiert eine Dezimalzahl in eine 16-Bit Binärzahl als String
 * @param decimal - Die Dezimalzahl (0-65535)
 * @returns 16-Bit Binärzahl als String (z.B. "0000000000000001")
 */
export function decimalToBinary16(decimal: number): string {
    if (decimal < 0 || decimal > 65535) {
        throw new Error('Zahl muss zwischen 0 und 65535 liegen');
    }
    return decimal.toString(2).padStart(16, '0');
}

/**
 * Konvertiert eine 16-Bit Binärzahl als String in eine Dezimalzahl
 * @param binary - Die Binärzahl als String (z.B. "0000000000000001")
 * @returns Dezimalzahl
 */
export function binary16ToDecimal(binary: string): number {
    if (!/^[01]{16}$/.test(binary)) {
        throw new Error('Binärzahl muss genau 16 Zeichen (0 und 1) haben');
    }
    return parseInt(binary, 2);
}

/**
 * Validiert, ob ein String eine gültige 16-Bit Binärzahl ist
 * @param binary - Der zu validierende String
 * @returns true wenn gültig, false sonst
 */
export function isValidBinary16(binary: string): boolean {
    return /^[01]{16}$/.test(binary);
}

/**
 * Formatiert eine Binärzahl für bessere Lesbarkeit (z.B. "0000 0000 0000 0001")
 * @param binary - Die Binärzahl als String
 * @returns Formatierte Binärzahl
 */
export function formatBinary16(binary: string): string {
    if (!isValidBinary16(binary)) {
        throw new Error('Ungültige 16-Bit Binärzahl');
    }
    return binary.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Entfernt Leerzeichen aus einer formatierten Binärzahl
 * @param formattedBinary - Die formatierte Binärzahl (z.B. "0000 0000 0000 0001")
 * @returns Binärzahl ohne Leerzeichen
 */
export function unformatBinary16(formattedBinary: string): string {
    return formattedBinary.replace(/\s/g, '');
} 