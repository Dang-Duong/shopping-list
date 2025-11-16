/**
 * shoppingList/list - Get all shopping lists
 * GET /api/shoppingList/list
 * Authorized: User (owner or member)
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity } from "@/app/middleware/auth";
import { validateShoppingListListDtoIn } from "@/app/validation";
import { ShoppingListListDtoOut, UuAppResponse } from "@/app/dto";
import { mergeErrorMaps } from "@/app/utils/errors";

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

  // Authorization: Any authenticated user can list shopping lists
  // (filtering by ownership/membership would be done in application logic)

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListListDtoOut = {
    awid: identity.awid,
    items: [], // Empty array - application logic not implemented
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors),
  } as UuAppResponse<ShoppingListListDtoOut>);
}
