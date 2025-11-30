/**
 * shoppingList/rename - Rename a shopping list
 * PUT /api/shoppingList/rename
 * Authorized: Owner
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwner } from "@/app/middleware/auth";
import { validateShoppingListRenameDtoIn } from "@/app/validation";
import {
  ShoppingListRenameDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { getShoppingListOwnerId, updateShoppingListName } from "@/lib/db/shoppingList";

export async function PUT(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListRenameDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListRenameDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListRenameDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Owner only
  // Get shopping list owner ID from database
  const { ownerId, errors: ownerErrors } = await getShoppingListOwnerId(
    validation.dtoIn.id
  );
  if (!ownerId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListRenameDtoOut>,
      { status: 404 }
    );
  }

  const ownerCheck = requireOwner(identity, ownerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListRenameDtoOut>,
      { status: 403 }
    );
  }

  // Update shopping list name in database
  const { shoppingList, errors: updateErrors } = await updateShoppingListName(
    validation.dtoIn.id,
    validation.dtoIn.name
  );

  if (!shoppingList) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: updateErrors,
      } as UuAppResponse<ShoppingListRenameDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListRenameDtoOut = {
    awid: identity.awid,
    id: shoppingList.id,
    name: shoppingList.name,
    state: shoppingList.archived ? "archived" : "active",
    ownerUuIdentity: shoppingList.ownerId,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      ownerCheck.errors,
      updateErrors
    ),
  } as UuAppResponse<ShoppingListRenameDtoOut>);
}

