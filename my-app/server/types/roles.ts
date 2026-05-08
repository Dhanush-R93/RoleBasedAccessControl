export interface AuthUser {
  id: number;
  role: Role;
  name?: string;
  email?: string;
}
export const ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  USER: 'USER',
} as const;

export type Role = keyof typeof ROLES;

export const Permissions = {
  CREATE_POST: [ROLES.ADMIN],
  DELETE_POST: [ROLES.ADMIN], 
  UPDATE_POST: [ROLES.ADMIN,ROLES.EDITOR],
  READ_POST: [ROLES.ADMIN,ROLES.EDITOR,ROLES.USER]
} as const;