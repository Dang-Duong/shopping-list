/**
 * shoppingList/item/complete - Mark item as completed
 * PUT /api/shoppingList/item/complete
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwnerOrMember } from "@/app/middleware/auth";
import { validateShoppingListItemCompleteDtoIn } from "@/app/validation";
import {
  ShoppingListItemCompleteDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";

export async function PUT(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemCompleteDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListItemCompleteDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemCompleteDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListItemCompleteDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemCompleteDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListItemCompleteDtoOut>,
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
        dtoOut: {} as ShoppingListItemCompleteDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListItemCompleteDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListItemCompleteDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    itemId: validation.dtoIn.itemId,
    completed: true,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, memberCheck.errors),
  } as UuAppResponse<ShoppingListItemCompleteDtoOut>);
}

