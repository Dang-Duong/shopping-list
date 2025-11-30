import { ObjectId } from "mongodb";
import { getDb } from "../db";
import { Item } from "@/app/types";
import { ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { UuAppErrorMap } from "@/app/dto";

const COLLECTION_NAME = "shoppinglists";

function generateItemId(): string {
  return new ObjectId().toString();
}

function documentToItem(doc: Record<string, unknown>): Item {
  return {
    id: String(doc.id),
    name: String(doc.name),
    productId: doc.productId ? String(doc.productId) : undefined,
    quantity: doc.quantity ? Number(doc.quantity) : undefined,
    fit: doc.fit ? String(doc.fit) : undefined,
    completed: Boolean(doc.completed) || false,
    createdAt: doc.createdAt as Date | undefined,
    updatedAt: doc.updatedAt as Date | undefined,
  };
}

export async function getItems(
  shoppingListId: string
): Promise<{ items: Item[]; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const shoppingList = await collection.findOne(
      { id: shoppingListId },
      { projection: { items: 1 } }
    );

    if (!shoppingList) {
      return {
        items: [],
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    const items = (shoppingList.items || []).map(documentToItem);

    return {
      items,
      errors: {},
    };
  } catch {
    return {
      items: [],
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function getItemById(
  shoppingListId: string,
  itemId: string
): Promise<{ item: Item | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const shoppingList = await collection.findOne(
      { id: shoppingListId },
      { projection: { items: 1 } }
    );

    if (!shoppingList) {
      return {
        item: null,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    const items = (shoppingList.items || []) as Array<Record<string, unknown>>;
    const itemDoc = items.find((item) => item.id === itemId);

    if (!itemDoc) {
      return {
        item: null,
        errors: createErrorMap(
          "item",
          ErrorCode.ITEM_NOT_FOUND,
          ErrorMessages.ITEM_NOT_FOUND
        ),
      };
    }

    return {
      item: documentToItem(itemDoc),
      errors: {},
    };
  } catch {
    return {
      item: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function addItem(
  shoppingListId: string,
  itemData: {
    name: string;
    productId?: string;
    quantity?: number;
    fit?: string;
  }
): Promise<{ item: Item | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const itemId = generateItemId();
    const now = new Date();

    const newItem = {
      id: itemId,
      name: itemData.name,
      completed: false,
      createdAt: now,
      updatedAt: now,
      ...(itemData.productId && { productId: itemData.productId }),
      ...(itemData.quantity !== undefined && { quantity: itemData.quantity }),
      ...(itemData.fit && { fit: itemData.fit }),
    };

    const result = await collection.findOneAndUpdate(
      { id: shoppingListId },
      {
        $push: { items: newItem },
        $set: { updatedAt: now },
      } as Record<string, unknown>,
      { returnDocument: "after" }
    );

    if (!result) {
      return {
        item: null,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    return {
      item: documentToItem(newItem),
      errors: {},
    };
  } catch {
    return {
      item: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function removeItem(
  shoppingListId: string,
  itemId: string
): Promise<{ success: boolean; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { id: shoppingListId },
      {
        $pull: { items: { id: itemId } },
        $set: { updatedAt: new Date() },
      } as Record<string, unknown>,
      { returnDocument: "after" }
    );

    if (!result) {
      return {
        success: false,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    const itemExists = (
      result.items as Array<Record<string, unknown>> | undefined
    )?.some((item) => item.id === itemId);
    if (itemExists) {
      return {
        success: false,
        errors: createErrorMap(
          "item",
          ErrorCode.ITEM_NOT_FOUND,
          ErrorMessages.ITEM_NOT_FOUND
        ),
      };
    }

    return {
      success: true,
      errors: {},
    };
  } catch {
    return {
      success: false,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function updateItemCompletion(
  shoppingListId: string,
  itemId: string,
  completed: boolean
): Promise<{ item: Item | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { id: shoppingListId, "items.id": itemId },
      {
        $set: {
          "items.$.completed": completed,
          "items.$.updatedAt": new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return {
        item: null,
        errors: createErrorMap(
          "item",
          ErrorCode.ITEM_NOT_FOUND,
          ErrorMessages.ITEM_NOT_FOUND
        ),
      };
    }

    const items = (result.items || []) as Array<Record<string, unknown>>;
    const itemDoc = items.find((item) => item.id === itemId);

    if (!itemDoc) {
      return {
        item: null,
        errors: createErrorMap(
          "item",
          ErrorCode.ITEM_NOT_FOUND,
          ErrorMessages.ITEM_NOT_FOUND
        ),
      };
    }

    return {
      item: documentToItem(itemDoc),
      errors: {},
    };
  } catch {
    return {
      item: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}
