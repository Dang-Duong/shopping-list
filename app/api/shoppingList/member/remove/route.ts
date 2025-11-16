/**
 * shoppingList/member/remove - Remove member from shopping list
 * DELETE /api/shoppingList/member/remove
 * Authorized: Owner
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwner } from "@/app/middleware/auth";
import { validateShoppingListMemberRemoveDtoIn } from "@/app/validation";
import {
  ShoppingListMemberRemoveDtoOut,
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
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListMemberRemoveDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListMemberRemoveDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListMemberRemoveDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Owner only
  // Mock check - in production would query database for shopping list owner
  const mockOwnerId = "mock-owner-id"; // Would be fetched from database
  const ownerCheck = requireOwner(identity, mockOwnerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListMemberRemoveDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListMemberRemoveDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    userId: validation.dtoIn.userId,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, ownerCheck.errors),
  } as UuAppResponse<ShoppingListMemberRemoveDtoOut>);
}

