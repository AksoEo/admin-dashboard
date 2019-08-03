import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import NativeSelect from '@material-ui/core/NativeSelect';
import { Button } from 'yamdl';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import locale from '../../locale';

/** Primary search field. */
export default class SearchInput extends PureComponent {
    static propTypes = {
        field: PropTypes.string,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        onFieldChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        onUnsubmit: PropTypes.func.isRequired,
        submitted: PropTypes.bool.isRequired,
        query: PropTypes.string.isRequired,
        onQueryChange: PropTypes.func.isRequired,
        localizedFields: PropTypes.object.isRequired,
        localizedPlaceholders: PropTypes.object.isRequired,
    };

    render () {
        return (
            <div className="search-input">
                <NativeSelect
                    className="search-field"
                    value={this.props.field || ''}
                    onClick={e => this.props.submitted && e.stopPropagation()}
                    onChange={e => this.props.onFieldChange(e.target.value)}>
                    {this.props.fields.map(field => (
                        <option value={field} key={field}>
                            {this.props.localizedFields[field]}
                        </option>
                    ))}
                </NativeSelect>
                <input
                    autoFocus={true}
                    className="search-query"
                    value={this.props.query}
                    onChange={e => this.props.onQueryChange(e.target.value)}
                    onClick={e => this.props.submitted && e.stopPropagation()}
                    placeholder={this.props.localizedPlaceholders[this.props.field]}
                    onKeyDown={e => {
                        if (e.key === 'Enter') this.props.onSubmit();
                    }} />
                {this.props.submitted ? (
                    <Button
                        icon
                        class="search-action search-expand"
                        aria-label={locale.listView.unsubmit}
                        onClick={this.props.onUnsubmit}>
                        <KeyboardArrowDownIcon />
                    </Button>
                ) : (
                    <Button
                        icon
                        class="search-action search-submit"
                        aria-label={locale.listView.submit}
                        onClick={this.props.onSubmit}>
                        <SearchIcon />
                    </Button>
                )}
            </div>
        );
    }
}
