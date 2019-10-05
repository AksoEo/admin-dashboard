import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import { Dialog, Checkbox, Button } from 'yamdl';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveIcon from '@material-ui/icons/Remove';
import fuzzaldrin from 'fuzzaldrin';
import RearrangingList from './rearranging-list';
import locale from '../../locale';
import Sorting from './sorting';
import './field-picker.less';

/**
 * Width below which the field picker will be a full-screen modal.
 */
const FULLSCREEN_WIDTH = 600;

/**
 * Displays a modal for picking, ordering, and setting sorting for a list of fields.
 */
export default class FieldPicker extends PureComponent {
    static propTypes = {
        /** The list of available fields. */
        available: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** The list of sortable fields. */
        sortables: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** The list of currently selected fields with their sorting type. */
        selected: PropTypes.arrayOf(PropTypes.object).isRequired,
        onAddField: PropTypes.func.isRequired,
        onRemoveField: PropTypes.func.isRequired,
        onSetFieldSorting: PropTypes.func.isRequired,
        onMoveField: PropTypes.func.isRequired,
        /** If true, will show the modal. */
        open: PropTypes.bool.isRequired,
        /** Close handler. */
        onClose: PropTypes.func.isRequired,
        localizedFields: PropTypes.object.isRequired,
    };

    state = {
        search: '',
    };

    render () {
        const fields = [];
        const selectedFieldNames = [];

        let searchResults = this.props.available.map(field => ({
            id: field,
            name: this.props.localizedFields[field],
        }));
        if (this.state.search) {
            searchResults = fuzzaldrin.filter(searchResults, this.state.search, { key: 'name' });
        }
        searchResults = searchResults.map(x => x.id);

        let i = 0;
        for (const field of this.props.selected) {
            selectedFieldNames.push(field.id);
            const index = i++;

            if (!searchResults.includes(field.id)) continue;

            const onCheckboxClick = () => setImmediate(() => this.props.onRemoveField(index));

            const sortingControl = this.props.sortables.includes(field.id)
                ? (
                    <SortingControl
                        value={field.sorting}
                        onChange={sorting => this.props.onSetFieldSorting(index, sorting)} />
                )
                : null;

            fields.push(
                <div className="field-picker-field selected" key={field.id}>
                    <Checkbox checked={true} onClick={onCheckboxClick} />
                    <label className="field-label" onClick={onCheckboxClick}>
                        {this.props.localizedFields[field.id]}
                    </label>
                    {sortingControl}
                </div>
            );
        }

        for (const field of this.props.available) {
            if (selectedFieldNames.includes(field)) continue;
            if (!searchResults.includes(field)) continue;

            fields.push(
                <div
                    className="field-picker-field" key={field}
                    onClick={() => this.props.onAddField(field)}>
                    <Checkbox checked={false} />
                    <div className="field-label">
                        {this.props.localizedFields[field]}
                    </div>
                </div>
            );
        }

        return (
            <Dialog
                class="members-field-picker"
                backdrop
                fullScreen={width => width <= FULLSCREEN_WIDTH}
                open={this.props.open}
                onClose={this.props.onClose}
                title={locale.listView.fieldPicker.title}>
                <div className="field-search">
                    <input
                        value={this.state.search}
                        onChange={e => this.setState({ search: e.target.value })}
                        placeholder={locale.listView.fieldPicker.searchPlaceholder} />
                </div>
                <RearrangingList
                    onMove={(fromIndex, toIndex) => this.props.onMoveField(fromIndex, toIndex)}
                    canMove={index => index < this.props.selected.length}
                    isItemDraggable={index => index < this.props.selected.length}>
                    {fields}
                </RearrangingList>
            </Dialog>
        );
    }
}

/**
 * Lets the user click through sorting types for a field.
 */
export class SortingControl extends PureComponent {
    static propTypes = {
        /** The current Sorting. */
        value: PropTypes.string.isRequired,
        /** Change handler. */
        onChange: PropTypes.func.isRequired,
        /** If true, will hide the label explaining the current state. */
        hideLabel: PropTypes.bool,
    };

    onClick = () => {
        if (this.props.value === Sorting.NONE) this.props.onChange(Sorting.ASC);
        else if (this.props.value === Sorting.ASC) this.props.onChange(Sorting.DESC);
        else this.props.onChange(Sorting.NONE);
    };

    mayAnimate = false;

    componentWillUpdate (newProps) {
        if (newProps.value !== this.props.value) {
            this.mayAnimate = true;
        }
    }

    componentWillUnmount () {
        this.mayAnimate = false;
    }

    render () {
        let className = 'sorting-control';
        if (this.props.value === Sorting.NONE) className += ' not-sorted';
        if (this.props.value === Sorting.DESC) className += ' desc';
        if (this.mayAnimate) className += ' animated';

        return (
            <div className={className} onClick={this.onClick}>
                {!this.props.hideLabel && <label className="sorting-label">
                    {this.props.value === Sorting.NONE
                        ? locale.listView.sorting.none
                        : this.props.value === Sorting.ASC
                            ? locale.listView.sorting.asc
                            : locale.listView.sorting.desc}
                </label>}
                <Button icon class="sorting-icon">
                    {this.props.value === Sorting.NONE
                        ? <RemoveIcon className="none-icon" />
                        : <ArrowUpwardIcon className="arrow-icon" />}
                </Button>
            </div>
        );
    }
}
