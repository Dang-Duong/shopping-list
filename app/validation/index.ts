/**
 * Validation Schemas
 *
 * Implements dtoln (data transfer object validation) patterns
 * for all dtoIn types. Returns errors in uuAppErrorMap format.
 */

import {
  ShoppingListListDtoIn,
  ShoppingListArchiveDtoIn,
  ShoppingListCreateDtoIn,
  ShoppingListDeleteDtoIn,
  ShoppingListGetDtoIn,
  ShoppingListRenameDtoIn,
  ShoppingListMemberAddDtoIn,
  ShoppingListMemberRemoveDtoIn,
  ShoppingListMemberLeaveDtoIn,
  ShoppingListItemListDtoIn,
  ShoppingListItemAddDtoIn,
  ShoppingListItemRemoveDtoIn,
  ShoppingListItemCompleteDtoIn,
  ShoppingListItemUncompleteDtoIn,
  UuAppErrorMap,
} from "@/app/dto";
import {
  ErrorCode,
  ErrorMessages,
  createErrorMap,
  mergeErrorMaps,
  isEmptyErrorMap,
} from "@/app/utils/errors";

/**
 * Validate a string field
 */
function validateString(
  value: unknown,
  fieldName: string,
  required: boolean = true,
  minLength?: number,
  maxLength?: number
): UuAppErrorMap {
  const errors: UuAppErrorMap = {};

  if (value === undefined || value === null) {
    if (required) {
      return createErrorMap(
        fieldName,
        ErrorCode.MISSING_REQUIRED_FIELD,
        ErrorMessages.MISSING_REQUIRED_FIELD(fieldName)
      );
    }
    return errors;
  }

  if (typeof value !== "string") {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_TYPE,
      ErrorMessages.INVALID_FIELD_TYPE(fieldName, "string")
    );
  }

  if (minLength !== undefined && value.length < minLength) {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_VALUE,
      ErrorMessages.INVALID_FIELD_VALUE(
        fieldName,
        `minimum length is ${minLength}`
      )
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_VALUE,
      ErrorMessages.INVALID_FIELD_VALUE(
        fieldName,
        `maximum length is ${maxLength}`
      )
    );
  }

  return errors;
}

/**
 * Validate a number field
 */
function validateNumber(
  value: unknown,
  fieldName: string,
  required: boolean = false,
  min?: number,
  max?: number
): UuAppErrorMap {
  const errors: UuAppErrorMap = {};

  if (value === undefined || value === null) {
    if (required) {
      return createErrorMap(
        fieldName,
        ErrorCode.MISSING_REQUIRED_FIELD,
        ErrorMessages.MISSING_REQUIRED_FIELD(fieldName)
      );
    }
    return errors;
  }

  if (typeof value !== "number") {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_TYPE,
      ErrorMessages.INVALID_FIELD_TYPE(fieldName, "number")
    );
  }

  if (min !== undefined && value < min) {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_VALUE,
      ErrorMessages.INVALID_FIELD_VALUE(fieldName, `minimum value is ${min}`)
    );
  }

  if (max !== undefined && value > max) {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_VALUE,
      ErrorMessages.INVALID_FIELD_VALUE(fieldName, `maximum value is ${max}`)
    );
  }

  return errors;
}

/**
 * Validate a boolean field
 */
function validateBoolean(
  value: unknown,
  fieldName: string,
  required: boolean = false
): UuAppErrorMap {
  const errors: UuAppErrorMap = {};

  if (value === undefined || value === null) {
    if (required) {
      return createErrorMap(
        fieldName,
        ErrorCode.MISSING_REQUIRED_FIELD,
        ErrorMessages.MISSING_REQUIRED_FIELD(fieldName)
      );
    }
    return errors;
  }

  if (typeof value !== "boolean") {
    return createErrorMap(
      fieldName,
      ErrorCode.INVALID_FIELD_TYPE,
      ErrorMessages.INVALID_FIELD_TYPE(fieldName, "boolean")
    );
  }

  return errors;
}

// ============================================================================
// Shopping List Validators
// ============================================================================

/**
 * Validate shoppingList/list dtoIn
 */
export function validateShoppingListListDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListListDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListListDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListListDtoIn = {};

  // archived is optional boolean
  if ("archived" in input) {
    const archivedErrors = validateBoolean(input.archived, "archived", false);
    Object.assign(errors, archivedErrors);
    if (isEmptyErrorMap(archivedErrors)) {
      validated.archived = input.archived as boolean;
    }
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/archive dtoIn
 */
export function validateShoppingListArchiveDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListArchiveDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListArchiveDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListArchiveDtoIn = {} as ShoppingListArchiveDtoIn;

  const idErrors = validateString(input.id, "id", true);
  Object.assign(errors, idErrors);
  if (isEmptyErrorMap(idErrors)) {
    validated.id = input.id as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/create dtoIn
 */
export function validateShoppingListCreateDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListCreateDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListCreateDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListCreateDtoIn = {} as ShoppingListCreateDtoIn;

  const nameErrors = validateString(input.name, "name", true, 1, 255);
  Object.assign(errors, nameErrors);
  if (isEmptyErrorMap(nameErrors)) {
    validated.name = input.name as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/delete dtoIn
 */
export function validateShoppingListDeleteDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListDeleteDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListDeleteDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListDeleteDtoIn = {} as ShoppingListDeleteDtoIn;

  const idErrors = validateString(input.id, "id", true);
  Object.assign(errors, idErrors);
  if (isEmptyErrorMap(idErrors)) {
    validated.id = input.id as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/get dtoIn
 */
export function validateShoppingListGetDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListGetDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListGetDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListGetDtoIn = {} as ShoppingListGetDtoIn;

  const idErrors = validateString(input.id, "id", true);
  Object.assign(errors, idErrors);
  if (isEmptyErrorMap(idErrors)) {
    validated.id = input.id as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/rename dtoIn
 */
export function validateShoppingListRenameDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListRenameDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListRenameDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListRenameDtoIn = {} as ShoppingListRenameDtoIn;

  const idErrors = validateString(input.id, "id", true);
  Object.assign(errors, idErrors);
  if (isEmptyErrorMap(idErrors)) {
    validated.id = input.id as string;
  }

  const nameErrors = validateString(input.name, "name", true, 1, 255);
  Object.assign(errors, nameErrors);
  if (isEmptyErrorMap(nameErrors)) {
    validated.name = input.name as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

// ============================================================================
// Member Validators
// ============================================================================

/**
 * Validate shoppingList/member/add dtoIn
 */
export function validateShoppingListMemberAddDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListMemberAddDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListMemberAddDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListMemberAddDtoIn =
    {} as ShoppingListMemberAddDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  const userIdErrors = validateString(input.userId, "userId", true);
  Object.assign(errors, userIdErrors);
  if (isEmptyErrorMap(userIdErrors)) {
    validated.userId = input.userId as string;
  }

  if ("role" in input) {
    const roleErrors = validateString(input.role, "role", false);
    Object.assign(errors, roleErrors);
    if (isEmptyErrorMap(roleErrors)) {
      validated.role = input.role as string;
    }
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/member/remove dtoIn
 */
export function validateShoppingListMemberRemoveDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListMemberRemoveDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListMemberRemoveDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListMemberRemoveDtoIn =
    {} as ShoppingListMemberRemoveDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  const userIdErrors = validateString(input.userId, "userId", true);
  Object.assign(errors, userIdErrors);
  if (isEmptyErrorMap(userIdErrors)) {
    validated.userId = input.userId as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/member/leave dtoIn
 */
export function validateShoppingListMemberLeaveDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListMemberLeaveDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListMemberLeaveDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListMemberLeaveDtoIn =
    {} as ShoppingListMemberLeaveDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

// ============================================================================
// Item Validators
// ============================================================================

/**
 * Validate shoppingList/item/list dtoIn
 */
export function validateShoppingListItemListDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListItemListDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListItemListDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListItemListDtoIn = {} as ShoppingListItemListDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/item/add dtoIn
 */
export function validateShoppingListItemAddDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListItemAddDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListItemAddDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListItemAddDtoIn = {} as ShoppingListItemAddDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  const nameErrors = validateString(input.name, "name", true, 1, 255);
  Object.assign(errors, nameErrors);
  if (isEmptyErrorMap(nameErrors)) {
    validated.name = input.name as string;
  }

  if ("productId" in input) {
    const productIdErrors = validateString(input.productId, "productId", false);
    Object.assign(errors, productIdErrors);
    if (isEmptyErrorMap(productIdErrors)) {
      validated.productId = input.productId as string;
    }
  }

  if ("quantity" in input) {
    const quantityErrors = validateNumber(input.quantity, "quantity", false, 1);
    Object.assign(errors, quantityErrors);
    if (isEmptyErrorMap(quantityErrors)) {
      validated.quantity = input.quantity as number;
    }
  }

  if ("fit" in input) {
    const fitErrors = validateString(input.fit, "fit", false);
    Object.assign(errors, fitErrors);
    if (isEmptyErrorMap(fitErrors)) {
      validated.fit = input.fit as string;
    }
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/item/remove dtoIn
 */
export function validateShoppingListItemRemoveDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListItemRemoveDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListItemRemoveDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListItemRemoveDtoIn =
    {} as ShoppingListItemRemoveDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  const itemIdErrors = validateString(input.itemId, "itemId", true);
  Object.assign(errors, itemIdErrors);
  if (isEmptyErrorMap(itemIdErrors)) {
    validated.itemId = input.itemId as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/item/complete dtoIn
 */
export function validateShoppingListItemCompleteDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListItemCompleteDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListItemCompleteDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListItemCompleteDtoIn =
    {} as ShoppingListItemCompleteDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  const itemIdErrors = validateString(input.itemId, "itemId", true);
  Object.assign(errors, itemIdErrors);
  if (isEmptyErrorMap(itemIdErrors)) {
    validated.itemId = input.itemId as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}

/**
 * Validate shoppingList/item/uncomplete dtoIn
 */
export function validateShoppingListItemUncompleteDtoIn(dtoIn: unknown): {
  isValid: boolean;
  dtoIn: ShoppingListItemUncompleteDtoIn;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  if (!dtoIn || typeof dtoIn !== "object") {
    return {
      isValid: false,
      dtoIn: {} as ShoppingListItemUncompleteDtoIn,
      errors: createErrorMap(
        "dtoIn",
        ErrorCode.INVALID_DTO_IN,
        ErrorMessages.INVALID_DTO_IN
      ),
    };
  }

  const input = dtoIn as Record<string, unknown>;
  const validated: ShoppingListItemUncompleteDtoIn =
    {} as ShoppingListItemUncompleteDtoIn;

  const shoppingListIdErrors = validateString(
    input.shoppingListId,
    "shoppingListId",
    true
  );
  Object.assign(errors, shoppingListIdErrors);
  if (isEmptyErrorMap(shoppingListIdErrors)) {
    validated.shoppingListId = input.shoppingListId as string;
  }

  const itemIdErrors = validateString(input.itemId, "itemId", true);
  Object.assign(errors, itemIdErrors);
  if (isEmptyErrorMap(itemIdErrors)) {
    validated.itemId = input.itemId as string;
  }

  return {
    isValid: isEmptyErrorMap(errors),
    dtoIn: validated,
    errors,
  };
}
