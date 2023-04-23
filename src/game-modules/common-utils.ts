export const fixCardCode = (code: string): string =>
  code.startsWith("99") ? code.slice(2) : code;
