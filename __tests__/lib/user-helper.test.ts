import { vi, describe, it, expect, beforeEach } from "vitest";

const {
  mockSelect,
  mockUpdate,
  mockInsert,
  mockLimit,
  mockWhere,
  mockFrom,
  mockSet,
  mockSetWhere,
  mockReturning,
  mockValues
} = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  const mockSetWhere = vi.fn();
  const mockSet = vi.fn(() => ({ where: mockSetWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));

  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  return {
    mockSelect,
    mockUpdate,
    mockInsert,
    mockLimit,
    mockWhere,
    mockFrom,
    mockSet,
    mockSetWhere,
    mockReturning,
    mockValues,
  };
});

vi.mock("@/config/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  },
}));

// Import helper after mock is hoisted
import { getOrCreateUser } from "@/lib/user-helper";

describe("getOrCreateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if user does not have an email or clerk ID", async () => {
    const invalidUser = { id: "", primaryEmailAddress: null };
    const result = await getOrCreateUser(invalidUser);
    expect(result).toBeNull();
  });

  it("should find and return an existing user by clerkId", async () => {
    const mockDbUser = {
      id: 123,
      name: "John Doe",
      email: "john@example.com",
      credits: 5,
      maxCredits: 10,
      tier: "starter",
      clerkId: "user_clerk_123",
    };

    mockLimit.mockResolvedValueOnce([mockDbUser]);

    const clerkUser = {
      id: "user_clerk_123",
      fullName: "John Doe",
      primaryEmailAddress: { emailAddress: "john@example.com" },
    };

    const result = await getOrCreateUser(clerkUser);
    expect(result).toEqual(mockDbUser);
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should fall back to searching by email, link clerkId, and return the updated user", async () => {
    const mockExistingUser = {
      id: 456,
      name: "Jane Smith",
      email: "jane@example.com",
      credits: 2,
      maxCredits: 2,
      tier: "free",
      clerkId: null,
    };

    // First select (by clerkId) returns empty
    mockLimit.mockResolvedValueOnce([]);
    // Second select (by email) returns the user
    mockLimit.mockResolvedValueOnce([mockExistingUser]);
    mockSetWhere.mockResolvedValueOnce({});

    const clerkUser = {
      id: "user_clerk_456",
      fullName: "Jane Smith",
      primaryEmailAddress: { emailAddress: "jane@example.com" },
    };

    const result = await getOrCreateUser(clerkUser);

    expect(result).toEqual({ ...mockExistingUser, clerkId: "user_clerk_456" });
    expect(mockSelect).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({ clerkId: "user_clerk_456" });
  });

  it("should insert and return a new user if they do not exist by clerkId or email", async () => {
    const mockNewUser = {
      id: 789,
      name: "Alice Wonderland",
      email: "alice@example.com",
      credits: 2,
      maxCredits: 2,
      tier: "free",
      clerkId: "user_clerk_789",
    };

    // First select (by clerkId) returns empty
    mockLimit.mockResolvedValueOnce([]);
    // Second select (by email) returns empty
    mockLimit.mockResolvedValueOnce([]);
    // Insert returning resolves to mockNewUser
    mockReturning.mockResolvedValueOnce([mockNewUser]);

    const clerkUser = {
      id: "user_clerk_789",
      fullName: "Alice Wonderland",
      primaryEmailAddress: { emailAddress: "alice@example.com" },
    };

    const result = await getOrCreateUser(clerkUser);

    expect(result).toEqual(mockNewUser);
    expect(mockSelect).toHaveBeenCalledTimes(2);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockValues).toHaveBeenCalledWith({
      name: "Alice Wonderland",
      email: "alice@example.com",
      clerkId: "user_clerk_789",
      credits: 2,
      maxCredits: 2,
      tier: "free",
    });
  });
});
