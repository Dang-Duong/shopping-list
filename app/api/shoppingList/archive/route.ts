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
  // Mock check - in production would query database for shopping list owner
  const mockOwnerId = "mock-owner-id"; // Would be fetched from database
  const ownerCheck = requireOwner(identity, mockOwnerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListArchiveDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListArchiveDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListArchiveDtoOut = {
    awid: identity.awid,
    id: validation.dtoIn.id,
    name: "...", // Would be fetched from database
    state: "...", // Would be set by application logic
    ownerUuIdentity: identity.uuIdentity,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      ownerCheck.errors
    ),
  } as UuAppResponse<ShoppingListArchiveDtoOut>);
}
