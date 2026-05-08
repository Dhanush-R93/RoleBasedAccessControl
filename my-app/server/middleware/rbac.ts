
import { Role,AuthUser } from '../types/roles';
import { Context } from 'elysia';
export const checkPermission = (allowedRoles:readonly Role[]) => {
  return ({ user, set }: { user:AuthUser|null; set: Context['set']}) => {
    // 1. Check if user identity exists (from JWT middleware)
    if (!user) {
      set.status = 401;
      return { 
        success: false, 
        message: "Unauthorized: No valid session found" 
      };
    }

    // 2. Check if the user's role is in the allowed list
    if (!allowedRoles.includes(user.role)) {
      set.status = 403;
      return { 
        success: false, 
        message: `Forbidden: Access denied for role ${user.role}` 
      };
    }
    
    // If we reach here, the request proceeds to the main handler
  };
};