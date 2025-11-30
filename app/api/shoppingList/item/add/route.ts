/**
 * shoppingList/item/add - Add item to shopping list
 * POST /api/shoppingList/item/add
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwnerOrMember } from "@/app/middleware/auth";
import { validateShoppingListItemAddDtoIn } from "@/app/validation";
import {
  ShoppingListItemAddDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { getShoppingListOwnerId } from "@/lib/db/shoppingList";
import { addItem } from "@/lib/db/item";
import { getMemberIds } from "@/lib/db/member";

export async function POST(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemAddDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListItemAddDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemAddDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListItemAddDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemAddDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListItemAddDtoOut>,
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
        dtoOut: {} as ShoppingListItemAddDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListItemAddDtoOut>,
      { status: 404 }
    );
  }

  // Get member IDs from database
  const { memberIds } = await getMemberIds(validation.dtoIn.shoppingListId);

  const memberCheck = requireOwnerOrMember(identity, ownerId, memberIds);
  if (!memberCheck.isAuthorized) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemAddDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListItemAddDtoOut>,
      { status: 403 }
    );
  }

  // Add item to shopping list in database
  const { item, errors: itemErrors } = await addItem(
    validation.dtoIn.shoppingListId,
    {
      name: validation.dtoIn.name,
      productId: validation.dtoIn.productId,
      quantity: validation.dtoIn.quantity,
      fit: validation.dtoIn.fit,
    }
  );

  if (!item) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemAddDtoOut,
        uuAppErrorMap: itemErrors,
      } as UuAppResponse<ShoppingListItemAddDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListItemAddDtoOut = {
    awid: identity.awid,
    id: item.id,
    shoppingListId: validation.dtoIn.shoppingListId,
    name: item.name,
    productId: item.productId,
    quantity: item.quantity,
    fit: item.fit,
    completed: item.completed,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      memberCheck.errors,
      itemErrors
    ),
  } as UuAppResponse<ShoppingListItemAddDtoOut>);
}

