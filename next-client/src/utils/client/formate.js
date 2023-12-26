export function formateAddress(address) {
  if (address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return "";
}

export function toBigInt(value) {
  return Number.isInteger(value) ? BigInt(value).toString() : value;
}

export function progress(value, total) {
  return (value * 100) / total;
}
