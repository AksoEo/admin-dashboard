// See webpack.config.js
// This file is a proxy for the preact-compat module

import React from 'preact-compat';
import createContext from 'preact-context';

// React pseudo-polyfills
React.createContext = createContext;
React.memo = f => f;
React.createRef = () => {
    const ref = node => {
        ref.current = node;
    };
    ref.current = null;
    return ref;
};
// TEMP until Preact X is released: replace fragments with <g> because
// they’re mainly used in MUI svg icons
React.Fragment = 'g';
export const createFactory = f => function Factory (props) {
    return React.createElement(f, props);
};

export default React;
export * from 'preact-compat';
