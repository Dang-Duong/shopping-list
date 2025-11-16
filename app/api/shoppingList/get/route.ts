/**
 * shoppingList/get - Get detail of a shopping list
 * GET /api/shoppingList/get
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwnerOrMember } from "@/app/middleware/auth";
import { validateShoppingListGetDtoIn } from "@/app/validation";
import {
  ShoppingListGetDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps } from "@/app/utils/errors";

export async function GET(request: NextRequest) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: {},
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 400 }
    );
  }

  const dtoIn = { id };

  // Validate dtoIn
  const validation = validateShoppingListGetDtoIn(dtoIn);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Owner or Member
  // Mock check - in production would query database
  const mockOwnerId = "mock-owner-id";
  const mockMemberIds: string[] = [];
  const memberCheck = requireOwnerOrMember(identity, mockOwnerId, mockMemberIds);
  if (!memberCheck.isAuthorized) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListGetDtoOut = {
    awid: identity.awid,
    id: validation.dtoIn.id,
    name: "...", // Would be fetched from database
    state: "...", // Would be set by application logic
    ownerUuIdentity: identity.uuIdentity,
    items: [], // Would be fetched from database
    members: [], // Would be fetched from database
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, memberCheck.errors),
  } as UuAppResponse<ShoppingListGetDtoOut>);
}

