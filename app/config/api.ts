/**
 * API Configuration
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  // Mock user identity for development
  mockUser: {
    uuIdentity: "user1",
    awid: "default-awid",
    profile: "Operatives" as const,
  },
};
