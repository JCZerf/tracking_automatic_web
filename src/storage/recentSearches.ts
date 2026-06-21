export type RecentSearch = {
  trackingCode: string;
  searchedAt: string;
};

const RECENT_SEARCHES_KEY = "tracking-recent-searches";
const MAX_RECENT_SEARCHES = 100;

export function loadRecentSearches(): RecentSearch[] {
  try {
    const storedValue: unknown = JSON.parse(
      localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]",
    );

    if (!Array.isArray(storedValue)) return [];

    return storedValue
      .filter(
        (item): item is RecentSearch =>
          item !== null &&
          typeof item === "object" &&
          typeof item.trackingCode === "string" &&
          typeof item.searchedAt === "string",
      )
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function addRecentSearch(
  currentSearches: RecentSearch[],
  trackingCode: string,
) {
  const updatedSearches = [
    { trackingCode, searchedAt: new Date().toISOString() },
    ...currentSearches.filter((search) => search.trackingCode !== trackingCode),
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
  } catch {
    // A consulta continua funcionando se o navegador bloquear o storage.
  }

  return updatedSearches;
}

export function removeRecentSearch(
  currentSearches: RecentSearch[],
  trackingCode: string,
) {
  const updatedSearches = currentSearches.filter(
    (search) => search.trackingCode !== trackingCode,
  );

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
  } catch {
    // A consulta continua funcionando se o navegador bloquear o storage.
  }

  return updatedSearches;
}

export function clearStoredRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // O estado da tela ainda pode ser limpo sem acesso ao storage.
  }
}
