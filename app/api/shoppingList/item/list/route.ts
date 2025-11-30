/**
 * shoppingList/item/list - Get items in a shopping list
 * GET /api/shoppingList/item/list
 * Authorized: Owner, Member
 */

import { NextRequest, NextResponse } from "next/server";
import {
  extractUserIdentity,
  requireOwnerOrMember,
} from "@/app/middleware/auth";
import { validateShoppingListItemListDtoIn } from "@/app/validation";
import {
  ShoppingListItemListDtoOut,
  ItemDtoOut,
  UuAppResponse,
} from "@/app/dto";
import { mergeErrorMaps } from "@/app/utils/errors";
import { getShoppingListOwnerId } from "@/lib/db/shoppingList";
import { getItems } from "@/lib/db/item";
import { getMemberIds } from "@/lib/db/member";

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
  // Get shopping list owner ID from database
  const { ownerId, errors: ownerErrors } = await getShoppingListOwnerId(
    validation.dtoIn.shoppingListId
  );
  if (!ownerId) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemListDtoOut,
        uuAppErrorMap: ownerErrors,
      } as UuAppResponse<ShoppingListItemListDtoOut>,
      { status: 404 }
    );
  }

  // Get member IDs from database
  const { memberIds } = await getMemberIds(validation.dtoIn.shoppingListId);

  const memberCheck = requireOwnerOrMember(identity, ownerId, memberIds);
  if (!memberCheck.isAuthorized) {
    return NextResponse.json(
      {
        dtoOut: {} as ShoppingListItemListDtoOut,
        uuAppErrorMap: memberCheck.errors,
      } as UuAppResponse<ShoppingListItemListDtoOut>,
      { status: 403 }
    );
  }

  // Get items from database
  const { items, errors: itemErrors } = await getItems(
    validation.dtoIn.shoppingListId
  );

  const itemDtos: ItemDtoOut[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    productId: item.productId,
    quantity: item.quantity,
    fit: item.fit,
    completed: item.completed,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  const dtoOut: ShoppingListItemListDtoOut = {
    awid: identity.awid,
    shoppingListId: validation.dtoIn.shoppingListId,
    items: itemDtos,
  };

  return NextResponse.json({
    dtoOut,
    uuAppErrorMap: mergeErrorMaps(
      validation.errors,
      authErrors,
      memberCheck.errors,
      itemErrors
    ),
  } as UuAppResponse<ShoppingListItemListDtoOut>);
}
