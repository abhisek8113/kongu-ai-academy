export const TICKET_STATUSES = ["New", "Under Review", "In Progress", "Waiting for Student", "Resolved", "Closed"];
export const SEVERITIES = ["Low", "Medium", "High", "Critical"];

export const statusClass = (s: string) =>
  s === "Resolved" || s === "Closed" ? "border-[#1f7a4d] text-[#5fd39a]" :
  s === "Waiting for Student" ? "border-gold/50 text-gold" :
  s === "New" ? "border-madder/60 text-[#9DB6FF]" : "border-cyan/40 text-cyan";

export const severityClass = (s: string) =>
  s === "Critical" ? "text-[#FF8A8A]" : s === "High" ? "text-gold" : "text-mute";

export function duration(from: string, to?: string | null) {
  const ms = new Date(to ?? Date.now()).getTime() - new Date(from).getTime();
  const h = ms / 3600000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${Math.round(h / 24)} days`;
}
