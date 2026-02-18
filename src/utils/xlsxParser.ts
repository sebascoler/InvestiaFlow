import * as XLSX from 'xlsx';

type ParsedSheet = {
  headers: string[];
  rows: Record<string, string>[];
};

export async function parseXLSX(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Read the first sheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    return { headers: [], rows: [] };
  }

  // Convert sheet to array of arrays (raw data)
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  });

  if (rawData.length === 0) {
    return { headers: [], rows: [] };
  }

  // First row = headers, convert all to strings
  const headers = rawData[0].map((cell) => String(cell ?? ''));

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < rawData.length; i++) {
    const rawRow = rawData[i];
    if (!rawRow || rawRow.every((cell) => cell === '' || cell === null || cell === undefined)) {
      continue;
    }

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const cellValue = j < rawRow.length ? rawRow[j] : '';
      row[headers[j]] = String(cellValue ?? '');
    }

    rows.push(row);
  }

  return { headers, rows };
}
