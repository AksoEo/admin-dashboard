import { h } from 'preact';
import { createContext } from 'preact/compat';

/// A React context for in-app navigation.
///
/// - `navigate: (string) => void`: function that may be called to navigate in-app
/// - `replace: (string) => void`: function that may be called to replaceState in-app
export const routerContext = createContext({
    navigate: null,
    replace: null,
});

/// An in-app link.
///
/// # Props
/// - `target`: the target href
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
