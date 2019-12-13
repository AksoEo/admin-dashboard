import { h } from 'preact';
import { forwardRef, createContext } from 'preact/compat';

const permsContext = createContext(null);
export default permsContext;

export function connectPerms (view, name = 'perms') {
    return forwardRef((props, ref) => {
        return (
            <permsContext.Consumer>
                {perms => h(view, { ref, ...props, [name]: perms })}
            </permsContext.Consumer>
        );
    });
}
