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
  // Mock check - in production would query database for shopping list owner
  const mockOwnerId = "mock-owner-id"; // Would be fetched from database
  const ownerCheck = requireOwner(identity, mockOwnerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListRenameDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListRenameDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListRenameDtoOut = {
    awid: identity.awid,
    id: validation.dtoIn.id,
    name: validation.dtoIn.name,
    state: "...", // Would be set by application logic
    ownerUuIdentity: identity.uuIdentity,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, ownerCheck.errors),
  } as UuAppResponse<ShoppingListRenameDtoOut>);
}

