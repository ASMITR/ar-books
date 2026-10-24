export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}
