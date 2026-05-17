import { render, screen } from "@testing-library/react";
import { GroupCard } from "@/components/GroupCard";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("GroupCard", () => {
  it("renders group name and shortened address", () => {
    render(
      <GroupCard
        contractId="GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTU"
        name="Design Team"
      />
    );
    expect(screen.getByText("Design Team")).toBeInTheDocument();
    expect(screen.getByText(/GABCDE/)).toBeInTheDocument();
  });
});
