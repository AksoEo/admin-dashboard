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
import locale from '../../../locale';

export const Sorting = {
    NONE: 0,
    DESC: 1,
    ASC: 2
};

const FULLSCREEN_WIDTH = 600;

function SlideUp (props) {
    return <Slide direction="up" {...props} />;
}

export default class FieldPicker extends React.PureComponent {
    static propTypes = {
        available: PropTypes.arrayOf(PropTypes.string).isRequired,
        selected: PropTypes.arrayOf(PropTypes.object).isRequired,
        onChange: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired
    };

    state = {
        fullScreen: window.innerWidth <= FULLSCREEN_WIDTH
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
        const selectedFieldNames = [];

        for (const field of this.props.selected) {
            selectedFieldNames.push(field.id);
            // TODO: sorting controls
            fields.push(
                <div className="field-picker-field selected" key={field.id}>
                    <Checkbox checked={true} onClick={() => {
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
                    }} />
                    <div className="field-label">
                        {locale.members.fields[field.id]}
                    </div>
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
                            <IconButton color="inherit" onClick={this.props.onClose}>
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" color="inherit">
                                {locale.members.fieldPicker.title}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                ) : (
                    <DialogTitle>
                        {locale.members.fieldPicker.title}
                    </DialogTitle>
                )}
                <DialogContent>
                    <RearrangableList>
                        {fields}
                    </RearrangableList>
                </DialogContent>
            </Dialog>
        );
    }
}

class RearrangableList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.array.isRequired
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
            <ol className="rearrangable-list">
                {items}
            </ol>
        );
    }
}
