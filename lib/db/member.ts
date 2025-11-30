import { ObjectId } from "mongodb";
import { getDb } from "../db";
import { Member } from "@/app/types";
import { ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { UuAppErrorMap } from "@/app/dto";

const COLLECTION_NAME = "members";

function generateId(): string {
  return new ObjectId().toString();
}

function documentToMember(doc: Record<string, unknown>): Member {
  return {
    _id: doc._id ? String(doc._id) : undefined,
    id: String(doc.id),
    userId: String(doc.userId),
    shoppingListId: String(doc.shoppingListId),
    role: String(doc.role || "Member"),
    joinedAt: doc.joinedAt as Date | undefined,
    createdAt: doc.createdAt as Date | undefined,
    updatedAt: doc.updatedAt as Date | undefined,
  };
}

export async function getMembers(
  shoppingListId: string
): Promise<{ members: Member[]; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const docs = await collection.find({ shoppingListId }).toArray();
    const members = docs.map(documentToMember);

    return {
      members,
      errors: {},
    };
  } catch {
    return {
      members: [],
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function getMemberIds(
  shoppingListId: string
): Promise<{ memberIds: string[]; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const docs = await collection
      .find({ shoppingListId })
      .project({ userId: 1 })
      .toArray();
    const memberIds = docs.map((doc) => doc.userId);

    return {
      memberIds,
      errors: {},
    };
  } catch {
    return {
      memberIds: [],
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function isMember(
  shoppingListId: string,
  userId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const member = await collection.findOne({
      shoppingListId,
      userId,
    });

    return !!member;
  } catch {
    return false;
  }
}

export async function addMember(
  shoppingListId: string,
  userId: string,
  role: string = "Member"
): Promise<{ member: Member | null; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const existing = await collection.findOne({
      shoppingListId,
      userId,
    });

    if (existing) {
      return {
        member: null,
        errors: createErrorMap(
          "member",
          ErrorCode.MEMBER_ALREADY_EXISTS,
          "Member already exists in this shopping list"
        ),
      };
    }

    const id = generateId();
    const now = new Date();

    const memberDoc = {
      id,
      userId,
      shoppingListId,
      role,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(memberDoc);

    if (!result.insertedId) {
      return {
        member: null,
        errors: createErrorMap(
          "database",
          ErrorCode.INVALID_DTO_IN,
          "Failed to add member"
        ),
      };
    }

    return {
      member: documentToMember(memberDoc),
      errors: {},
    };
  } catch {
    return {
      member: null,
      errors: createErrorMap(
        "database",
        ErrorCode.INVALID_DTO_IN,
        "Database error occurred"
      ),
    };
  }
}

export async function removeMember(
  shoppingListId: string,
  userId: string
): Promise<{ success: boolean; errors: UuAppErrorMap }> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      shoppingListId,
      userId,
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        errors: createErrorMap(
          "member",
          ErrorCode.MEMBER_NOT_FOUND,
          ErrorMessages.MEMBER_NOT_FOUND
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
