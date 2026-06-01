
import { OpenIssue } from "../types/stream";

interface IssueBacklogProps {
  issues?: OpenIssue[];
  loading?: boolean;
}

export function IssueBacklog({ issues = [], loading = false }: IssueBacklogProps) {
  if (loading) {
    return (
      <div className="card">
        <h2>Maintainer Backlog</h2>
        <p className="muted">Loading...</p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="card">
        <h2>Maintainer Backlog</h2>
        <p className="muted">No backlog issues.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Maintainer Backlog</h2>
      <div className="issue-list">
        {issues.map((issue) => (
          <article key={issue.id} className="issue-item">
            <h3>{issue.title}</h3>
            <p>{issue.summary}</p>
            <p className="muted">Complexity: {issue.complexity} | Points: {issue.points}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
