/**
 * Error Handling Utilities
 *
 * Implements uuAppErrorMap structure and error handling patterns
 * following uuApp Framework conventions.
 */

import { UuAppErrorMap } from "@/app/dto";

/**
 * Error codes following uuApp Framework patterns
 */
export enum ErrorCode {
  // General errors
  INVALID_DTO_IN = "uu-shopping-list/invalidDtoIn",
  MISSING_REQUIRED_FIELD = "uu-shopping-list/missingRequiredField",
  INVALID_FIELD_TYPE = "uu-shopping-list/invalidFieldType",
  INVALID_FIELD_VALUE = "uu-shopping-list/invalidFieldValue",

  // Authentication errors
  UNAUTHORIZED = "uu-shopping-list/unauthorized",
  INVALID_SESSION = "uu-shopping-list/invalidSession",

  // Authorization errors
  FORBIDDEN = "uu-shopping-list/forbidden",
  INSUFFICIENT_PERMISSIONS = "uu-shopping-list/insufficientPermissions",
  NOT_OWNER = "uu-shopping-list/notOwner",
  NOT_MEMBER = "uu-shopping-list/notMember",

  // Resource errors
  SHOPPING_LIST_NOT_FOUND = "uu-shopping-list/shoppingListNotFound",
  ITEM_NOT_FOUND = "uu-shopping-list/itemNotFound",
  MEMBER_NOT_FOUND = "uu-shopping-list/memberNotFound",
  USER_NOT_FOUND = "uu-shopping-list/userNotFound",

  // Business logic errors
  SHOPPING_LIST_ALREADY_ARCHIVED = "uu-shopping-list/shoppingListAlreadyArchived",
  SHOPPING_LIST_NOT_ARCHIVED = "uu-shopping-list/shoppingListNotArchived",
  MEMBER_ALREADY_EXISTS = "uu-shopping-list/memberAlreadyExists",
  ITEM_ALREADY_COMPLETED = "uu-shopping-list/itemAlreadyCompleted",
  ITEM_NOT_COMPLETED = "uu-shopping-list/itemNotCompleted",
}

/**
 * Create an error entry for uuAppErrorMap
 */
export function createError(
  code: ErrorCode | string,
  message: string,
  paramMap?: Record<string, unknown>
): UuAppErrorMap[string] {
  return {
    code,
    message,
    paramMap,
  };
}

/**
 * Create a uuAppErrorMap with a single error
 */
export function createErrorMap(
  key: string,
  code: ErrorCode | string,
  message: string,
  paramMap?: Record<string, unknown>
): UuAppErrorMap {
  return {
    [key]: createError(code, message, paramMap),
  };
}

/**
 * Create a uuAppErrorMap with multiple errors
 */
export function createErrorMapMultiple(
  errors: {
    key: string;
    code: ErrorCode | string;
    message: string;
    paramMap?: Record<string, unknown>;
  }[]
): UuAppErrorMap {
  const errorMap: UuAppErrorMap = {};
  for (const error of errors) {
    errorMap[error.key] = createError(
      error.code,
      error.message,
      error.paramMap
    );
  }
  return errorMap;
}

/**
 * Check if an error map is empty
 */
export function isEmptyErrorMap(errorMap?: UuAppErrorMap): boolean {
  return !errorMap || Object.keys(errorMap).length === 0;
}

/**
 * Merge multiple error maps
 */
export function mergeErrorMaps(
  ...errorMaps: (UuAppErrorMap | undefined)[]
): UuAppErrorMap {
  const merged: UuAppErrorMap = {};
  for (const errorMap of errorMaps) {
    if (errorMap) {
      Object.assign(merged, errorMap);
    }
  }
  return merged;
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  INVALID_DTO_IN: "Invalid input data",
  MISSING_REQUIRED_FIELD: (field: string) => `Missing required field: ${field}`,
  INVALID_FIELD_TYPE: (field: string, expectedType: string) =>
    `Invalid type for field ${field}, expected ${expectedType}`,
  INVALID_FIELD_VALUE: (field: string, reason?: string) =>
    `Invalid value for field ${field}${reason ? `: ${reason}` : ""}`,
  UNAUTHORIZED: "User is not authenticated",
  FORBIDDEN: "Access denied",
  NOT_OWNER: "User is not the owner of this shopping list",
  NOT_MEMBER: "User is not a member of this shopping list",
  SHOPPING_LIST_NOT_FOUND: "Shopping list not found",
  ITEM_NOT_FOUND: "Item not found",
  MEMBER_NOT_FOUND: "Member not found",
};
