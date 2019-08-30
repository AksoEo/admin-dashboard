import { h } from 'preact';
import { createContext } from 'preact/compat';
import PropTypes from 'prop-types';

// FIXME: permissions should not be here; just use this for routing
/**
 * A React context for in-app navigation.
 *
 * - `navigate: (string) => void`: function that may be called to navigate in-app
 * - `replace: (string) => void`: function that may be called to replaceState in-app
 * - `permissions: Object`: permissions object, as defined in the AKSO API
 */
export const appContext = createContext({
    navigate: null,
    replace: null,
    permissions: null,
});

/**
 * An in-app link.
 *
 * - `target: string`: required property that contains the `appContext`→`navigate` argument.
 * @type {React.PureComponent}
 */
export const Link = function Link (props) {
    return (
        <appContext.Consumer>
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
        </appContext.Consumer>
    );
};

Link.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.any,
    target: PropTypes.string.isRequired,
};
