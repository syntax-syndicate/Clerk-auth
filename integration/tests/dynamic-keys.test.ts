import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('dynamic keys @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/middleware.ts',
        () => `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

        const isProtectedRoute = createRouteMatcher(['/protected']);

        export default clerkMiddleware((auth, request) => {
          if (isProtectedRoute(request)) {
            auth().protect();
          }
        }, {
          secretKey: process.env.CLERK_DYNAMIC_SECRET_KEY,
          signInUrl: '/foobar'
        });

        export const config = {
          matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
        };`,
      )
      .addFile(
        'src/app/protected/page.tsx',
        () => `import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <div>
     <SignedIn>
      Signed in
    </SignedIn>

    <SignedOut>
      Signed out
    </SignedOut>
    </div>
  );
}
      `,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withDynamicKeys);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('redirects to `signInUrl` on `auth.protect`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToStart();

    await u.po.expect.toBeSignedOut();

    await u.page.goToRelative('/protected');

    await u.page.waitForURL(/foobar/);
  });
});