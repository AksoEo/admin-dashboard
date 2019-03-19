import { lazy } from 'react';

/// An object with all pages. Asynchronous.
export default {
    members: lazy(() => import('./members'))
};
