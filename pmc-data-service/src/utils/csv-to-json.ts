export function convertCsvToJson(csvString: string) {
  const lines = csvString.split(/\r?\n/);
  const result: Array<Record<string, string>> = [];

  if (lines.length < 2) return result;

  // Регулярное выражение для парсинга CSV строк
  const csvRegex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;

  // Парсим заголовки
  const headers = [];
  let match;

  while ((match = csvRegex.exec(lines[0])) !== null) {
    headers.push((match[1] || match[2] || "").replace(/""/g, '"').trim());
  }

  // Парсим строки данных
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;

    const values: Array<string> = [];
    let rowMatch;

    // Сбрасываем lastIndex для regex
    csvRegex.lastIndex = 0;

    while ((rowMatch = csvRegex.exec(lines[i])) !== null) {
      values.push(
        (rowMatch[1] || rowMatch[2] || "").replace(/""/g, '"').trim(),
      );
    }

    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    result.push(obj);
  }

  return result;
}
