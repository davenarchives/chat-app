import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const mockOnAuthStateChanged = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();

const mockCollection = jest.fn();
const mockQuery = jest.fn(() => ({}));
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signOut: (...args) => mockSignOut(...args),
}));

jest.mock("firebase/firestore", () => ({
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock("./firebase", () => ({
  auth: {},
  provider: {},
  db: {},
}));

describe("App authentication flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSnapshot.mockImplementation(() => jest.fn());
  });

  it("shows Google sign-in button when no user is authenticated", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(<App />);

    const signInButton = await screen.findByRole("button", { name: /sign in with google/i });
    expect(signInButton).toBeInTheDocument();
  });

  it("shows chat room and sign out when a user is authenticated", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback({ displayName: "Test User", uid: "123" });
      return jest.fn();
    });

    mockOnSnapshot.mockImplementation((_query, callback) => {
      callback({ docs: [] });
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/chat room/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
