/**
 * Service Index
 * Exports services with automatic mock/real switching based on config
 */

import { API_CONFIG } from "@/app/config/api";
import * as realShoppingListService from "./shoppingListService";
import * as realItemService from "./itemService";
import * as realMemberService from "./memberService";
import {
  mockShoppingListService,
  mockItemService,
  mockMemberService,
} from "@/app/mock/mockService";

// Export services based on configuration
export const shoppingListService = API_CONFIG.useMockData
  ? mockShoppingListService
  : realShoppingListService;

export const itemService = API_CONFIG.useMockData
  ? mockItemService
  : realItemService;

export const memberService = API_CONFIG.useMockData
  ? mockMemberService
  : realMemberService;

// Re-export types
export type { ClientShoppingList } from "./types";
export { ApiError } from "./apiClient";

