export function darkenColor(color: string, factor: number): string {
    // Ensure factor is within range (0 to 1, where 1 is full darkening)
    if (!color) return "#000000";

    factor = Math.max(0, Math.min(1, factor));

    // Extract RGB components from hex color
    let r: number, g: number, b: number;
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else {
            throw new Error('Invalid hex color format');
        }
    } else {
        throw new Error('Only hex colors are supported');
    }

    // Apply darkening factor
    r = Math.round(r * (1 - factor));
    g = Math.round(g * (1 - factor));
    b = Math.round(b * (1 - factor));

    // Convert back to hex and return
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


