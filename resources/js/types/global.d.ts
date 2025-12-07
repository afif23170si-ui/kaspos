/* eslint-disable @typescript-eslint/no-explicit-any */
import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
    const qz: any;
}

