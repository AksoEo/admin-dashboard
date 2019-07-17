import React from 'react';
import PropTypes from 'prop-types';

/** A single filter. */
export default class Filter extends React.PureComponent {
    static propTypes = {
        /**
         * The filter spec.
         *
         * # Properties
         * - `id: string`
         * - `needsSwitch: bool?`
         * - `autoSwitch: bool?`
         */
        filter: PropTypes.object.isRequired,
        enabled: PropTypes.bool.isRequired,
        value: PropTypes.any.isRequired,
        onChange: PropTypes.func.isRequired,
        onEnabledChange: PropTypes.func.isRequired,
        /** Should be set to true if the form was submitted and the checkboxes should be hidden. */
        submitted: PropTypes.bool.isRequired,
    };

    render () {
        let editor = '?';

        const filter = this.props.filter;
        const userCanToggleEnabled = (filter.needsSwitch && !filter.autoSwitch)
            && !this.props.submitted;

        const filterHeader = (
            <div className="filter-header">
                {(filter.needsSwitch && !filter.autoSwitch && !this.props.submitted) ? (
                    <Checkbox
                        className="filter-checkbox"
                        checked={this.props.enabled}
                        disabled={!userCanToggleEnabled}
                        onChange={(e, checked) => this.props.onEnabledChange(checked)} />
                ) : <div className="filter-checkbox-placeholder" />}
                <div className="filter-label" onClick={() => {
                    // also toggle enabled state when clicking on the label
                    if (userCanToggleEnabled) {
                        this.props.onEnabledChange(!this.props.enabled);
                    }
                }}>
                    {locale.members.search.fields[filter.id]}
                </div>
            </div>
        );

        const editorProps = {
            filter,
            filterHeader,
            value: this.props.value,
            onChange: value => {
                this.props.onChange(value);
                if (!(field.needsSwitch)) {
                    this.props.onEnabledChange(!filter.isNone(value));
                }
            },
            enabled: this.props.enabled,
            onEnabledChange: this.props.onEnabledChange,
            disabled: !!filter.needsSwitch && !this.props.enabled,
        };

        const Editor = editors[filter.id];
        if (Editor) {
            editor = <Editor {...editorProps} />;
        } else editor = fieldHeader;

        let className = 'search-filter';
        if (!this.props.enabled) className += ' disabled';

        return (
            <div className={className}>
                {editor}
            </div>
        );
    }
}
