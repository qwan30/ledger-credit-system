import { render, screen } from "@testing-library/react";

import { AppShell } from "@/components/layout/app-shell";

describe("AppShell", () => {
  it("renders navigation labels", () => {
    render(<AppShell>Body</AppShell>);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("New transfer")).toBeInTheDocument();
    expect(screen.getByText("Credit request")).toBeInTheDocument();
  });
});
