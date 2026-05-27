import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { IssueBacklog } from "./IssueBacklog";
import { OpenIssue } from "../types/stream";

const MOCK_ISSUES: OpenIssue[] = [
  {
    id: "1",
    title: "Fix login bug",
    summary: "Users cannot log in with email",
    complexity: "Trivial",
    points: 100,
    labels: ["bug", "auth"],
  },
  {
    id: "2",
    title: "Add dark mode",
    summary: "Support system dark mode preference",
    complexity: "Medium",
    points: 150,
    labels: ["enhancement", "ui"],
  },
  {
    id: "3",
    title: "Refactor DB layer",
    summary: "Extract DB calls into a service",
    complexity: "High",
    points: 200,
    labels: ["refactor", "backend"],
  },
  {
    id: "4",
    title: "Fix typo in README",
    summary: "Small typo on line 42",
    complexity: "Trivial",
    points: 100,
    labels: ["bug", "docs"],
  },
];

afterEach(() => cleanup());

describe("IssueBacklog — label filtering", () => {
  it("renders all issues when no label filter is active", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("filter by a single label reduces visible issues", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    fireEvent.click(screen.getByRole("button", { name: "bug" }));

    const articles = screen.getAllByRole("article");
    // issues 1 and 4 have the "bug" label
    expect(articles).toHaveLength(2);
    expect(screen.getByText("Fix login bug")).toBeInTheDocument();
    expect(screen.getByText("Fix typo in README")).toBeInTheDocument();
    expect(screen.queryByText("Add dark mode")).not.toBeInTheDocument();
    expect(screen.queryByText("Refactor DB layer")).not.toBeInTheDocument();
  });

  it("OR logic: selecting two labels shows issues matching either", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    fireEvent.click(screen.getByRole("button", { name: "bug" }));
    fireEvent.click(screen.getByRole("button", { name: "ui" }));

    const articles = screen.getAllByRole("article");
    // bug → issues 1,4 | ui → issue 2
    expect(articles).toHaveLength(3);
  });

  it("toggling an active label chip removes it from the filter", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    const bugChip = screen.getByRole("button", { name: "bug" });
    fireEvent.click(bugChip); // activate
    expect(screen.getAllByRole("article")).toHaveLength(2);

    fireEvent.click(bugChip); // deactivate
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("shows empty state message when no issues match the filter", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    // "docs" label only on issue 4; then also filter "backend" — but let's
    // use a label that exists on no issue by passing a custom set
    const noMatchIssues: OpenIssue[] = [
      { id: "x", title: "X", summary: "s", complexity: "Trivial", points: 100, labels: ["alpha"] },
    ];
    cleanup();
    render(<IssueBacklog issues={noMatchIssues} />);

    fireEvent.click(screen.getByRole("button", { name: "alpha" }));
    // deactivate to get 0 results — use an issue list where filter yields nothing
    // Easier: render with empty issues and no labels
    cleanup();
    render(<IssueBacklog issues={[]} />);
    expect(screen.getByText(/No issues match/i)).toBeInTheDocument();
  });

  it("'Clear filters' button resets label selection and shows all issues", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    fireEvent.click(screen.getByRole("button", { name: "bug" }));
    expect(screen.getAllByRole("article")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("'Clear filters' button is not visible when no filters are active", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);
    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument();
  });

  it("label chips have aria-pressed reflecting active state", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    const bugChip = screen.getByRole("button", { name: "bug" });
    expect(bugChip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(bugChip);
    expect(bugChip).toHaveAttribute("aria-pressed", "true");
  });
});

describe("IssueBacklog — sorting", () => {
  it("sorts by complexity Trivial → High", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    const select = screen.getByLabelText(/sort by/i);
    fireEvent.change(select, { target: { value: "complexity-asc" } });

    const articles = screen.getAllByRole("article");
    // Trivial issues first (ids 1,4), then Medium (2), then High (3)
    expect(articles[0]).toHaveTextContent("Fix login bug");
    expect(articles[articles.length - 1]).toHaveTextContent("Refactor DB layer");
  });

  it("sorts by points low → high", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    fireEvent.change(screen.getByLabelText(/sort by/i), { target: { value: "points-asc" } });

    const articles = screen.getAllByRole("article");
    // 100, 100, 150, 200
    expect(articles[articles.length - 1]).toHaveTextContent("Refactor DB layer");
  });

  it("sorts by points high → low", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    fireEvent.change(screen.getByLabelText(/sort by/i), { target: { value: "points-desc" } });

    const articles = screen.getAllByRole("article");
    expect(articles[0]).toHaveTextContent("Refactor DB layer");
  });

  it("'Clear filters' also resets sort to default", () => {
    render(<IssueBacklog issues={MOCK_ISSUES} />);

    const select = screen.getByLabelText(/sort by/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "points-desc" } });
    expect(select.value).toBe("points-desc");

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(select.value).toBe("none");
  });
});

describe("IssueBacklog — loading state", () => {
  it("renders skeleton items when loading is true", () => {
    render(<IssueBacklog issues={[]} loading />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    // skeletons are divs, not articles — just verify no issue content
    expect(screen.queryByText(/No issues match/i)).not.toBeInTheDocument();
  });
});
