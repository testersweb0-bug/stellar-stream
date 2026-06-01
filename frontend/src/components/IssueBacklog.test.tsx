import { render, screen } from '@testing-library/react';
import { IssueBacklog } from './IssueBacklog';

describe('IssueBacklog', () => {
  it('renders empty state when no issues', () => {
    render(<IssueBacklog issues={[]} />);
    expect(screen.getByText('Maintainer Backlog')).toBeInTheDocument();
    expect(screen.getByText('No backlog issues.')).toBeInTheDocument();
  });

  it('renders a list of issues', () => {
    const issues = [
      { id: '1', title: 'Fix bug', summary: 'A bug', complexity: 'Trivial', points: 1, labels: [] },
    ];
    render(<IssueBacklog issues={issues as any} />);
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
  });
});
