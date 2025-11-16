/**
 * shoppingList/item/list - Get items in a shopping list
 * GET /api/shoppingList/item/list
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwnerOrMember } from "@/app/middleware/auth";
import { validateShoppingListItemListDtoIn } from "@/app/validation";
import {
  ShoppingListItemListDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps } from "@/app/utils/errors";

export async function GET(request: NextRequest) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const shoppingListId = searchParams.get("shoppingListId");
  
  if (!shoppingListId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemListDtoOut,
        uuAppErrorMap: {},
      } as UuAppResponse<ShoppingListItemListDtoOut>,
      { status: 400 }
    );
  }

  const dtoIn = { shoppingListId };

  // Validate dtoIn
  const validation = validateShoppingListItemListDtoIn(dtoIn);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemListDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListItemListDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemListDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListItemListDtoOut>,
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
        dtoOut: {} as ShoppingListItemListDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListItemListDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListItemListDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    items: [], // Would be fetched from database
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, memberCheck.errors),
  } as UuAppResponse<ShoppingListItemListDtoOut>);
}

