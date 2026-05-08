import { treaty } from '@elysiajs/eden';
import type { App } from './server'; // Import only the TYPE

// Point this to your Next.js URL
export const api = treaty<App>('localhost:3000');