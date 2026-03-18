export function formatPublishedTime(
  createdAt?: string | null,
  timeZone: string = "America/Sao_Paulo"
): string {
  if (!createdAt) return "Agora";

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return "Agora";

  const now = new Date();

  // Get current time in specified timezone
  const nowInTz = new Date(
    now.toLocaleString("en-US", { timeZone })
  );
  
  // Get created time in specified timezone
  const createdInTz = new Date(
    parsed.toLocaleString("en-US", { timeZone })
  );

  let diffMs = nowInTz.getTime() - createdInTz.getTime();

  // If it's in the future or very recent, return "Agora"
  if (diffMs < 30000) return "Agora";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `Há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Há ${diffHours} h`;
  }

  // Fallback for older dates
  return parsed.toLocaleDateString("pt-BR", { 
    day: "2-digit", 
    month: "2-digit",
    timeZone 
  });
}
