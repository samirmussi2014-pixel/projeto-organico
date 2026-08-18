import { supabase } from './supabase';

export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    });
    csvLines.push(values.join(','));
  }
  const csv = csvLines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportTable(table: string, filename?: string): Promise<void> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  exportToCsv(filename ?? `${table}.csv`, (data ?? []) as Record<string, unknown>[]);
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export interface DuplicateMatch {
  id: string;
  table: string;
  fields: Record<string, unknown>;
  similarity: number;
}

export async function checkDuplicates(
  table: string,
  record: Record<string, unknown>,
  matchKeys: string[] = ['empresa', 'nome', 'cidade', 'estado', 'telefone', 'site', 'cnpj'],
): Promise<DuplicateMatch[]> {
  const orConditions: string[] = [];
  for (const key of matchKeys) {
    const val = record[key];
    if (val && String(val).trim()) {
      orConditions.push(`${key}.ilike.%${String(val).trim()}%`);
    }
  }
  if (!orConditions.length) return [];

  const { data, error } = await supabase.from(table).select('*').or(orConditions.join(',')).limit(10);
  if (error || !data) return [];

  const matches: DuplicateMatch[] = [];
  for (const row of data as Record<string, unknown>[]) {
    let matchCount = 0;
    let totalChecked = 0;
    for (const key of matchKeys) {
      const val1 = record[key];
      const val2 = row[key];
      if (val1 && val2) {
        totalChecked++;
        if (String(val1).toLowerCase().trim() === String(val2).toLowerCase().trim()) {
          matchCount++;
        }
      }
    }
    if (totalChecked > 0 && matchCount > 0) {
      const similarity = matchCount / totalChecked;
      if (similarity >= 0.3) {
        matches.push({
          id: String(row.id),
          table,
          fields: row,
          similarity,
        });
      }
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
