/**
 * shoppingList/delete - Delete a shopping list
 * DELETE /api/shoppingList/delete
 * Authorized: Owner
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwner } from "@/app/middleware/auth";
import { validateShoppingListDeleteDtoIn } from "@/app/validation";
import {
  ShoppingListDeleteDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { getShoppingListOwnerId, deleteShoppingList } from "@/lib/db/shoppingList";

export async function DELETE(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListDeleteDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListDeleteDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListDeleteDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListDeleteDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListDeleteDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListDeleteDtoOut>,
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
        dtoOut: {} as ShoppingListDeleteDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListDeleteDtoOut>,
      { status: 404 }
    );
  }

  const ownerCheck = requireOwner(identity, ownerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListDeleteDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListDeleteDtoOut>,
      { status: 403 }
    );
  }

  // Delete shopping list from database
  const { success, errors: deleteErrors } = await deleteShoppingList(
    validation.dtoIn.id
  );

  if (!success) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListDeleteDtoOut,
        uuAppErrorMap: deleteErrors,
      } as UuAppResponse<ShoppingListDeleteDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListDeleteDtoOut = {
    awid: identity.awid,
    id: validation.dtoIn.id,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      ownerCheck.errors,
      deleteErrors
    ),
  } as UuAppResponse<ShoppingListDeleteDtoOut>);
}

