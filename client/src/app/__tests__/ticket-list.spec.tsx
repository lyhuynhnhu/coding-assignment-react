import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TicketList } from "../pages/ticket-list";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";

jest.mock("../hooks/useTickets");
jest.mock("../hooks/useUsers");
jest.mock("../components/modal", () => ({
  AssignUserModal: () => <div data-testid="assign-modal" />,
  CreateTicketModal: () => <div data-testid="create-modal" />,
}));

const mockUseTickets = useTickets as jest.Mock;
const mockUseUsers = useUsers as jest.Mock;

describe("TicketList Component", () => {
  const mockTickets = [
    { id: 1, description: "Crete test file", completed: false, assigneeId: 1 },
    {
      id: 2,
      description: "Testing List component",
      completed: true,
      assigneeId: null,
    },
  ];

  const mockUsers = [{ id: 1, name: "Alice" }];

  it("should show tickets list correctly", () => {
    mockUseUsers.mockReturnValue({ users: mockUsers });
    mockUseTickets.mockReturnValue({
      getAllTicket: { data: mockTickets, isLoading: false, isError: false },
      completionMutation: { isPending: false },
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>,
    );

    expect(screen.getByText("Crete test file")).toBeInTheDocument();
    expect(screen.getByText("Testing List component")).toBeInTheDocument();

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
