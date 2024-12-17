'use client';

import { createTRPCReact } from '@trpc/react-query';
import   AppRouter  from '../../../backend/trpc/appRouter';

export const trpc = createTRPCReact<AppRouter>();