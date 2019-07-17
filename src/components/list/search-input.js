import React from 'react';
import PropTypes from 'prop-types';

/** Primary search field. */
export default class SearchInput extends React.PureComponent {
    static propTypes = {
        field: PropTypes.string.isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        onFieldChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        onUnsubmit: PropTypes.func.isRequired,
        submitted: PropTypes.bool.isRequired,
        query: PropTypes.string.isRequired,
        onQueryChange: PropTypes.func.isRequired,
    };

    render () {
        return (
            <div className="search-input">
                <NativeSelect
                    className="search-field"
                    value={this.props.field}
                    onClick={e => this.props.submitted && e.stopPropagation()}
                    onChange={e => this.props.onFieldChange(e.target.value)}>
                    {this.props.fields.map(field => (
                        <option value={field} key={field}>
                            {locale.members.search.fields[field]}
                        </option>
                    ))}
                </NativeSelect>
                <input
                    autoFocus={true}
                    className="search-input"
                    value={this.props.query}
                    onChange={e => this.props.onQUeryChange(e.target.value)}
                    onClick={e => this.props.submitted && e.stopPropagation()}
                    placeholder={locale.members.search.fieldPlaceholders[this.props.field]} />
                {this.props.submitted ? (
                    <IconButton
                        className="search-expand"
                        aria-label={locale.members.search.expand}
                        onClick={this.props.onUnsubmit}>
                        <KeyboardArrowDownIcon />
                    </IconButton>
                ) : (
                    <IconButton
                        className="search-submit"
                        color="primary"
                        aria-label={locale.members.search.submit}
                        onClick={this.props.onSubmit}>
                        <SearchIcon />
                    </IconButton>
                )}
            </div>
        );
    }
}
