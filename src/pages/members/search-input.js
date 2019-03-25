import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import PredicateEditor, { defaultFields } from './predicate-editor';
import locale from '../../locale';
import { Spring, globalAnimator, lerp } from '../../animation';

/** Members’ page search input. */
export default class SearchInput extends React.PureComponent {
    state = {
        primary: '',
        predicates: defaultFields(),
        expanded: false,
        withResults: false,
        primarySearch: ''
    };

    toggleExpanded = () => {
        this.setState({ expanded: !this.state.expanded });
    };

    render () {
        let className = 'members-search';
        if (this.state.expanded) className += ' expanded';
        if (this.state.withResults) className += ' with-results';

        const listItems = [{
            node: <PrimarySearch
                key="primary"
                disabled={this.state.expanded}
                value={this.state.primary}
                onChange={primary => this.setState({ primary })}
                onKeyDown={e => {
                    // TEMP
                    if (e.key === 'Enter') {
                        this.setState({ withResults: true });
                    }
                }}
                expanded={this.state.expanded}
                toggleExpanded={this.toggleExpanded} />,
            hidden: false
        }];

        for (const item of this.state.predicates) {
            const index = listItems.length - 1;
            listItems.push({
                node: <PredicateEditor
                    key={item.field}
                    field={item.field}
                    enabled={item.enabled}
                    value={item.value}
                    onChange={value => {
                        const predicates = this.state.predicates.slice();
                        predicates[index].value = value;
                        this.setState({ predicates });
                    }}
                    onEnabledChange={enabled => {
                        const predicates = this.state.predicates.slice();
                        predicates[index].enabled = enabled;
                        this.setState({ predicates });
                    }} />,
                hidden: false
            });
        }

        return (
            <div className={className}>
                <div className="search-contents">
                    <div className="search-title">{locale.members.search.title}</div>
                    <PaperList
                        className="search-box"
                        layout={this.state.expanded ? 'flat' : 'collapsed'}>
                        {listItems}
                    </PaperList>
                </div>
            </div>
        );
    }
}

/** Primary search field. */
class PrimarySearch extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        toggleExpanded: PropTypes.func.isRequired,
        expanded: PropTypes.bool.isRequired
    };

    render () {
        const inputProps = { ...this.props };
        for (const key in PrimarySearch.propTypes) delete inputProps[key];

        return (
            <div className="search-primary">
                <div className="search-icon-container">
                    <SearchIcon />
                </div>
                <input
                    className="search-input"
                    {...inputProps}
                    onChange={e => this.props.onChange(e.target.value)}
                    placeholder={locale.members.search.placeholder} />
                <Button className="search-expand" onClick={this.props.toggleExpanded}>
                    {this.props.expanded
                        ? locale.members.search.collapse
                        : locale.members.search.expand}
                </Button>
            </div>
        );
    }
}

const DAMPING = 0.8;
const RESPONSE = 0.3;

/**
 * Renders a vertical array of animatable material paper.
 */
class PaperList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.object).isRequired,
        layout: PropTypes.oneOf(['flat', 'collapsed']).isRequired
    };

    node = null;

    childNodes = [];
    childStates = [];

    update (deltaTime) {
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

            state.hidden.target = child.hidden ? 1 : 0;

            if (this.props.layout === 'collapsed') {
                state.y.target = 0;
                state.height.target = this.childNodes[0].offsetHeight;
            } else if (this.props.layout === 'flat') {
                state.y.target = yAccum;
                state.height.target = this.childNodes[index].offsetHeight;

                yAccum += this.childNodes[index].offsetHeight * (1 - state.hidden.value);
            }

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

    getChildStyle (index) {
        if (!this.childStates[index]) return;
        const state = this.childStates[index];
        const childHeight = this.childNodes[index].offsetHeight;
        const scaleY = state.height.value / childHeight;

        return {
            transform: `translateY(${state.y.value}px) scaleY(${scaleY})`,
            zIndex: Math.round(lerp(this.childStates.length - index, -1, state.hidden.value))
        };
    }

    componentDidMount () {
        this.update(0);
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
            const style = this.getChildStyle(i);
            const index = i;
            items.push(
                <div
                    key={i}
                    className="paper-list-item"
                    style={style}
                    ref={node => this.childNodes[index] = node}>
                    {node}
                </div>
            );
        }

        while (this.childNodes.length > this.props.children.length) {
            this.childNodes.pop();
        }

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
            <div {...props} style={style} ref={node => this.node = node}>
                {items}
            </div>
        );
    }
}
