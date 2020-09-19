import { h } from 'preact';
import { PureComponent } from 'preact/compat';

/// An AKSO Script expression.
///
/// - value: { t: ?, ... } AKSO Script expression (i.e. the right-hand side of a def)
/// - onChange: value change handler
export default class ScriptExpr extends PureComponent {
    render () {
        // TODO
        return (
            <div class="form-editor-script-expr">
                todo
            </div>
        );
    }
}
