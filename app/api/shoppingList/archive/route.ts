/**
 * shoppingList/archive - Archive a shopping list
 * PUT /api/shoppingList/archive
 * Authorized: Owner
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwner } from "@/app/middleware/auth";
import { validateShoppingListArchiveDtoIn } from "@/app/validation";
import { ShoppingListArchiveDtoOut, UuAppResponse } from "@/app/dto";
import {
  mergeErrorMaps,
  ErrorCode,
  ErrorMessages,
  createErrorMap,
} from "@/app/utils/errors";
import { getShoppingListOwnerId, archiveShoppingList } from "@/lib/db/shoppingList";

export async function PUT(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: createErrorMap(
          "dtoIn",
          ErrorCode.INVALID_DTO_IN,
          ErrorMessages.INVALID_DTO_IN
        ),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListArchiveDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListArchiveDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListArchiveDtoOut>,
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
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListArchiveDtoOut>,
      { status: 404 }
    );
  }

  const ownerCheck = requireOwner(identity, ownerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListArchiveDtoOut>,
      { status: 403 }
    );
  }

  // Archive shopping list in database
  const { shoppingList, errors: archiveErrors } = await archiveShoppingList(
    validation.dtoIn.id
  );

  if (!shoppingList) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: archiveErrors,
      } as UuAppResponse<ShoppingListArchiveDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListArchiveDtoOut = {
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
      archiveErrors
    ),
  } as UuAppResponse<ShoppingListArchiveDtoOut>);
}
