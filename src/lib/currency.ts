export function formatINR(rupees: number): string {
  if (rupees == null || isNaN(rupees)) return "₹0";
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}
