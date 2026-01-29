import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CreateTicketModal } from "../components/create-ticket";
import { useCreateTicket } from "../hooks/useTickets";

jest.mock("../hooks/useTickets");

const mockUseCreateTicket = useCreateTicket as jest.Mock;

describe("CreateTicketModal Component", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    mockUseCreateTicket.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  afterEach(cleanup);

  it("should render successfully", () => {
    render(<CreateTicketModal />);
    expect(screen.getByText(/New Ticket/i)).toBeInTheDocument();
  });

  it("should create a new ticket", () => {
    render(<CreateTicketModal />);

    fireEvent.click(screen.getByRole("button", { name: /New Ticket/i }));

    const input = screen.getByLabelText(/Description/i);
    fireEvent.change(input, { target: { value: "Test new ticket" } });

    const submitButton = screen.getByRole("button", { name: /Create Ticket/i });
    fireEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      description: "Test new ticket",
    });
  });
});
