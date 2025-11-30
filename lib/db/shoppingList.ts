import { ObjectId } from "mongodb";
import { getDb } from "../db";
import { ShoppingList, Item } from "@/app/types";
import { ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { UuAppErrorMap } from "@/app/dto";

const COLLECTION_NAME = "shoppinglists";

function generateId(): string {
  return new ObjectId().toString();
}

function documentToShoppingList(doc: Record<string, unknown>): ShoppingList {
  return {
    _id: doc._id ? String(doc._id) : undefined,
    id: String(doc.id),
    name: String(doc.name),
    ownerId: String(doc.ownerId),
    items: (doc.items as Item[]) || [],
    createdAt: doc.createdAt as Date | undefined,
    updatedAt: doc.updatedAt as Date | undefined,
    archived: Boolean(doc.archived) || false,
  };
}

export async function getShoppingListById(
  id: string
): Promise<{ shoppingList: ShoppingList | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const shoppingList = await collection.findOne({ id });

    if (!shoppingList) {
      return {
        shoppingList: null,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    return {
      shoppingList: documentToShoppingList(shoppingList),
      errors: {},
    };
  } catch {
    return {
      shoppingList: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function getShoppingLists(
  userId: string,
  archived?: boolean
): Promise<{ shoppingLists: ShoppingList[]; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);
    const membersCollection = db.collection("members");

    const memberDocs = await membersCollection.find({ userId }).toArray();
    const memberListIds = memberDocs.map((doc) => doc.shoppingListId);

    const query: Record<string, unknown> = {
      $or: [{ ownerId: userId }, { id: { $in: memberListIds } }],
    };

    if (archived !== undefined) {
      query.archived = archived;
    }

    const docs = await collection.find(query).toArray();
    const shoppingLists = docs.map(documentToShoppingList);

    return {
      shoppingLists,
      errors: {},
    };
  } catch {
    return {
      shoppingLists: [],
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function createShoppingList(
  name: string,
  ownerId: string
): Promise<{ shoppingList: ShoppingList | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const id = generateId();
    const now = new Date();

    const shoppingListDoc = {
      id,
      name,
      ownerId,
      items: [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(shoppingListDoc);

    if (!result.insertedId) {
      return {
        shoppingList: null,
        errors: createErrorMap(
          "database",
          ErrorCode.INVALID_DTO_IN,
          "Failed to create shopping list"
        ),
      };
    }

    return {
      shoppingList: documentToShoppingList(shoppingListDoc),
      errors: {},
    };
  } catch {
    return {
      shoppingList: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function updateShoppingListName(
  id: string,
  name: string
): Promise<{ shoppingList: ShoppingList | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { id },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return {
        shoppingList: null,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    return {
      shoppingList: documentToShoppingList(result),
      errors: {},
    };
  } catch {
    return {
      shoppingList: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function deleteShoppingList(
  id: string
): Promise<{ success: boolean; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);
    const membersCollection = db.collection("members");

    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return {
        success: false,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    await membersCollection.deleteMany({ shoppingListId: id });

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

export async function archiveShoppingList(
  id: string
): Promise<{ shoppingList: ShoppingList | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { id },
      {
        $set: {
          archived: true,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return {
        shoppingList: null,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    return {
      shoppingList: documentToShoppingList(result),
      errors: {},
    };
  } catch {
    return {
      shoppingList: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function getShoppingListOwnerId(
  id: string
): Promise<{ ownerId: string | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const shoppingList = await collection.findOne(
      { id },
      { projection: { ownerId: 1 } }
    );

    if (!shoppingList) {
      return {
        ownerId: null,
        errors: createErrorMap(
          "shoppingList",
          ErrorCode.SHOPPING_LIST_NOT_FOUND,
          ErrorMessages.SHOPPING_LIST_NOT_FOUND
        ),
      };
    }

    return {
      ownerId: shoppingList.ownerId,
      errors: {},
    };
  } catch {
    return {
      ownerId: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}
