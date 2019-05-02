import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Checkbox from '@material-ui/core/Checkbox';
import CloseIcon from '@material-ui/icons/Close';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveIcon from '@material-ui/icons/Remove';
import RearrangingList from './rearranging-list';
import locale from '../../../locale';
import { Sorting } from './fields';

// TODO: refactor this to use proper drag and drop

/**
 * Width below which the field picker will be a full-screen modal.
 */
const FULLSCREEN_WIDTH = 600;

function SlideUp (props) {
    return <Slide direction="up" {...props} />;
}

/**
 * Displays a modal for picking, ordering, and setting sorting for a list of fields.
 */
export default class FieldPicker extends React.PureComponent {
    static propTypes = {
        /** The list of available fields. */
        available: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** The list of sortable fields. */
        sortables: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** The list of fixed fields that won’t be displayed in the options. */
        permanent: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** The list of currently selected fields with their sorting type. */
        selected: PropTypes.arrayOf(PropTypes.object).isRequired,
        /** `selected` change handler. */
        onChange: PropTypes.func.isRequired,
        /** If true, will show the modal. */
        open: PropTypes.bool.isRequired,
        /** Close handler. */
        onClose: PropTypes.func.isRequired,
    };

    state = {
        fullScreen: window.innerWidth <= FULLSCREEN_WIDTH,
    };

    onResize = () => {
        this.setState({ fullScreen: window.innerWidth <= FULLSCREEN_WIDTH });
    };

    componentDidMount () {
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
    }

    render () {
        const fields = [];
        const nodeIndexToSelectedIndex = {};
        const selectedFieldNames = [];

        let i = 0;
        for (const field of this.props.selected) {
            selectedFieldNames.push(field.id);
            const index = i++;

            if (this.props.permanent.includes(field.id)) {
                continue;
            }

            const onCheckboxClick = () => {
                const selected = this.props.selected.slice();
                let index;
                for (let i = 0; i < selected.length; i++) {
                    if (selected[i].id === field.id) {
                        index = i;
                        break;
                    }
                }
                selected.splice(index, 1);
                this.props.onChange(selected);
            };

            const sortingControl = this.props.sortables.includes(field.id)
                ? (
                    <SortingControl
                        value={field.sorting}
                        onChange={sorting => {
                            const selected = this.props.selected.slice();
                            let index;
                            for (let i = 0; i < selected.length; i++) {
                                if (selected[i].id === field.id) {
                                    index = i;
                                    break;
                                }
                            }
                            selected[index].sorting = sorting;
                            this.props.onChange(selected);
                        }} />
                )
                : null;

            nodeIndexToSelectedIndex[fields.length] = index;

            fields.push(
                <div className="field-picker-field selected" key={field.id}>
                    <Checkbox checked={true} onClick={onCheckboxClick} />
                    <label className="field-label" onClick={onCheckboxClick}>
                        {locale.members.fields[field.id]}
                    </label>
                    {sortingControl}
                </div>
            );
        }

        for (const field of this.props.available) {
            if (selectedFieldNames.includes(field)) continue;
            fields.push(
                <div
                    className="field-picker-field" key={field}
                    onClick={() => {
                        const selected = this.props.selected.slice();
                        selected.push({
                            id: field,
                            sorting: Sorting.NONE,
                        });
                        this.props.onChange(selected);
                    }}>
                    <Checkbox checked={false} />
                    <div className="field-label">
                        {locale.members.fields[field]}
                    </div>
                </div>
            );
        }

        return (
            <Dialog
                className="members-field-picker"
                fullScreen={this.state.fullScreen}
                open={this.props.open}
                onClose={this.props.onClose}
                TransitionComponent={this.state.fullScreen ? SlideUp : undefined}>
                {this.state.fullScreen ? (
                    <AppBar position="sticky">
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                onClick={this.props.onClose}
                                className="close-button">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" color="inherit">
                                {locale.members.fieldPicker.title}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                ) : (
                    <DialogTitle>
                        <IconButton
                            color="inherit"
                            onClick={this.props.onClose}
                            className="close-button">
                            <CloseIcon />
                        </IconButton>
                        {locale.members.fieldPicker.title}
                    </DialogTitle>
                )}
                <DialogContent>
                    <RearrangingList
                        // TODO: these
                        onMove={(fromIndex, toIndex) => {
                            const selected = this.props.selected.slice();
                            fromIndex = nodeIndexToSelectedIndex[fromIndex];
                            toIndex = nodeIndexToSelectedIndex[toIndex];
                            const [item] = selected.splice(fromIndex, 1);
                            selected.splice(toIndex, 0, item);
                            this.props.onChange(selected);
                        }}
                        canMove={index => index in nodeIndexToSelectedIndex}
                        isItemDraggable={index => index in nodeIndexToSelectedIndex}>
                        {fields}
                    </RearrangingList>
                </DialogContent>
            </Dialog>
        );
    }
}

/**
 * Lets the user click through sorting types for a field.
 */
export class SortingControl extends React.PureComponent {
    static propTypes = {
        /** The current Sorting. */
        value: PropTypes.number.isRequired,
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
                        ? locale.members.sorting.none
                        : this.props.value === Sorting.ASC
                            ? locale.members.sorting.asc
                            : locale.members.sorting.desc}
                </label>}
                <IconButton className="sorting-icon">
                    {this.props.value === Sorting.NONE
                        ? <RemoveIcon className="none-icon" />
                        : <ArrowUpwardIcon className="arrow-icon" />}
                </IconButton>
            </div>
        );
    }
}
