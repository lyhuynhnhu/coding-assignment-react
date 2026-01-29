import { render, screen, fireEvent, within } from "@testing-library/react";
import { AssignUserModal } from "../components/modal/assign-user";
import { useUsers } from "../hooks/useUsers";
import { useTickets } from "../hooks/useTickets";

jest.mock("../hooks/useUsers");
jest.mock("../hooks/useTickets");

const mockUseUsers = useUsers as jest.Mock;
const mockUseTickets = useTickets as jest.Mock;

describe("AssignUserModal Component", () => {
  const mockOnClose = jest.fn();
  const mockAssignUser = jest.fn();
  const mockUsers = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUsers.mockReturnValue({
      users: mockUsers,
      usersQuery: { isLoading: false },
    });

    mockUseTickets.mockReturnValue({
      assignUser: mockAssignUser,
      isAssigning: false,
    });
  });

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    ticketId: 101,
    currentAssigneeId: null,
  };

  it("should render successfully", () => {
    render(<AssignUserModal {...defaultProps} />);

    expect(screen.getByText(/Assign Representative/i)).toBeInTheDocument();
    expect(screen.getByText(/#101/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument();
  });

  it("should assign a user correctly", async () => {
    render(<AssignUserModal {...defaultProps} />);

    const selectControl = screen.getByLabelText(/Select User/i);
    fireEvent.mouseDown(selectControl);

    const listbox = screen.getByRole("listbox");
    const option = within(listbox).getByText("Alice");
    fireEvent.click(option);

    const confirmButton = screen.getByRole("button", { name: /Confirm/i });
    fireEvent.click(confirmButton);

    expect(mockAssignUser).toHaveBeenCalledWith({ ticketId: 101, userId: 1 });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
