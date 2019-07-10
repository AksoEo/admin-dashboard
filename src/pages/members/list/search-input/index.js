import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import NativeSelect from '@material-ui/core/NativeSelect';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import editors from './editors';
import locale from '../../../../locale';
import { Spring, globalAnimator, lerp, clamp } from '../../../../animation';
import { SEARCHABLE_FIELDS, FILTERABLE_FIELDS } from './fields';
import './style';

const JSONEditor = lazy(() => import('./json-editor'));

/** Members’ page search input. */
export default class SearchInput extends React.PureComponent {
    static propTypes = {
        field: PropTypes.string.isRequired,
        query: PropTypes.any.isRequired,
        filters: PropTypes.object.isRequired,
        filtersEnabled: PropTypes.bool.isRequired,
        onQueryChange: PropTypes.func.isRequired,
        onFieldChange: PropTypes.func.isRequired,
        onFiltersEnabledChange: PropTypes.func.isRequired,
        onSetFilterEnabled: PropTypes.func.isRequired,
        onSetFilterValue: PropTypes.func.isRequired,
        submitted: PropTypes.bool.isRequired,
        onUnsubmit: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        useJSON: PropTypes.bool.isRequired,
        jsonFilter: PropTypes.string.isRequired,
        onJSONChange: PropTypes.func.isRequired,
    };

    toggleFiltersEnabled = () => {
        this.props.onFiltersEnabledChange(!this.props.filtersEnabled);
    };

    onContainerClick = e => {
        if (this.props.submitted) {
            e.preventDefault();
            this.props.onUnsubmit();
        }
    }

    render () {
        let className = 'members-search';
        if (this.props.filtersEnabled) className += ' expanded';
        if (this.props.submitted) className += ' submitted';

        let filtersOnly = false;

        const listItems = [];

        listItems.push({
            node: <PrimarySearch
                key="primary"
                value={this.props.query}
                onChange={this.props.onQueryChange}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        this.props.onSubmit();
                    }
                }}
                submitted={this.props.submitted}
                expanded={this.props.filtersEnabled}
                filtersOnly={filtersOnly}
                onSubmit={this.props.onSubmit}
                searchableFields={SEARCHABLE_FIELDS}
                searchField={this.props.field}
                onSearchFieldChange={this.props.onFieldChange} />,
            hidden: false,
        });

        if (this.props.useJSON) {
            listItems.push({
                node: (
                    <Suspense fallback={(
                        <div className="json-editor-loading">
                            {locale.members.search.json.loading}
                        </div>
                    )}>
                        <JSONEditor
                            value={this.props.jsonFilter}
                            onChange={this.props.onJSONChange}
                            submitted={this.props.submitted} />
                    </Suspense>
                ),
            });
        } else {
            filtersOnly = this.props.filtersEnabled && !this.props.query;

            listItems.push({
                node: <button
                    className="filters-button"
                    onClick={this.props.submitted ? undefined : this.toggleFiltersEnabled}>
                    {locale.members.search.filters}
                    {this.props.filtersEnabled
                        ? <ExpandLessIcon className="expand-icon" />
                        : <ExpandMoreIcon className="expand-icon" />}
                </button>,
                hidden: this.props.submitted && !(hasEnabledFilters && this.props.filtersEnabled),
            });

            let hasEnabledFilters = false;
            for (const id in this.props.filters) {
                if (this.props.filters[id].enabled) {
                    hasEnabledFilters = true;
                    break;
                }
            }

            for (const id in this.props.filters) {
                const item = this.props.filters[id];

                listItems.push({
                    node: <Filter
                        key={id}
                        field={id}
                        enabled={item.enabled}
                        submitted={this.props.submitted}
                        value={item.value}
                        onChange={value => this.props.onSetFilterValue(id, value)}
                        onEnabledChange={enabled => this.props.onSetFilterEnabled(id, enabled)} />,
                    hidden: this.props.submitted && !item.enabled || !this.props.filtersEnabled,
                    staticHeight: true,
                });
            }
        }

        return (
            <div className={className} onClick={this.onContainerClick} role="form">
                <PaperList
                    className="search-contents"
                    layout="flat"
                    // keying this node by useJSON is a hacky way of reinstantiating the element
                    // whenever useJSON changes, because PaperList currently doesn’t support
                    // adding or removing children
                    key={this.props.useJSON}>
                    {[
                        {
                            node: (
                                <div className="search-title">
                                    {filtersOnly
                                        ? locale.members.search.titleFilter
                                        : locale.members.search.title}
                                </div>
                            ),
                            hidden: this.props.submitted,
                        },
                        ...listItems,
                    ]}
                </PaperList>
            </div>
        );
    }
}

/** Primary search field. */
class PrimarySearch extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        filtersOnly: PropTypes.bool.isRequired,
        expanded: PropTypes.bool.isRequired,
        submitted: PropTypes.bool.isRequired,
        searchField: PropTypes.string.isRequired,
        searchableFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        onSearchFieldChange: PropTypes.func.isRequired,
    };

    render () {
        const inputProps = { ...this.props };
        for (const key in PrimarySearch.propTypes) delete inputProps[key];

        return (
            <div className="search-primary">
                <NativeSelect
                    className="search-field"
                    value={this.props.searchField}
                    onClick={e => this.props.submitted && e.stopPropagation()}
                    onChange={e => this.props.onSearchFieldChange(e.target.value)}>
                    {this.props.searchableFields.map(field => (
                        <option value={field} key={field}>
                            {locale.members.search.fields[field]}
                        </option>
                    ))}
                </NativeSelect>
                <input
                    autoFocus={true}
                    className="search-input"
                    {...inputProps}
                    onChange={e => this.props.onChange(e.target.value)}
                    onClick={e => this.props.submitted && e.stopPropagation()}
                    placeholder={locale.members.search.fieldPlaceholders[this.props.searchField]} />
                {!this.props.submitted && (
                    <IconButton
                        className="search-submit"
                        color="primary"
                        aria-label={this.props.filtersOnly
                            ? locale.members.search.submitFilter
                            : locale.members.search.submit}
                        onClick={this.props.onSubmit}>
                        <SearchIcon />
                    </IconButton>
                )}
                {this.props.submitted && (
                    // seemingly useless button as a fake target for the container click
                    // event in the search input
                    <IconButton
                        className="search-expand"
                        aria-label={locale.members.search.expand}>
                        <KeyboardArrowDownIcon />
                    </IconButton>
                )}
            </div>
        );
    }
}

/** A single filter. */
class Filter extends React.PureComponent {
    static propTypes = {
        /** The field ID. */
        field: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired,
        value: PropTypes.any.isRequired,
        onChange: PropTypes.func.isRequired,
        onEnabledChange: PropTypes.func.isRequired,
        /** Should be set to true if the form was submitted and the checkboxes should be hidden. */
        submitted: PropTypes.bool.isRequired,
    };

    /**
     * The DOM node.
     * @type {Node|null}
     */
    node = null;

    render () {
        let editor = '?';

        const field = FILTERABLE_FIELDS[this.props.field];
        const userCanToggleEnabled = (field.needsSwitch && !field.invisibleSwitch)
            && !this.props.submitted;

        const fieldHeader = (
            <div className="predicate-field-header">
                {(field.needsSwitch && !field.invisibleSwitch && !this.props.submitted) ? (
                    <Checkbox
                        className="predicate-checkbox"
                        checked={this.props.enabled}
                        disabled={!userCanToggleEnabled}
                        onChange={(e, checked) => this.props.onEnabledChange(checked)} />
                ) : <div className="predicate-checkbox-placeholder" />}
                <div className="predicate-field" onClick={() => {
                    // also toggle enabled state when clicking on the label
                    if (userCanToggleEnabled) {
                        this.props.onEnabledChange(!this.props.enabled);
                    }
                }}>
                    {locale.members.search.fields[this.props.field]}
                </div>
            </div>
        );

        const editorProps = {
            field: field,
            fieldHeader,
            value: this.props.value,
            onChange: value => {
                this.props.onChange(value);
                if (!(field.needsSwitch)) {
                    this.props.onEnabledChange(!field.isNone(value));
                }
            },
            enabled: this.props.enabled,
            onEnabledChange: this.props.onEnabledChange,
            disabled: !!(field.needsSwitch) && !this.props.enabled,
        };

        const Editor = editors[this.props.field];
        if (Editor) {
            editor = <Editor {...editorProps} />;
        } else editor = fieldHeader;

        let className = 'predicate';
        if (!this.props.enabled) className += ' disabled';

        return (
            <div className={className} ref={node => this.node = node} onClick={e => {
                if (this.props.submitted) e.stopPropagation();
            }}>
                {editor}
            </div>
        );
    }
}

const DAMPING = 1;
const RESPONSE = 0.4;

/**
 * Renders a vertical array of animatable material paper.
 */
class PaperList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.object).isRequired,
    };

    /** ResizeObserver that observes all children. */
    resizeObserver = new ResizeObserver(() => this.update(0));

    childNodes = [];
    childStates = [];

    update (deltaTime, setInitialState) {
        // sync childStates count with child count
        while (this.childStates.length < this.props.children.length) {
            const lastState = this.childStates[this.childStates.length - 1];
            const child = this.props.children[this.childStates.length];

            const y = new Spring(DAMPING, RESPONSE);
            y.value = y.target = lastState ? lastState.y.value : 0;
            const height = new Spring(DAMPING, RESPONSE);
            height.value = height.target = 0;
            const hidden = new Spring(DAMPING, RESPONSE);
            hidden.value = hidden.target = child.hidden ? 1 : 0;

            const forceUpdate = () => this.forceUpdate();
            y.on('update', forceUpdate);
            height.on('update', forceUpdate);
            hidden.on('update', forceUpdate);

            this.childStates.push({ y, height, hidden });
        }

        while (this.childStates.length > this.props.children.length) {
            this.childStates.pop();
        }

        let wantsUpdate = false;

        let yAccum = 0;
        let i = 0;
        for (const state of this.childStates) {
            const index = i++;
            const child = this.props.children[index];

            if (!this.childNodes[index]) {
                // FIXME: for some reason update is called even after the component was unmounted
                return;
            }

            state.hidden.target = child.hidden ? 1 : 0;

            const offsetHeight = this.childNodes[index].offsetHeight;

            state.y.target = lerp(yAccum, yAccum - offsetHeight / 2, state.hidden.value);
            state.height.target = offsetHeight;

            if (setInitialState) {
                state.y.value = state.y.target;
                state.height.value = state.height.target;
            }

            yAccum += offsetHeight * (1 - state.hidden.value);

            state.y.update(deltaTime);
            state.height.update(deltaTime);
            state.hidden.update(deltaTime);

            if (!wantsUpdate && (state.y.wantsUpdate() || state.height.wantsUpdate()
                || state.hidden.wantsUpdate())) {
                wantsUpdate = true;
            }
        }

        if (!wantsUpdate) {
            globalAnimator.deregister(this);
        }
    }

    /** Returns the style object for a child at the given index. */
    getChildStyle (index) {
        if (!this.childStates[index]) return;
        const state = this.childStates[index];
        const childHeight = this.childNodes[index].offsetHeight;
        const scaleY = this.props.children[index].staticHeight
            ? 1
            : state.height.value / childHeight;

        return {
            transform: `translateY(${state.y.value}px) scaleY(${scaleY})`,
            zIndex: Math.round(lerp(this.childStates.length - index, -1, state.hidden.value)),
            opacity: clamp(1 - state.hidden.value, 0, 1),
            pointerEvents: state.hidden.value > 0.5 ? 'none' : '',
        };
    }

    componentDidMount () {
        this.update(0, true);
    }

    componentDidUpdate () {
        globalAnimator.register(this);
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    render () {
        const props = { ...this.props };
        delete props.layout;

        const items = [];
        for (let i = 0; i < this.props.children.length; i++) {
            const { node } = this.props.children[i];
            const hidden = this.childStates[i] ? !!this.childStates[i].hidden.target : true;
            const style = this.getChildStyle(i);
            const index = i;
            items.push(
                <div
                    key={i}
                    className="paper-list-item"
                    style={style}
                    aria-hidden={hidden}
                    ref={node => {
                        this.childNodes[index] = node;
                        if (node) {
                            this.resizeObserver.observe(node);
                        }
                    }}>
                    {node}
                </div>
            );
        }

        // GC node refs
        while (this.childNodes.length > this.props.children.length) {
            this.childNodes.pop();
        }

        // find current total height
        const style = {};
        let lastStateIndex = this.childStates.length - 1;
        while (lastStateIndex > 0 && this.props.children[lastStateIndex].hidden) {
            lastStateIndex--;
        }
        const lastState = this.childStates[lastStateIndex];
        if (lastState) {
            style.height = lastState.y.value + lastState.height.value;
        }

        return (
            <div {...props} style={style}>
                {items}
            </div>
        );
    }
}
