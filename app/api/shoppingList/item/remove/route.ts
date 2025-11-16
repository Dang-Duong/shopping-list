/**
 * shoppingList/item/remove - Remove item from shopping list
 * DELETE /api/shoppingList/item/remove
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwnerOrMember } from "@/app/middleware/auth";
import { validateShoppingListItemRemoveDtoIn } from "@/app/validation";
import {
  ShoppingListItemRemoveDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";

export async function DELETE(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemRemoveDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListItemRemoveDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemRemoveDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListItemRemoveDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemRemoveDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListItemRemoveDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Owner or Member
  // Mock check - in production would query database
  const mockOwnerId = "mock-owner-id";
  const mockMemberIds: string[] = [];
  const memberCheck = requireOwnerOrMember(identity, mockOwnerId, mockMemberIds);
  if (!memberCheck.isAuthorized) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemRemoveDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListItemRemoveDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListItemRemoveDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    itemId: validation.dtoIn.itemId,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, memberCheck.errors),
  } as UuAppResponse<ShoppingListItemRemoveDtoOut>);
}

