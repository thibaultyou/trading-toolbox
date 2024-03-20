export function maskString(str: string, visibleLength = 4): string {
  let masked = '';
  if (str.length > visibleLength) {
    masked = '*'.repeat(str.length - visibleLength);
    masked += str.substr(str.length - visibleLength);
  }
  return masked;
}
