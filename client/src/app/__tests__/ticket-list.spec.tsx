import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TicketList } from "../pages/ticket-list";
import { useGetTickets, useToggleComplete } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";

jest.mock("../hooks/useTickets");
jest.mock("../hooks/useUsers");
jest.mock("../components", () => ({
  AssignUserModal: () => <div data-testid="assign-modal" />,
  CreateTicketModal: () => <div data-testid="create-modal" />,
  TicketTable: jest.requireActual("../components/ticket-table").TicketTable,
}));

const mockUseGetTickets = useGetTickets as jest.Mock;
const mockUseToggleComplete = useToggleComplete as jest.Mock;
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

  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });
    mockUseToggleComplete.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("should show tickets list correctly", () => {
    mockUseGetTickets.mockReturnValue({ data: mockTickets, isLoading: false });
    render(<TicketList />, { wrapper: BrowserRouter });

    expect(screen.getByText("Crete test file")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
