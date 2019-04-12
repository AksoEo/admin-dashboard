import { lazy } from 'react';

/** An object containing all pages, for use with React `Suspense`. */
export default {
    members: lazy(() => import('./members')),
};
