type CsvValue = string | number | null | undefined;

const BOM = String.fromCharCode(0xfeff); // byte-order mark

// Text Excel would run as a formula (=, @, or +/- followed by more than a phone number)
const looksLikeFormula = (text: string) =>
  /^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-][\d\s().-]*$/.test(text));

// Quote a value when it holds a comma, quote or line break, so it stays in one column
const csvCell = (value: CsvValue) => {
  let text = value == null ? '' : String(value);
  if (typeof value === 'string' && looksLikeFormula(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Download rows as a CSV file. The BOM lets Excel read Somali and Arabic names correctly.
export const downloadCsv = (fileName: string, rows: CsvValue[][]) => {
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
