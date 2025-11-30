/**
 * shoppingList/create - Create a new shopping list
 * POST /api/shoppingList/create
 * Authorized: User
 */

import { NextRequest, NextResponse } from "next/server";
import {
  extractUserIdentity,
  requireAuthentication,
} from "@/app/middleware/auth";
import { validateShoppingListCreateDtoIn } from "@/app/validation";
import { ShoppingListCreateDtoOut, UuAppResponse } from "@/app/dto";
import {
  mergeErrorMaps,
  ErrorCode,
  ErrorMessages,
  createErrorMap,
} from "@/app/utils/errors";
import { createShoppingList } from "@/lib/db/shoppingList";

export async function POST(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListCreateDtoOut,
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
  const validation = validateShoppingListCreateDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListCreateDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListCreateDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  const authCheck = requireAuthentication(identity);
  if (!authCheck.isAuthenticated) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListCreateDtoOut,
        uuAppErrorMap: authCheck.errors,
      } as UuAppResponse<ShoppingListCreateDtoOut>,
      { status: 401 }
    );
  }

  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListCreateDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListCreateDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Any authenticated user can create shopping lists

  // Create shopping list in database
  const { shoppingList, errors: dbErrors } = await createShoppingList(
    validation.dtoIn.name,
    identity.uuIdentity
  );

  if (!shoppingList) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListCreateDtoOut,
        uuAppErrorMap: dbErrors,
      } as UuAppResponse<ShoppingListCreateDtoOut>,
      { status: 500 }
    );
  }

  const dtoOut: ShoppingListCreateDtoOut = {
    awid: identity.awid,
    id: shoppingList.id,
    name: shoppingList.name,
    state: shoppingList.archived ? "archived" : "active",
    ownerUuIdentity: shoppingList.ownerId,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, dbErrors),
  } as UuAppResponse<ShoppingListCreateDtoOut>);
}
