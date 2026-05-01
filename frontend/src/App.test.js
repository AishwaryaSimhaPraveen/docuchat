import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

// Mock the fetch API so we don't make real API calls in tests
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});


// ── TEST 1: Header renders correctly
test("renders DocuChat header", () => {
  render(<App />);
  expect(screen.getByText("📄 DocuChat")).toBeInTheDocument();
});


// ── TEST 2: Upload section renders
test("renders upload section", () => {
  render(<App />);
  expect(screen.getByText(/Step 1 — Upload your PDF/i)).toBeInTheDocument();
});


// ── TEST 3: Upload button exists
test("renders upload button", () => {
  render(<App />);
  expect(screen.getByText("Upload")).toBeInTheDocument();
});


// ── TEST 4: Chat section hidden before upload
test("chat section not visible before upload", () => {
  render(<App />);
  expect(screen.queryByText(/Step 2/i)).not.toBeInTheDocument();
});


// ── TEST 5: Shows processing status after upload
test("shows uploading status when upload clicked", async () => {
  // Mock a successful upload response
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ message: "test.pdf uploaded and ready to chat!" }),
  });

  render(<App />);

  // Simulate selecting a file
  const fileInput = document.querySelector("input[type='file']");
  const fakeFile = new File(["dummy content"], "test.pdf", {
    type: "application/pdf",
  });
  fireEvent.change(fileInput, { target: { files: [fakeFile] } });

  // Click upload
  fireEvent.click(screen.getByText("Upload"));

  // Check status appears
  await waitFor(() => {
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });
});


// ── TEST 6: Chat appears after successful upload
test("shows chat section after successful upload", async () => {
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ message: "test.pdf uploaded and ready to chat!" }),
  });

  render(<App />);

  const fileInput = document.querySelector("input[type='file']");
  const fakeFile = new File(["dummy content"], "test.pdf", {
    type: "application/pdf",
  });
  fireEvent.change(fileInput, { target: { files: [fakeFile] } });
  fireEvent.click(screen.getByText("Upload"));

  await waitFor(() => {
    expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
  });
});