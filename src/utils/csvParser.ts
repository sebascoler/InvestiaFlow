/**
 * Pure CSV parser with auto-delimiter detection, quoted field handling,
 * UTF-8 BOM removal, and empty row skipping.
 */

type ParsedCSV = {
  headers: string[];
  rows: Record<string, string>[];
};

function detectDelimiter(firstLine: string): string {
  const candidates = [',', ';', '\t'];
  let best = ',';
  let bestCount = 0;

  for (const delimiter of candidates) {
    const count = firstLine.split(delimiter).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = delimiter;
    }
  }

  return best;
}

function removeBOM(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

function parseRow(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote (double-quote)
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      current += char;
      i++;
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === delimiter) {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  // Push last field
  fields.push(current.trim());

  return fields;
}

function isEmptyRow(fields: string[]): boolean {
  return fields.every((f) => f === '');
}

export function parseCSV(text: string): ParsedCSV {
  const cleaned = removeBOM(text);

  // Split into lines, handling both \r\n and \n
  const lines = cleaned.split(/\r?\n/);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Find first non-empty line for delimiter detection
  const firstNonEmptyLine = lines.find((l) => l.trim() !== '');
  if (!firstNonEmptyLine) {
    return { headers: [], rows: [] };
  }

  const delimiter = detectDelimiter(firstNonEmptyLine);

  // Parse headers from first non-empty line
  const headers = parseRow(firstNonEmptyLine, delimiter);
  const headerStartIndex = lines.indexOf(firstNonEmptyLine);

  const rows: Record<string, string>[] = [];

  for (let i = headerStartIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      continue;
    }

    const fields = parseRow(line, delimiter);

    if (isEmptyRow(fields)) {
      continue;
    }

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = j < fields.length ? fields[j] : '';
    }

    rows.push(row);
  }

  return { headers, rows };
}
