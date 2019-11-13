import { h } from 'preact';
import { createContext, forwardRef } from 'preact/compat';

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
export const Link = forwardRef((props, ref) => (
    <routerContext.Consumer>
        {context => (
            <a {...props} ref={ref} href={props.target} target={null} onClick={e => {
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                if (props.onClick) if (props.onClick(e) === false) return;
                context.navigate(props.target);
            }}>
                {props.children}
            </a>
        )}
    </routerContext.Consumer>
));
