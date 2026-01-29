import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CreateTicketModal } from "../components/modal/create-ticket";
import { useTickets } from "../hooks/useTickets";

jest.mock("../hooks/useTickets");

const mockUseTickets = useTickets as jest.MockedFunction<typeof useTickets>;

describe("CreateTicketModal Component", () => {
  const mockCreateTicket = jest.fn();

  beforeEach(() => {
    mockUseTickets.mockReturnValue({
      createTicket: mockCreateTicket,
      isCreating: false,
    } as any);
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

    expect(mockCreateTicket).toHaveBeenCalledWith({
      description: "Test new ticket",
    });
  });
});
