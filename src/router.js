import React from 'react';
import PropTypes from 'prop-types';

/** @jsx React.createElement */

/**
 * A React context for in-app navigation.
 *
 * - `navigate: (string) => void`: function that may be called to navigate in-app
 * - `loginStateChanged: () => void`: function that may be called to notify the context creator
 *   that the login state has changed
 */
export const routerContext = React.createContext({
    navigate: null,
    loginStateChanged: null
});

/**
 * An in-app link.
 *
 * - `target: string`: required property that contains the `routerContext`→`navigate` argument.
 * @type {React.PureComponent}
 */
export const Link = React.memo(function Link (props) {
    return (
        <routerContext.Consumer>
            {context => (
                <span {...props} onClick={() => {
                    if (props.onClick) props.onClick();
                    context.navigate(props.target);
                }}>
                    {props.children}
                </span>
            )}
        </routerContext.Consumer>
    );
});

Link.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.any,
    target: PropTypes.string.isRequired
};
