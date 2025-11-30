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
  ItemDtoOut,
  MemberDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps } from "@/app/utils/errors";
import { getShoppingListById, getShoppingListOwnerId } from "@/lib/db/shoppingList";
import { getItems } from "@/lib/db/item";
import { getMembers, getMemberIds } from "@/lib/db/member";

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

  // Get shopping list owner ID for authorization
  const { ownerId, errors: ownerErrors } = await getShoppingListOwnerId(id);
  if (!ownerId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 404 }
    );
  }

  // Get member IDs for authorization
  const { memberIds } = await getMemberIds(id);

  // Authorization: Owner or Member
  const memberCheck = requireOwnerOrMember(identity, ownerId, memberIds);
  if (!memberCheck.isAuthorized) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 403 }
    );
  }

  // Get shopping list details
  const { shoppingList, errors: listErrors } = await getShoppingListById(id);
  if (!shoppingList) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListGetDtoOut,
        uuAppErrorMap: listErrors,
      } as UuAppResponse<ShoppingListGetDtoOut>,
      { status: 404 }
    );
  }

  // Get items
  const { items: itemList, errors: itemErrors } = await getItems(id);
  const items: ItemDtoOut[] = itemList.map((item) => ({
    id: item.id,
    name: item.name,
    productId: item.productId,
    quantity: item.quantity,
    fit: item.fit,
    completed: item.completed,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  // Get members
  const { members, errors: memberErrors } = await getMembers(id);
  const memberDtos: MemberDtoOut[] = members.map((member) => ({
    id: member.id,
    userId: member.userId,
    shoppingListId: member.shoppingListId,
    role: member.role,
    joinedAt: member.joinedAt?.toISOString(),
  }));

  const dtoOut: ShoppingListGetDtoOut = {
    awid: identity.awid,
    id: shoppingList.id,
    name: shoppingList.name,
    state: shoppingList.archived ? "archived" : "active",
    ownerUuIdentity: shoppingList.ownerId,
    items,
    members: memberDtos,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      memberCheck.errors,
      listErrors,
      itemErrors,
      memberErrors
    ),
  } as UuAppResponse<ShoppingListGetDtoOut>);
}

