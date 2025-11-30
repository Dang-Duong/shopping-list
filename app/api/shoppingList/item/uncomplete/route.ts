/**
 * shoppingList/item/uncomplete - Mark item as uncompleted
 * PUT /api/shoppingList/item/uncomplete
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwnerOrMember } from "@/app/middleware/auth";
import { validateShoppingListItemUncompleteDtoIn } from "@/app/validation";
import {
  ShoppingListItemUncompleteDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { getShoppingListOwnerId } from "@/lib/db/shoppingList";
import { updateItemCompletion } from "@/lib/db/item";
import { getMemberIds } from "@/lib/db/member";

export async function PUT(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemUncompleteDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListItemUncompleteDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemUncompleteDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListItemUncompleteDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemUncompleteDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListItemUncompleteDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Owner or Member
  // Get shopping list owner ID from database
  const { ownerId, errors: ownerErrors } = await getShoppingListOwnerId(
    validation.dtoIn.shoppingListId
  );
  if (!ownerId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemUncompleteDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListItemUncompleteDtoOut>,
      { status: 404 }
    );
  }

  // Get member IDs from database
  const { memberIds } = await getMemberIds(validation.dtoIn.shoppingListId);

  const memberCheck = requireOwnerOrMember(identity, ownerId, memberIds);
  if (!memberCheck.isAuthorized) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemUncompleteDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListItemUncompleteDtoOut>,
      { status: 403 }
    );
  }

  // Update item completion status in database
  const { item, errors: updateErrors } = await updateItemCompletion(
    validation.dtoIn.shoppingListId,
    validation.dtoIn.itemId,
    false
  );

  if (!item) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemUncompleteDtoOut,
        uuAppErrorMap: updateErrors,
      } as UuAppResponse<ShoppingListItemUncompleteDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListItemUncompleteDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    itemId: validation.dtoIn.itemId,
    completed: item.completed,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      memberCheck.errors,
      updateErrors
    ),
  } as UuAppResponse<ShoppingListItemUncompleteDtoOut>);
}

