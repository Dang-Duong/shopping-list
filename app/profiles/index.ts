/**
 * Application Profiles
 *
 * Profiles define the roles and permissions for users in the system.
 * Based on uuApp Framework patterns.
 */

export enum Profile {
  AUTHORITIES = "Authorities",
  OPERATIVES = "Operatives",
}

export interface UserProfile {
  profile: Profile;
  uuIdentity: string;
}

/**
 * Profile permissions mapping
 */
export const PROFILE_PERMISSIONS: Record<Profile, string[]> = {
  [Profile.AUTHORITIES]: [
    "system.manage",
    "shoppingList.create",
    "shoppingList.read",
    "shoppingList.update",
    "shoppingList.delete",
    "shoppingList.archive",
    "member.manage",
    "item.manage",
  ],
  [Profile.OPERATIVES]: [
    "shoppingList.create",
    "shoppingList.read",
    "shoppingList.update",
    "shoppingList.archive",
    "member.manage",
    "item.manage",
  ],
};

/**
 * Check if a profile has a specific permission
 */
export function hasPermission(profile: Profile, permission: string): boolean {
  return PROFILE_PERMISSIONS[profile]?.includes(permission) ?? false;
}

/**
 * Check if user is in Authorities profile
 */
export function isAuthorities(profile: Profile): boolean {
  return profile === Profile.AUTHORITIES;
}

/**
 * Check if user is in Operatives profile
 */
export function isOperatives(profile: Profile): boolean {
  return profile === Profile.OPERATIVES;
}
