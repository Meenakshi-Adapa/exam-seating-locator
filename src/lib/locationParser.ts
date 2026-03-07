export type ParsedLocation = {
    blockNumber: string;
    floorNumber: string;
    roomNumber: string;
};

const FLOOR_WORD_PATTERN = /(GROUND|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|\d{1,2}(?:ST|ND|RD|TH))\s*FLOOR/i;

function toTitleCase(value: string): string {
    return value
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ");
}

export function parseLocationFields(input: string | undefined | null): ParsedLocation {
    const source = String(input || "").trim();

    if (!source) {
        return { blockNumber: "Unknown", floorNumber: "Unknown", roomNumber: "Unknown" };
    }

    const normalized = source
        .replace(/[|]/g, "/")
        .replace(/[—–]/g, "-")
        .replace(/\s+/g, " ")
        .trim();

    const prefixBlockMatch = normalized.match(/\b([IVXLCDM]+|\d{1,3})\s*-\s*BLOCK\b/i);
    const suffixBlockMatch = normalized.match(/\bBLOCK\s*[-: ]\s*([IVXLCDM]+|\d{1,3})\b/i);
    const floorMatch = normalized.match(FLOOR_WORD_PATTERN);
    const roomMatch = normalized.match(/\b([A-Z]-\d{3}-[A-Z]|[A-Z]-\d{3}|[A-Z]\d{3})\b/i);

    const blockNumber = suffixBlockMatch
        ? suffixBlockMatch[1].toUpperCase()
        : (prefixBlockMatch ? prefixBlockMatch[1].toUpperCase() : "Unknown");
    const floorNumber = floorMatch ? `${toTitleCase(floorMatch[1].toUpperCase())} Floor` : "Unknown";
    const roomNumber = roomMatch ? roomMatch[1].toUpperCase() : normalized;

    return { blockNumber, floorNumber, roomNumber };
}
