import { h } from 'preact';
import { PureComponent, createContext } from 'preact/compat';
import { Button, Spring, globalAnimator } from '@cpsdqs/yamdl';
import ArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowLeftIcon from '@material-ui/icons/ChevronLeft';
import ArrowRightIcon from '@material-ui/icons/ChevronRight';
import { coreContext, connect } from '../core/connection';
import EventProxy from './event-proxy';
import { Link } from '../router';
import { search as locale } from '../locale';
import './overview-list.less';

// TODO: auto-adjust page if empty
// TODO: debounce maybe

/// Renders an overview list over the items given by the specified task.
///
/// # Props
/// - task: task name. Output should adhere to a specific format (see e.g. codeholders/list)
/// - options: task options
/// - parameters: task parameters. should adhere to a specific format (See e.g. codeholders/list)
///     - fields: objects may also have a `fixed` property to indicate fixed fields.
/// - expanded: bool, whether search/filters are expanded
/// - fields: field renderers
/// - onGetItemLink: should return a link to an item’s detail view
/// - onSetOffset: callback for changing the current page
/// - onSetLimit: callback for changing the current items per page
export default class OverviewList extends PureComponent {
    static contextType = coreContext;

    state = {
        /// current error
        error: null,
        /// current result
        result: null,
    };

    /// whether the current data is stale (in relation to the options/parameters)
    #stale = true;

    /// currently loading task
    #currentTask = null;

    /// last time expanded was set to false
    #lastCollapseTime = 0;

    /// last time a page change button was pressed
    #lastPageChangeTime = 0;

    load (id) {
        if (this.#currentTask) this.#currentTask.drop();
        const { task, options, parameters } = this.props;
        const t = this.#currentTask = this.context.createTask(task, options || {}, parameters);
        this.#currentTask.runOnceAndDrop().then(result => {
            if (this.#currentTask !== t) return;
            this.setState({ result, error: null });
        }).catch(error => {
            if (this.#currentTask !== t) return;
            this.setState({ result: null, error });
        });
    }

    /// Might trigger a reload.
    maybeReload () {
        if (this.#stale && !this.props.expanded) {
            this.load();
            this.#stale = false;
        }
    }

    componentDidMount () {
        this.maybeReload();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.options !== this.props.options
            || prevProps.parameters !== this.props.parameters) {
            this.#stale = true;
        }

        if (prevProps.expanded && !this.props.expanded) {
            this.#lastCollapseTime = Date.now();
        }

        this.maybeReload();
    }

    onPrevPageClick = () => {
        const { parameters } = this.props;
        this.props.onSetOffset(
            Math.max(0, Math.floor(parameters.offset / parameters.limit) - 1) * parameters.limit,
        );
        this.#lastPageChangeTime = Date.now();
    };

    onNextPageClick = () => {
        const { parameters } = this.props;
        const { result } = this.state;
        if (!result) return;
        const maxPage = Math.floor(result.total / parameters.limit);
        this.props.onSetOffset(Math.min(
            maxPage,
            Math.floor(parameters.offset / parameters.limit) + 1
        ) * parameters.limit);
        this.#lastPageChangeTime = Date.now();
    };

    render ({ expanded, fields, parameters, onGetItemLink }, { error, result }) {
        let className = 'overview-list';
        if (expanded) className += ' search-expanded';

        let stats, contents, paginationText;
        let prevDisabled = true;
        let nextDisabled = true;
        if (error) {
            // TODO
            contents = 'error';
        } else if (result) {
            const selectedFields = parameters.fields;
            const selectedFieldIds = selectedFields.map(x => x.id);
            const compiledFields = [];
            // first, push fixed fields
            for (const field of selectedFields) if (field.fixed) compiledFields.push(field);
            // then transient fields
            for (const id of result.transientFields) {
                if (!selectedFieldIds.includes(id)) compiledFields.push({ id, transient: true });
            }
            // finally, push user fields
            for (const field of selectedFields) if (!field.fixed) compiledFields.push(field);

            stats = locale.stats(
                result.items.length,
                result.stats.filtered,
                result.total,
                result.stats.time,
            );

            paginationText = locale.paginationItems(
                parameters.offset + 1,
                parameters.offset + parameters.limit,
                result.total,
            );

            prevDisabled = parameters.offset === 0;
            nextDisabled = parameters.offset + parameters.limit > result.total;

            contents = result.items.map((id, i) => <ListItem
                key={id}
                id={id}
                selectedFields={compiledFields}
                fields={fields}
                onGetItemLink={onGetItemLink}
                index={i}
                expanded={expanded}
                lastCollapseTime={this.#lastCollapseTime} />);
        }

        return (
            <div class={className}>
                <header class="list-meta">
                    {stats}
                </header>
                <Button class="compact-page-button prev-page-button" onClick={this.onPrevPageClick} disabled={prevDisabled}>
                    <ArrowUpIcon />
                    <div class="page-button-label">{locale.prevPage}</div>
                </Button>
                <DynamicHeightDiv class="list-contents" lastPageChangeTime={this.#lastPageChangeTime}>
                    {contents}
                </DynamicHeightDiv>
                <Button class="compact-page-button next-page-button" onClick={this.onNextPageClick} disabled={nextDisabled}>
                    <div class="page-button-label">{locale.nextPage}</div>
                    <ArrowDownIcon />
                </Button>
                <div class="compact-pagination">
                    {paginationText}
                </div>
                <div class="regular-pagination">
                    <div />
                    <div class="pagination-buttons">
                        <Button class="page-button" icon onClick={this.onPrevPageClick} disabled={prevDisabled}>
                            <ArrowLeftIcon />
                        </Button>
                        <div class="pagination-text">{paginationText}</div>
                        <Button class="page-button" icon onClick={this.onNextPageClick} disabled={nextDisabled}>
                            <ArrowRightIcon />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

const layoutContext = createContext();

// time interval after changing page during which the results list will not change height
const PAGE_CHANGE_COOLDOWN = 400; // ms

/// Assumes all children will be laid out vertically without overlapping.
class DynamicHeightDiv extends PureComponent {
    #height = new Spring(1, 0.5);
    #node = null;

    updateHeight = () => {
        if (!this.#node) return;
        this.#height.target = [...this.#node.children]
            .map(child => child.offsetHeight)
            .reduce((a, b) => a + b, 0);

        if (this.#height.wantsUpdate()) globalAnimator.register(this);
    };

    #scheduledUpdate;
    scheduleUpdate = () => {
        clearTimeout(this.#scheduledUpdate);
        this.#scheduledUpdate = setTimeout(this.updateHeight, 1);
    };

    update (dt) {
        if (this.props.lastPageChangeTime < Date.now() - PAGE_CHANGE_COOLDOWN) {
            this.#height.update(dt);
        }
        if (!this.#height.wantsUpdate()) globalAnimator.deregister(this);
        this.forceUpdate();
    }

    componentDidMount () {
        globalAnimator.register(this);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.children !== this.props.children) this.updateHeight();
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
        clearTimeout(this.#scheduledUpdate);
    }

    render (props) {
        return (
            <div {...props} ref={node => this.#node = node} style={{ height: this.#height.value }}>
                <EventProxy dom target={window} onresize={this.updateHeight} />
                <layoutContext.Provider value={this.scheduleUpdate}>
                    {props.children}
                </layoutContext.Provider>
            </div>
        );
    }
}

const ListItem = connect(props => (['codeholders/codeholder', {
    id: props.id,
    fields: props.selectedFields,
    noFetch: true,
}]))(data => ({ data }))(class ListItem extends PureComponent {
    #inTime = 0;
    #yOffset = new Spring(1, 0.5);
    #node = null;

    static contextType = layoutContext;

    componentDidMount () {
        if (this.props.lastCollapseTime > Date.now() - 500) this.#inTime = -0.5;

        globalAnimator.register(this);
    }

    getSnapshotBeforeUpdate (prevProps) {
        if (prevProps.index !== this.props.index) {
            return this.#node ? this.#node.getBoundingClientRect() : null;
        }
        return null;
    }

    componentDidUpdate (prevProps, _, oldRect) {
        if (prevProps.index !== this.props.index && this.#node && oldRect) {
            const newRect = this.#node.getBoundingClientRect();
            this.#yOffset.value = oldRect.top - newRect.top;
            globalAnimator.register(this);
        }

        if (prevProps.expanded && !this.props.expanded) {
            this.#inTime = -0.5;
            globalAnimator.register(this);
        }

        if (!prevProps.data && this.props.data) this.context();
    }

    componentWillUnmount () {
        globalAnimator.deregister(this);
    }

    update (dt) {
        this.#inTime += dt;
        this.#yOffset.update(dt);

        if (!this.#yOffset.wantsUpdate() && this.#inTime >= 5) {
            this.#inTime = 5;
            globalAnimator.deregister(this);
        }
        this.forceUpdate();
    }

    render ({
        id,
        selectedFields,
        data,
        fields,
        onGetItemLink,
        index,
    }) {
        if (!data) return null;

        const selectedFieldIds = selectedFields.map(x => x.id);

        const cells = selectedFields.map(({ id }) => {
            let Component;
            if (fields[id]) Component = fields[id].component;
            else Component = () => `unknown field ${id}`;

            return (
                <div key={id} class="list-item-cell">
                    <div class="cell-label">(label {id})</div>
                    <Component value={data[id]} item={data} fields={selectedFieldIds} />
                </div>
            );
        });

        const weightSum = selectedFields.map(x => fields[x.id].weight || 1).reduce((a, b) => a + b);
        const unit = Math.max(10, 100 / weightSum);

        const constOffset = this.#inTime === 5 ? 0 : 15 * Math.exp(-10 * this.#inTime);
        const spreadFactor = this.#inTime === 5 ? 0 : 4 * Math.exp(-10 * this.#inTime);
        const yOffset = this.#yOffset.value;

        const style = {
            gridTemplateColumns: selectedFields
                .map(x => ((fields[x.id].weight || 1) * unit) + '%')
                .join(' '),
            transform: `translateY(${(constOffset + spreadFactor * index) * 10 + yOffset}px)`,
            opacity: Math.max(0, Math.min(1 - spreadFactor * index / 2, 1)),
        };

        const itemLink = onGetItemLink ? onGetItemLink(id) : null;
        const ItemComponent = onGetItemLink ? Link : 'div';

        return (
            <ItemComponent
                target={itemLink}
                class="list-item"
                style={style}
                ref={node => this.#node = node}>
                {cells}
            </ItemComponent>
        );
    }
});
