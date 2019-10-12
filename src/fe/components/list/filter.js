import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Checkbox } from '@cpsdqs/yamdl';

/// A single filter.
///
/// # Props
/// - id: filter id (stirng)
/// - localizedName: filter name
/// - filter: filter spec object
///    - needsSwitch: bool?
///    - autoSwitch: bool?
///    - isNone: ((any) => bool)? required if !needsSwitch
///    - default: (() => T)?
///    - editor: Component?
/// - enabled/onEnabledChange: bool
/// - value/onChange: filter value
/// - submitted: bool, will hide checkbox
/// - isFirst/isLast: bool
export default class Filter extends PureComponent {
    render () {
        let editor = '?';

        const id = this.props.id;
        const filter = this.props.filter;
        const userCanToggleEnabled = (filter.needsSwitch && !filter.autoSwitch)
            && !this.props.submitted;

        const filterHeader = (
            <div class="filter-header">
                {(filter.needsSwitch && !filter.autoSwitch && !this.props.submitted) ? (
                    <Checkbox
                        class="filter-checkbox"
                        checked={this.props.enabled}
                        disabled={!userCanToggleEnabled}
                        onChange={checked => this.props.onEnabledChange(checked)} />
                ) : <div class="filter-checkbox-placeholder" />}
                <div class="filter-label" onClick={() => {
                    // also toggle enabled state when clicking on the label
                    if (userCanToggleEnabled) {
                        this.props.onEnabledChange(!this.props.enabled);
                    }
                }}>
                    {this.props.localizedName || `(${id})`}
                </div>
            </div>
        );

        const editorProps = {
            filter,
            filterHeader,
            value: this.props.value,
            onChange: value => {
                this.props.onChange(value);
                if (!(filter.needsSwitch)) {
                    this.props.onEnabledChange(!filter.isNone(value));
                }
            },
            enabled: this.props.enabled,
            onEnabledChange: this.props.onEnabledChange,
            disabled: !!filter.needsSwitch && !this.props.enabled,
        };

        const Editor = filter.editor;
        if (Editor) {
            editor = <Editor {...editorProps} />;
        } else editor = filterHeader;

        let className = 'search-filter';
        if (!this.props.enabled) className += ' disabled';
        if (this.props.isFirst) className += ' is-first';
        if (this.props.isLast) className += ' is-last';

        return (
            <div class={className}>
                {editor}
            </div>
        );
    }
}
