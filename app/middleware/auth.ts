/**
 * Authentication and Authorization Middleware
 *
 * Implements authentication and authorization checks for uuCmd endpoints.
 * Checks profiles (Authorities, Operatives) and role-based access control.
 */

import { NextRequest } from "next/server";
import { Profile } from "@/app/profiles";
import { ErrorCode, ErrorMessages, createErrorMap } from "@/app/utils/errors";
import { UuAppErrorMap } from "@/app/dto";

/**
 * User identity extracted from request
 */
export interface UserIdentity {
  uuIdentity: string;
  profile: Profile;
  awid: string;
}

/**
 * Authorization roles
 */
export enum Role {
  OWNER = "Owner",
  MEMBER = "Member",
  USER = "User",
}

/**
 * Extract user identity from request headers
 * In a real implementation, this would validate JWT tokens or session
 */
export function extractUserIdentity(request: NextRequest): {
  identity: UserIdentity | null;
  errors: UuAppErrorMap;
} {
  const errors: UuAppErrorMap = {};

  // Extract from headers (mock implementation)
  // In production, this would validate JWT tokens, sessions, etc.
  const uuIdentity = request.headers.get("x-uu-identity");
  const profileHeader = request.headers.get("x-uu-profile");
  const awid = request.headers.get("x-awid") || "default-awid";

  if (!uuIdentity) {
    return {
      identity: null,
      errors: createErrorMap(
        "authentication",
        ErrorCode.UNAUTHORIZED,
        ErrorMessages.UNAUTHORIZED
      ),
    };
  }

  // Map profile header to Profile enum
  let profile: Profile;
  if (profileHeader === "Authorities") {
    profile = Profile.AUTHORITIES;
  } else if (profileHeader === "Operatives") {
    profile = Profile.OPERATIVES;
  } else {
    // Default to Operatives if not specified
    profile = Profile.OPERATIVES;
  }

  return {
    identity: {
      uuIdentity,
      profile,
      awid,
    },
    errors,
  };
}

/**
 * Check if user is authenticated
 */
export function requireAuthentication(identity: UserIdentity | null): {
  isAuthenticated: boolean;
  errors: UuAppErrorMap;
} {
  if (!identity) {
    return {
      isAuthenticated: false,
      errors: createErrorMap(
        "authentication",
        ErrorCode.UNAUTHORIZED,
        ErrorMessages.UNAUTHORIZED
      ),
    };
  }

  return {
    isAuthenticated: true,
    errors: {},
  };
}

/**
 * Check if user has required profile
 */
export function requireProfile(
  identity: UserIdentity | null,
  requiredProfiles: Profile[]
): { hasProfile: boolean; errors: UuAppErrorMap } {
  const authCheck = requireAuthentication(identity);
  if (!authCheck.isAuthenticated) {
    return {
      hasProfile: false,
      errors: authCheck.errors,
    };
  }

  if (!identity) {
    return {
      hasProfile: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.FORBIDDEN,
        ErrorMessages.FORBIDDEN
      ),
    };
  }

  if (!requiredProfiles.includes(identity.profile)) {
    return {
      hasProfile: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        `User profile ${
          identity.profile
        } does not have required permissions. Required: ${requiredProfiles.join(
          ", "
        )}`
      ),
    };
  }

  return {
    hasProfile: true,
    errors: {},
  };
}

/**
 * Check if user is owner of a shopping list
 * This is a mock implementation - in production, would query database
 */
export function isOwner(
  identity: UserIdentity | null,
  shoppingListOwnerId: string
): boolean {
  if (!identity) {
    return false;
  }
  return identity.uuIdentity === shoppingListOwnerId;
}

/**
 * Check if user is member of a shopping list
 * This is a mock implementation - in production, would query database
 */
export function isMember(
  identity: UserIdentity | null,
  shoppingListMemberIds: string[]
): boolean {
  if (!identity) {
    return false;
  }
  return shoppingListMemberIds.includes(identity.uuIdentity);
}

/**
 * Require user to be owner of shopping list
 */
export function requireOwner(
  identity: UserIdentity | null,
  shoppingListOwnerId: string
): { isOwner: boolean; errors: UuAppErrorMap } {
  const authCheck = requireAuthentication(identity);
  if (!authCheck.isAuthenticated) {
    return {
      isOwner: false,
      errors: authCheck.errors,
    };
  }

  if (!isOwner(identity, shoppingListOwnerId)) {
    return {
      isOwner: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.NOT_OWNER,
        ErrorMessages.NOT_OWNER
      ),
    };
  }

  return {
    isOwner: true,
    errors: {},
  };
}

/**
 * Require user to be owner or member of shopping list
 */
export function requireOwnerOrMember(
  identity: UserIdentity | null,
  shoppingListOwnerId: string,
  shoppingListMemberIds: string[] = []
): { isAuthorized: boolean; errors: UuAppErrorMap } {
  const authCheck = requireAuthentication(identity);
  if (!authCheck.isAuthenticated) {
    return {
      isAuthorized: false,
      errors: authCheck.errors,
    };
  }

  if (!identity) {
    return {
      isAuthorized: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.FORBIDDEN,
        ErrorMessages.FORBIDDEN
      ),
    };
  }

  const userIsOwner = isOwner(identity, shoppingListOwnerId);
  const userIsMember = isMember(identity, shoppingListMemberIds);

  if (!userIsOwner && !userIsMember) {
    return {
      isAuthorized: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.NOT_MEMBER,
        ErrorMessages.NOT_MEMBER
      ),
    };
  }

  return {
    isAuthorized: true,
    errors: {},
  };
}

/**
 * Require user to be member (but not necessarily owner)
 */
export function requireMember(
  identity: UserIdentity | null,
  shoppingListMemberIds: string[] = []
): { isMember: boolean; errors: UuAppErrorMap } {
  const authCheck = requireAuthentication(identity);
  if (!authCheck.isAuthenticated) {
    return {
      isMember: false,
      errors: authCheck.errors,
    };
  }

  if (!identity) {
    return {
      isMember: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.FORBIDDEN,
        ErrorMessages.FORBIDDEN
      ),
    };
  }

  if (!isMember(identity, shoppingListMemberIds)) {
    return {
      isMember: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.NOT_MEMBER,
        ErrorMessages.NOT_MEMBER
      ),
    };
  }

  return {
    isMember: true,
    errors: {},
  };
}

/**
 * Authorization configuration for endpoints
 */
export interface EndpointAuthConfig {
  requiredProfiles?: Profile[];
  requiredRole?: Role;
}

/**
 * Check authorization based on endpoint configuration
 */
export function checkAuthorization(
  identity: UserIdentity | null,
  config: EndpointAuthConfig,
  shoppingListOwnerId?: string,
  shoppingListMemberIds?: string[]
): { isAuthorized: boolean; errors: UuAppErrorMap } {
  // Check authentication first
  const authCheck = requireAuthentication(identity);
  if (!authCheck.isAuthenticated) {
    return {
      isAuthorized: false,
      errors: authCheck.errors,
    };
  }

  if (!identity) {
    return {
      isAuthorized: false,
      errors: createErrorMap(
        "authorization",
        ErrorCode.FORBIDDEN,
        ErrorMessages.FORBIDDEN
      ),
    };
  }

  // Check profile requirements
  if (config.requiredProfiles && config.requiredProfiles.length > 0) {
    const profileCheck = requireProfile(identity, config.requiredProfiles);
    if (!profileCheck.hasProfile) {
      return {
        isAuthorized: false,
        errors: profileCheck.errors,
      };
    }
  }

  // Check role requirements
  if (config.requiredRole) {
    switch (config.requiredRole) {
      case Role.OWNER:
        if (shoppingListOwnerId) {
          const ownerCheck = requireOwner(identity, shoppingListOwnerId);
          if (!ownerCheck.isOwner) {
            return {
              isAuthorized: false,
              errors: ownerCheck.errors,
            };
          }
        }
        break;
      case Role.MEMBER:
        if (shoppingListOwnerId && shoppingListMemberIds) {
          const memberCheck = requireOwnerOrMember(
            identity,
            shoppingListOwnerId,
            shoppingListMemberIds
          );
          if (!memberCheck.isAuthorized) {
            return memberCheck;
          }
        }
        break;
      case Role.USER:
        // Any authenticated user
        break;
    }
  }

  return {
    isAuthorized: true,
    errors: {},
  };
}
