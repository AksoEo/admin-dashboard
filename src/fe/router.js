import { h } from 'preact';
import { createContext, forwardRef } from 'preact/compat';
import { Button } from '@cpsdqs/yamdl';

/// A React context for in-app navigation.
///
/// - `navigate: (string) => void`: function that may be called to navigate in-app
export const routerContext = createContext({
    navigate: null,
});

/// An in-app link.
///
/// # Props
/// - `target`: the target href
export const Link = forwardRef((props, ref) => (
    <routerContext.Consumer>
        {context => (
            <a {...props} ref={ref} href={props.target} target={null} onClick={e => {
                if (e.ctrlKey || e.shiftKey || e.metaKey) return;
                e.preventDefault();
                if (props.onClick) if (props.onClick(e) === false) return;
                context.navigate(props.target);
            }}>
                {props.children}
            </a>
        )}
    </routerContext.Consumer>
));

/// A button that is also a link.
///
/// # Props
/// - `target`: the target href
/// - ...rest inherited from Button
export const LinkButton = forwardRef((props, ref) => (
    <routerContext.Consumer>
        {context => (
            <Button
                {...props}
                ref={ref}
                href={props.target}
                target={null}
                onClick={e => {
                    if (e.ctrlKey || e.shiftKey || e.metaKey) return;
                    e.preventDefault();
                    if (props.onClick) if (props.onClick(e) === false) return;
                    context.navigate(props.target);
                }}>
                {props.children}
            </Button>
        )}
    </routerContext.Consumer>
));
