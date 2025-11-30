/**
 * shoppingList/member/add - Add member to shopping list
 * POST /api/shoppingList/member/add
 * Authorized: Owner
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireOwner } from "@/app/middleware/auth";
import { validateShoppingListMemberAddDtoIn } from "@/app/validation";
import {
  ShoppingListMemberAddDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { getShoppingListOwnerId } from "@/lib/db/shoppingList";
import { addMember } from "@/lib/db/member";

export async function POST(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberAddDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListMemberAddDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberAddDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListMemberAddDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberAddDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListMemberAddDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Owner only
  // Get shopping list owner ID from database
  const { ownerId, errors: ownerErrors } = await getShoppingListOwnerId(
    validation.dtoIn.shoppingListId
  );
  if (!ownerId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberAddDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListMemberAddDtoOut>,
      { status: 404 }
    );
  }

  const ownerCheck = requireOwner(identity, ownerId);
  if (!ownerCheck.isOwner) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberAddDtoOut,
        uuAppErrorMap: ownerCheck.errors,
      } as UuAppResponse<ShoppingListMemberAddDtoOut>,
      { status: 403 }
    );
  }

  // Add member to shopping list in database
  const { member, errors: memberErrors } = await addMember(
    validation.dtoIn.shoppingListId,
    validation.dtoIn.userId,
    validation.dtoIn.role || "Member"
  );

  if (!member) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberAddDtoOut,
        uuAppErrorMap: memberErrors,
      } as UuAppResponse<ShoppingListMemberAddDtoOut>,
      { status: 400 }
    );
  }

  const dtoOut: ShoppingListMemberAddDtoOut = {
    awid: identity.awid,
    id: member.id,
    userId: member.userId,
    shoppingListId: member.shoppingListId,
    role: member.role,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      ownerCheck.errors,
      memberErrors
    ),
  } as UuAppResponse<ShoppingListMemberAddDtoOut>);
}

