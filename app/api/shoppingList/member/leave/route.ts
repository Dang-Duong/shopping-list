/**
 * shoppingList/member/leave - Leave shopping list
 * POST /api/shoppingList/member/leave
 * Authorized: Member
 */

import { NextRequest, NextResponse } from "next/server";
import { extractUserIdentity, requireMember } from "@/app/middleware/auth";
import { validateShoppingListMemberLeaveDtoIn } from "@/app/validation";
import {
  ShoppingListMemberLeaveDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps, ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { isMember } from "@/lib/db/member";
import { removeMember } from "@/lib/db/member";

export async function POST(request: NextRequest) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberLeaveDtoOut,
        uuAppErrorMap: createErrorMap("dtoIn", ErrorCode.INVALID_DTO_IN, ErrorMessages.INVALID_DTO_IN),
      },
      { status: 400 }
    );
  }

  // Validate dtoIn
  const validation = validateShoppingListMemberLeaveDtoIn(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberLeaveDtoOut,
        uuAppErrorMap: validation.errors,
      } as UuAppResponse<ShoppingListMemberLeaveDtoOut>,
      { status: 400 }
    );
  }

  // Extract user identity
  const { identity, errors: authErrors } = extractUserIdentity(request);
  if (!identity) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberLeaveDtoOut,
        uuAppErrorMap: authErrors,
      } as UuAppResponse<ShoppingListMemberLeaveDtoOut>,
      { status: 401 }
    );
  }

  // Authorization: Member only
  // Check if user is a member of the shopping list
  const userIsMember = await isMember(
    validation.dtoIn.shoppingListId,
    identity.uuIdentity
  );

  if (!userIsMember) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberLeaveDtoOut,
        uuAppErrorMap: createErrorMap(
          "member",
          ErrorCode.NOT_MEMBER,
          "User is not a member of this shopping list"
        ),
      } as UuAppResponse<ShoppingListMemberLeaveDtoOut>,
      { status: 403 }
    );
  }

  // Remove member from shopping list in database
  const { success, errors: removeErrors } = await removeMember(
    validation.dtoIn.shoppingListId,
    identity.uuIdentity
  );

  if (!success) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberLeaveDtoOut,
        uuAppErrorMap: removeErrors,
      } as UuAppResponse<ShoppingListMemberLeaveDtoOut>,
      { status: 404 }
    );
  }

  const dtoOut: ShoppingListMemberLeaveDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    userId: identity.uuIdentity,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, removeErrors),
  } as UuAppResponse<ShoppingListMemberLeaveDtoOut>);
}

