import { useState, useMemo } from "react";
import { OpenIssue } from "../types/stream";

type SortKey = "none" | "complexity-asc" | "points-asc" | "points-desc";

const COMPLEXITY_ORDER: Record<OpenIssue["complexity"], number> = {
  Trivial: 0,
  Medium: 1,
  High: 2,
};

interface IssueBacklogProps {
  issues: OpenIssue[];
  loading?: boolean;
}

export function IssueBacklog({ issues, loading }: IssueBacklogProps) {
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("none");

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((issue) => issue.labels.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [issues]);

  const toggleLabel = (label: string) => {
    setActiveLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const clearFilters = () => {
    setActiveLabels([]);
    setSortKey("none");
  };

  const hasActiveFilters = activeLabels.length > 0 || sortKey !== "none";

  const visibleIssues = useMemo(() => {
    let result = issues;

    if (activeLabels.length > 0) {
      result = result.filter((issue) =>
        activeLabels.some((label) => issue.labels.includes(label))
      );
    }

    if (sortKey === "complexity-asc") {
      result = [...result].sort(
        (a, b) => COMPLEXITY_ORDER[a.complexity] - COMPLEXITY_ORDER[b.complexity]
      );
    } else if (sortKey === "points-asc") {
      result = [...result].sort((a, b) => a.points - b.points);
    } else if (sortKey === "points-desc") {
      result = [...result].sort((a, b) => b.points - a.points);
    }

    return result;
  }, [issues, activeLabels, sortKey]);

  if (loading) {
    return (
      <div className="card">
        <h2>Maintainer Backlog</h2>
        <div className="activity-feed">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-item" style={{ height: "100px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Maintainer Backlog</h2>
      <p className="muted">Open these as GitHub issues after publishing the repository.</p>

      {/* Controls */}
      <div
        className="backlog-controls"
        style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", margin: "1rem 0" }}
      >
        {/* Label filter chips */}
        {allLabels.length > 0 && (
          <div
            className="chip-row"
            role="group"
            aria-label="Filter by label"
            style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
          >
            {allLabels.map((label) => {
              const active = activeLabels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  aria-pressed={active}
                  className={active ? "chip chip-active" : "chip"}
                  style={{
                    cursor: "pointer",
                    border: active ? "2px solid #6366f1" : "2px solid transparent",
                    background: active ? "#eef2ff" : undefined,
                    fontWeight: active ? 600 : undefined,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Sort select */}
        <div className="field-group" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="backlog-sort" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Sort by:
          </label>
          <select
            id="backlog-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "0.35rem 0.6rem",
              fontSize: "0.85rem",
            }}
          >
            <option value="none">Default</option>
            <option value="complexity-asc">Complexity (Trivial → High)</option>
            <option value="points-asc">Points (Low → High)</option>
            <option value="points-desc">Points (High → Low)</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-ghost"
            onClick={clearFilters}
            style={{ fontSize: "0.85rem", color: "#6b7280" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count when filtering */}
      {activeLabels.length > 0 && (
        <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Showing {visibleIssues.length} of {issues.length} issues
        </p>
      )}

      {/* Issue list */}
      <div className="issue-list">
        {visibleIssues.length === 0 ? (
          <p className="muted">No issues match the selected filters.</p>
        ) : (
          visibleIssues.map((issue) => (
            <article key={issue.id} className="issue-item">
              <h3>{issue.title}</h3>
              <p>{issue.summary}</p>
              <p className="muted">
                Complexity: {issue.complexity} | Points: {issue.points}
              </p>
              <div className="chip-row">
                {issue.labels.map((label) => (
                  <span
                    key={label}
                    className={activeLabels.includes(label) ? "chip chip-active" : "chip"}
                    style={
                      activeLabels.includes(label)
                        ? { background: "#eef2ff", fontWeight: 600 }
                        : undefined
                    }
                  >
                    {label}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
