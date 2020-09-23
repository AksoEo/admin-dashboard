import { h } from 'preact';
import { createRef, PureComponent } from 'preact/compat';
import { Window, ExprView, DefsView, RenderViewRoot, model } from '@tejo/akso-script-editor';

/// Mounts an ASCE view root in a react component.
/// - init: () => ViewRoot
/// - deinit: optional (ViewRoot) => void
class MountedViewRoot extends PureComponent {
    mountPoint = createRef(null);

    componentDidMount () {
        this.viewRoot = this.props.init();
        this.mountPoint.current.appendChild(this.viewRoot.node);
    }

    componentWillUnmount () {
        if (this.props.deinit) this.props.deinit(this.viewRoot);
    }

    render ({ init, deinit, ...extra }) {
        void init, deinit;
        return (
            <div
                {...extra}
                class={'form-editor-render-view-root ' + (extra.class || '')}
                ref={this.mountPoint} />
        );
    }
}

/// Shows an expression.
///
/// # Props
/// - expr: expression to show. Should be a raw AKSO Script expression (i.e. not an editor expr)
/// - editorExpr: ctx => expr, editor expression to show (override)
/// - init/deinit: callbacks
export class RawExprView extends PureComponent {
    getEditorExpr () {
        if (this.props.editorExpr) return this.props.editorExpr(this.modelCtx);
        const key = 'key';
        const rawExprRoot = model.fromRawDefs({ [key]: this.props.expr }, this.modelCtx);
        let keyDef;
        for (const def of rawExprRoot.defs) {
            if (def.name === key) {
                keyDef = def;
                break;
            }
        }
        if (!keyDef) return null; // ???
        const expr = keyDef.expr;
        if (!expr) return null;
        model.resolveRefs(rawExprRoot, true);
        return expr;
    }

    init = () => {
        this.root = new RenderViewRoot();
        this.root.setOverflow('visible');
        this.modelCtx = model.createContext();
        this.exprView = new ExprView(this.getEditorExpr());
        this.exprView.needsLayout = true;
        this.root.pushWindow(this.exprView);
        if (this.props.init) this.props.init(this.exprView, this.root);
        return this.root;
    };

    deinit = () => {
        this.root.destroy();
    };

    invalidateEditorExpr () {
        this.exprView.expr = this.getEditorExpr();
        this.exprView.needsLayout = true;
    }

    componentDidUpdate (prevProps) {
        if (prevProps.expr !== this.props.expr) {
            this.exprView.expr = this.getEditorExpr();
            this.exprView.needsLayout = true;
        }
    }

    render ({ init, deinit, expr, ...props }) {
        void init, deinit, expr;
        return (
            <MountedViewRoot
                {...props}
                class={'form-editor-raw-expr-view ' + (props.class || '')}
                init={this.init}
                deinit={this.deinit} />
        );
    }
}

/// Shows the name of a ref.
///
/// - name: string
export class RefNameView extends PureComponent {
    init = (exprView) => {
        this.exprView = exprView;
        exprView.isDef = true;
    };
    rawExprView = createRef();
    componentDidUpdate (prevProps) {
        if (prevProps.name !== this.props.name) {
            this.rawExprView.current.invalidateEditorExpr();
        }
    }
    render ({ name }) {
        // use a fake editor expr
        return (
            <RawExprView
                init={this.init}
                ref={this.rawExprView}
                editorExpr={ctx => ({ type: 'r', name, ctx })} />
        );
    }
}

/// Shows a preview of defs in the given script object.
///
/// # Props
/// - script: raw script object
export class DefsPreview extends PureComponent {
    init = () => {
        this.root = new RenderViewRoot();
        this.modelCtx = model.createContext();
        this.defs = model.fromRawDefs(this.props.script, this.modelCtx);
        model.resolveRefs(this.defs, true);
        this.defsView = new DefsView(this.defs);
        this.window = new Window();
        this.window.size = [300, 100];
        this.window.addSubview(this.defsView);
        this.root.pushWindow(this.window);
        return this.root;
    };

    deinit = () => {
        this.root.destroy();
    };

    componentDidUpdate (prevProps) {
        if (prevProps.script !== this.props.script) {
            this.defs = model.fromRawDefs(this.props.script, this.modelCtx);
            model.resolveRefs(this.defs, true);
            this.defsView.defs = this.defs;
            this.defsView.needsLayout = true;
        }
    }

    render ({ ...props }) {
        return (
            <MountedViewRoot
                {...props}
                class={'form-editor-defs-preview ' + (props.class || '')}
                init={this.init}
                deinit={this.deinit} />
        );
    }
}
