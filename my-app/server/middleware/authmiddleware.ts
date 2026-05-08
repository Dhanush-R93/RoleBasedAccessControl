import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!
    })
  )
  .derive({ as: 'global' }, async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      set.status = 401;
      return { user: null };
    }

    const token = auth.slice(7);
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { user: null };
    }

    // Returns the user identity to all downstream routes
    return {
      user: payload as { id: number; role: 'ADMIN' | 'EDITOR' | 'USER' }
    };
  });