import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import { AssignUserModal } from "../components/assign-user";
import { useUsers } from "../hooks/useUsers";
import { useAssignUser } from "../hooks/useTickets";

jest.mock("../hooks/useUsers");
jest.mock("../hooks/useTickets");

const mockUseUsers = useUsers as jest.Mock;
const mockUseAssignUser = useAssignUser as jest.Mock;

describe("AssignUserModal Component", () => {
  const mockOnClose = jest.fn();
  const mockMutate = jest.fn();
  const mockUsers = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });

    mockUseAssignUser.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  afterEach(cleanup);

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

    const option = await screen.findByText("Alice");

    fireEvent.click(option);

    const confirmButton = screen.getByRole("button", { name: /Confirm/i });
    fireEvent.click(confirmButton);

    expect(mockMutate).toHaveBeenCalledWith(
      { ticketId: 101, userId: 1 },
      expect.objectContaining({
        onSettled: expect.any(Function),
      }),
    );
  });
});
