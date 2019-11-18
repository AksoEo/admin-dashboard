import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Dialog, Checkbox, Button } from '@cpsdqs/yamdl';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveIcon from '@material-ui/icons/Remove';
import fuzzaldrin from 'fuzzaldrin';
import RearrangingList from './rearranging-list';
import locale from '../locale';
import './field-picker.less';

/// Width below which the field picker will be a full-screen modal.
const FULLSCREEN_WIDTH = 600;

/// Displays a modal for picking, ordering, and setting sorting for a list of fields.
///
/// # Props
/// - available: string[] of available fields
/// - sortables: string[] of sortable fields
/// - selected: { id, sorting }[] of selected fields
/// - onAddField, onRemoveField, onSetFieldSorting, onMoveField OR onChange: callbacks
/// - open/onClose: open state
/// - locale: locale object
export default class FieldPicker extends PureComponent {
    state = {
        search: '',
    };

    onAddField (field) {
        if (this.props.onAddField) this.props.onAddField(field);
        else this.props.onChange(this.props.selected.concat({ id: field, sorting: 'none' }));
    }

    onRemoveField (index) {
        if (this.props.onRemoveField) this.props.onRemoveField(index);
        else {
            const selected = this.props.selected.slice();
            selected.splice(index, 1);
            this.props.onChange(selected);
        }
    }

    onSetFieldSorting (index, sorting) {
        if (this.props.onSetFieldSorting) this.props.onSetFieldSorting(index, sorting);
        else {
            const selected = this.props.selected.slice();
            selected[index] = { ...selected[index], sorting };
            this.props.onChange(selected);
        }
    }

    onMoveField (fromIndex, toIndex) {
        if (this.props.onMoveField) this.props.onMoveField(fromIndex, toIndex);
        else {
            const selected = this.props.selected.slice();
            selected.splice(toIndex, 0, selected.splice(fromIndex, 1)[0]);
            this.props.onChange(selected);
        }
    }

    render () {
        const fields = [];
        const selectedFieldNames = [];

        let searchResults = this.props.available.map(field => ({
            id: field,
            name: this.props.locale[field],
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

            const onCheckboxClick = () => setImmediate(() => this.onRemoveField(index));

            const sortingControl = this.props.sortables.includes(field.id)
                ? (
                    <SortingControl
                        value={field.sorting}
                        onChange={sorting => this.onSetFieldSorting(index, sorting)} />
                )
                : null;

            fields.push(
                <div className="field-picker-field selected" key={field.id}>
                    <Checkbox checked={true} onClick={onCheckboxClick} disabled={field.fixed} />
                    <label className="field-label" onClick={onCheckboxClick}>
                        {this.props.locale[field.id]}
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
                    onClick={() => this.onAddField(field)}>
                    <Checkbox checked={false} />
                    <div className="field-label">
                        {this.props.locale[field]}
                    </div>
                </div>
            );
        }

        return (
            <Dialog
                class="field-picker"
                backdrop
                fullScreen={width => width <= FULLSCREEN_WIDTH}
                open={this.props.open}
                onClose={this.props.onClose}
                title={locale.listView.fieldPicker.title}>
                <div class="field-search">
                    <input
                        value={this.state.search}
                        onChange={e => this.setState({ search: e.target.value })}
                        placeholder={locale.listView.fieldPicker.searchPlaceholder} />
                </div>
                <RearrangingList
                    onMove={(fromIndex, toIndex) => this.onMoveField(fromIndex, toIndex)}
                    canMove={index => index < this.props.selected.length}
                    isItemDraggable={index => index < this.props.selected.length}>
                    {fields}
                </RearrangingList>
            </Dialog>
        );
    }
}

/// Lets the user click through sorting types for a field.
///
/// # Props
/// - value/onChange: Sorting value
/// - hideLabel: if true, will hide the label explaining the current state
export class SortingControl extends PureComponent {
    onClick = () => {
        if (this.props.value === 'none') this.props.onChange('asc');
        else if (this.props.value === 'asc') this.props.onChange('desc');
        else this.props.onChange('none');
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
        if (this.props.value === 'none') className += ' not-sorted';
        if (this.props.value === 'desc') className += ' desc';
        if (this.mayAnimate) className += ' animated';

        return (
            <div class={className} onClick={this.onClick}>
                {!this.props.hideLabel && <label class="sorting-label">
                    {this.props.value === 'none'
                        ? locale.listView.sorting.none
                        : this.props.value === 'asc'
                            ? locale.listView.sorting.asc
                            : locale.listView.sorting.desc}
                </label>}
                <Button icon small class="sorting-icon">
                    {this.props.value === 'none'
                        ? <RemoveIcon className="none-icon" />
                        : <ArrowUpwardIcon className="arrow-icon" />}
                </Button>
            </div>
        );
    }
}
