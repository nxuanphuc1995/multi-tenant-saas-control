export enum Role {
  PracticeAdmin = 'PracticeAdmin',
  Staff = 'Staff',
  Integration = 'Integration',
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.PracticeAdmin]: ['read:clients', 'create:clients', 'delete:clients', 'action:email.send', 'read:audit'],
  [Role.Staff]: ['read:clients', 'create:clients'],
  [Role.Integration]: ['read:clients', 'action:email.send'],
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
