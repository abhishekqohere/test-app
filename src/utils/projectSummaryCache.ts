type CachedProjectSummary = {
  projectId: string;
  name: string;
  memberCount: number;
  updatedAt: number;
};

const projectSummaryCache = new Map<string, CachedProjectSummary>();

export function cacheProjectSummary(summary: CachedProjectSummary) {
  projectSummaryCache.set(summary.projectId, {
    ...summary,
    updatedAt: Date.now(),
  });

  return summary;
}

export function getCachedProjectSummary(projectId: string) {
  return projectSummaryCache.get(projectId) ?? null;
}

export function clearProjectSummaryCache(projectId: string) {
  projectSummaryCache.delete(projectId);
}
