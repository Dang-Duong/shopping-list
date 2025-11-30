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
import { getShoppingListOwnerId } from "@/lib/db/shoppingList";
import { removeMember } from "@/lib/db/member";

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
  // Get shopping list owner ID from database
  const { ownerId, errors: ownerErrors } = await getShoppingListOwnerId(
    validation.dtoIn.shoppingListId
  );
  if (!ownerId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListMemberRemoveDtoOut>,
      { status: 404 }
    );
  }

  const ownerCheck = requireOwner(identity, ownerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListMemberRemoveDtoOut>,
      { status: 403 }
    );
  }

  // Remove member from shopping list in database
  const { success, errors: removeErrors } = await removeMember(
    validation.dtoIn.shoppingListId,
    validation.dtoIn.userId
  );

  if (!success) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberRemoveDtoOut,
        uuAppErrorMap: removeErrors,
      } as UuAppResponse<ShoppingListMemberRemoveDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListMemberRemoveDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    userId: validation.dtoIn.userId,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      ownerCheck.errors,
      removeErrors
    ),
  } as UuAppResponse<ShoppingListMemberRemoveDtoOut>);
}

