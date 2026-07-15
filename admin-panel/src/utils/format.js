export function formatIndian(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const parts = num.toFixed(2).split('.');
  let intPart = parts[0];
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  if (rest) {
    intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return '₹' + intPart + '.' + parts[1];
}

export function formatIndianInt(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  let str = Math.round(Number(num)).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  if (rest) {
    str = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return str;
}

export function formatIndianPlain(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const parts = Number(num).toFixed(2).split('.');
  let intPart = parts[0];
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  if (rest) {
    intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return intPart + '.' + parts[1];
}
