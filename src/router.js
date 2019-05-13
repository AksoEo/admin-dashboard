import React from 'react';
import PropTypes from 'prop-types';

/**
 * A React context for in-app navigation.
 *
 * - `navigate: (string) => void`: function that may be called to navigate in-app
 * - `replace: (string) => void`: function that may be called to replaceState in-app
 */
export const routerContext = React.createContext({
    navigate: null,
    replace: null,
});

/**
 * An in-app link.
 *
 * - `target: string`: required property that contains the `routerContext`→`navigate` argument.
 * @type {React.PureComponent}
 */
export const Link = function Link (props) {
    return (
        <routerContext.Consumer>
            {context => (
                <a {...props} href={props.target} target={null} onClick={e => {
                    if (e.ctrlKey || e.metaKey) return;
                    e.preventDefault();
                    if (props.onClick) if (props.onClick(e) === false) return;
                    context.navigate(props.target);
                }}>
                    {props.children}
                </a>
            )}
        </routerContext.Consumer>
    );
};

Link.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.any,
    target: PropTypes.string.isRequired,
};
