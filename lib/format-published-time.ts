export function formatPublishedTime(
  createdAt?: string | null,
  timeZone: string = "America/Sao_Paulo"
): string {
  if (!createdAt) return "Publicado agora";

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return "Publicado agora";

  const now = new Date();

  const nowInTz = new Date(
    now.toLocaleString("en-US", { timeZone })
  );
  const createdInTz = new Date(
    parsed.toLocaleString("en-US", { timeZone })
  );

  let diffMs = nowInTz.getTime() - createdInTz.getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) diffMs = 0;

  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `Publicado há ${diffSeconds}s`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `Publicado há ${diffMinutes}min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return `Publicado há ${diffHours}h`;
}
