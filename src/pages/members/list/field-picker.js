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
import DragHandleIcon from '@material-ui/icons/DragHandle';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveIcon from '@material-ui/icons/Remove';
import locale from '../../../locale';
import { Sorting } from './fields';

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
        onClose: PropTypes.func.isRequired
    };

    state = {
        fullScreen: window.innerWidth <= FULLSCREEN_WIDTH
    };

    /**
     * The <ol> list node.
     */
    listNode = null;

    /**
     * List item nodes.
     */
    selectedLiNodes = [];

    onResize = () => {
        this.setState({ fullScreen: window.innerWidth <= FULLSCREEN_WIDTH });
    };

    /** Index of the item that’s currently being dragged. */
    draggingIndex = -1;

    onDragStart (clientY, index) {
        this.draggingIndex = index;
    }
    onDragMove (clientY) {
        const listTop = this.listNode.getBoundingClientRect().top;
        const offsetY = clientY - listTop;

        let newIndex = -1;
        let y = 0;
        for (let i = 0; i < this.props.selected.length; i++) {
            const node = this.selectedLiNodes[i];
            if (!node) continue;
            const nodeHeight = node.offsetHeight;
            if (offsetY >= y && offsetY < y + nodeHeight) {
                newIndex = i;
                break;
            }
            y += nodeHeight;
        }

        if (newIndex === -1 || newIndex === this.draggingIndex) return;

        const selected = this.props.selected.slice();
        const item = selected.splice(this.draggingIndex, 1)[0];
        selected.splice(newIndex, 0, item);
        this.draggingIndex = newIndex;
        this.props.onChange(selected);
    }

    onMouseDragStart = (e, index) => {
        e.preventDefault();
        this.onDragStart(e.clientY, index);
        window.addEventListener('mousemove', this.onMouseDragMove);
        window.addEventListener('mouseup', this.onMouseDragEnd);
    };
    onMouseDragMove = e => this.onDragMove(e.clientY);
    onMouseDragEnd = () => {
        window.removeEventListener('mousemove', this.onMouseDragMove);
        window.removeEventListener('mouseup', this.onMouseDragEnd);
    };
    onTouchDragStart = (e, index) => {
        e.preventDefault();
        this.onDragStart(e.touches[0].clientY, index);
        window.addEventListener('touchmove', this.onTouchDragMove);
        window.addEventListener('touchend', this.onTouchDragEnd);
    };
    onTouchDragMove = e => this.onDragMove(e.touches[0].clientY);
    onTouchDragEnd = () => {
        window.removeEventListener('touchmove', this.onTouchDragMove);
        window.removeEventListener('touchend', this.onTouchDragEnd);
    };

    componentDidMount () {
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResize);
    }

    render () {
        const fields = [];
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

            fields.push(
                <div
                    className="field-picker-field selected"
                    key={field.id}
                    ref={node => this.selectedLiNodes[index] = node}>
                    <Checkbox checked={true} onClick={onCheckboxClick} />
                    <label className="field-label" onClick={onCheckboxClick}>
                        {locale.members.fields[field.id]}
                    </label>
                    {sortingControl}
                    <DragButton
                        onMouseDown={e => this.onMouseDragStart(e, index)}
                        onTouchStart={e => this.onTouchDragStart(e, index)}>
                        <DragHandleIcon />
                    </DragButton>
                </div>
            );
        }

        while (this.selectedLiNodes.length > this.props.selected.length) {
            this.selectedLiNodes.pop();
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
                            sorting: Sorting.NONE
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
                    <RearrangableList innerRef={node => this.listNode = node}>
                        {fields}
                    </RearrangableList>
                </DialogContent>
            </Dialog>
        );
    }
}

/**
 * Renders a list of items with simple FLIP-animation when rearranging.
 */
class RearrangableList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.array.isRequired,
        innerRef: PropTypes.func
    };

    itemRefs = {};
    itemPositions = null;

    componentWillUpdate (nextProps) {
        if (nextProps.children === this.props.children) return;
        this.itemPositions = {};
        for (const key in this.itemRefs) {
            this.itemPositions[key] = this.itemRefs[key].getBoundingClientRect().top;
        }
    }

    componentDidUpdate () {
        if (this.itemPositions) {
            // animate all items to their new position with FLIP

            const prevPositions = this.itemPositions;
            this.itemPositions = null;

            for (const key in prevPositions) {
                const ref = this.itemRefs[key];
                if (!ref) continue;

                const newPosition = ref.getBoundingClientRect().top;
                ref.style.transform = `translateY(${prevPositions[key] - newPosition}px)`;
                ref.classList.remove('animated');
            }

            requestAnimationFrame(() => {
                for (const key in prevPositions) {
                    this.itemRefs[key].classList.add('animated');
                }

                requestAnimationFrame(() => {
                    for (const key in prevPositions) {
                        this.itemRefs[key].style.transform = '';
                    }
                });
            });
        }
    }

    render () {
        const items = [];
        const itemKeys = [];
        for (const child of this.props.children) {
            itemKeys.push(child.key);
            items.push(
                <li
                    className="list-item"
                    ref={node => this.itemRefs[child.key] = node}
                    key={child.key}>
                    {child}
                </li>
            );
        }

        for (const k in Object.keys(this.itemRefs)) {
            if (!itemKeys.includes(k)) delete this.itemRefs[k];
        }

        return (
            <ol className="rearrangable-list" ref={this.props.innerRef}>
                {items}
            </ol>
        );
    }
}

/**
 * Wrapper around IconButton to handle touch events properly.
 */
class DragButton extends React.PureComponent {
    static propTypes = {
        children: PropTypes.any,
        onTouchStart: PropTypes.func.isRequired,
        onMouseDown: PropTypes.func.isRequired
    };

    onTouchStart = () => this.props.onTouchStart;

    componentDidMount () {
        this.node.addEventListener('touchstart', this.onTouchStart, { passive: false });
    }

    componentWillUnmount () {
        this.node.removeEventListener('touchstart', this.onTouchStart);
    }

    render () {
        return (
            <IconButton
                onMouseDown={this.props.onMouseDown}
                buttonRef={node => this.node = node}>
                {this.props.children}
            </IconButton>
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
        hideLabel: PropTypes.bool
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
