/**
 * shoppingList/list - Get all shopping lists
 * GET /api/shoppingList/list
 * Authorized: User (owner or member)
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity } from "@/app/middleware/auth";
import { validateShoppingListListDtoIn } from "@/app/validation";
import {
  ShoppingListListDtoOut,
  ShoppingListDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps } from "@/app/utils/errors";
import { getShoppingLists } from "@/lib/db/shoppingList";

export async function GET(request: NextRequest) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const archived = searchParams.get("archived") === "true";

  const dtoIn = archived ? { archived: true } : {};

  // Validate dtoIn
  const validation = validateShoppingListListDtoIn(dtoIn);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListListDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListListDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListListDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListListDtoOut>,
      { status: 401 }
    );
  }

  // Get shopping lists from database
  const { shoppingLists, errors: dbErrors } = await getShoppingLists(
    identity.uuIdentity,
    validation.dtoIn.archived
  );

  // Convert to DTO format
  const items: ShoppingListDtoOut[] = shoppingLists.map((list) => ({
    awid: identity.awid,
    id: list.id,
    name: list.name,
    state: list.archived ? "archived" : "active",
    ownerUuIdentity: list.ownerId,
    archived: list.archived,
  }));

  const dtoOut: ShoppingListListDtoOut = {
    awid: identity.awid,
    items,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, dbErrors),
  } as UuAppResponse<ShoppingListListDtoOut>);
}
