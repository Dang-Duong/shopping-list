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
  // Mock check - in production would query database for shopping list members
  const mockMemberIds = [identity.uuIdentity]; // Would be fetched from database
  const memberCheck = requireMember(identity, mockMemberIds);
  if (!memberCheck.isMember) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListMemberLeaveDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListMemberLeaveDtoOut>,
      { status: 403 }
    );
  }

  // Return dtoOut with input data echoed back
  const dtoOut: ShoppingListMemberLeaveDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    userId: identity.uuIdentity,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(validation.errors, authErrors, memberCheck.errors),
  } as UuAppResponse<ShoppingListMemberLeaveDtoOut>);
}

