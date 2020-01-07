import { h } from 'preact';
import { PureComponent, createContext } from 'preact/compat';
import { Button, CircularProgress, Spring, globalAnimator } from '@cpsdqs/yamdl';
import NativeSelect from '@material-ui/core/NativeSelect';
import ArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowLeftIcon from '@material-ui/icons/ChevronLeft';
import ArrowRightIcon from '@material-ui/icons/ChevronRight';
import { coreContext, connect } from '../core/connection';
import EventProxy from './event-proxy';
import { LinkButton } from '../router';
import { search as locale } from '../locale';
import { deepEq } from '../../util';
import './overview-list.less';

const DEBOUNCE_TIME = 400; // ms

/// Renders an overview list over the items given by the specified task.
///
/// # Props
/// - task: task name. Output should adhere to a specific format (see e.g. codeholders/list)
/// - view: view name for detail views.
/// - options: task options
/// - parameters: task parameters. should adhere to a specific format (See e.g. codeholders/list)
///     - fields: objects may also have a `fixed` property to indicate fixed fields.
/// - expanded: bool, whether search/filters are expanded
/// - fields: field renderers
/// - onGetItemLink: should return a link to an item’s detail view
/// - onSetOffset: callback for changing the current page
/// - onSetLimit: callback for changing the current items per page
/// - onResult: result callback
/// - locale: localized field names
/// - notice: optional string to show below stats
export default class OverviewList extends PureComponent {
    static contextType = coreContext;

    state = {
        /// same as #stale; why is this not one variable? because setState is asynchronous
        stale: true,
        /// true if a task is being run
        loading: false,
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

    load () {
        if (this.#currentTask) this.#currentTask.drop();
        const { task, options, parameters } = this.props;
        this.setState({ loading: true });
        const t = this.#currentTask = this.context.createTask(task, options || {}, parameters);
        this.#currentTask.runOnceAndDrop().then(result => {
            if (this.#currentTask !== t) return;
            this.setState({ result, error: null, stale: false, loading: false });
            if (this.props.onResult) this.props.onResult(result);

            if (this.props.parameters.offset >= result.total && result.total !== 0) {
                // we’re out of bounds; adjust
                const limit = this.props.parameters.limit;
                this.props.onSetOffset(Math.floor(result.total / limit) * limit);
            }
        }).catch(error => {
            if (this.#currentTask !== t) return;
            console.error(error); // eslint-disable-line no-console
            this.setState({ result: null, error, stale: false, loading: false });
        });
    }

    #reloadTimeout;
    #skipNextDebounce;

    /// Might trigger a reload.
    maybeReload () {
        if (this.#stale && !this.props.expanded) {
            if (this.#skipNextDebounce) {
                this.#skipNextDebounce = false;
                clearTimeout(this.#reloadTimeout);
                this.load();
            } else if (!this.#reloadTimeout) {
                this.#reloadTimeout = setTimeout(() => {
                    this.#reloadTimeout = null;
                    this.load();
                }, DEBOUNCE_TIME);
            }
            this.#stale = false;
        }
    }

    componentDidMount () {
        this.maybeReload();
    }

    componentDidUpdate (prevProps) {
        const paramsDidChange = this.props.useDeepCmp
            ? !deepEq(prevProps.options, this.props.options) || !deepEq(prevProps.parameters, this.props.parameters)
            : prevProps.options !== this.props.options || prevProps.parameters !== this.props.parameters;

        if (paramsDidChange) {
            this.#stale = true;
            this.setState({ stale: true });
        }

        if (prevProps.expanded && !this.props.expanded) {
            this.#lastCollapseTime = Date.now();
        }

        this.maybeReload();
    }

    componentWillUnmount () {
        clearTimeout(this.#reloadTimeout);
    }

    onPrevPageClick = () => {
        const { parameters } = this.props;
        this.#skipNextDebounce = true;
        this.props.onSetOffset(
            Math.max(0, Math.floor(parameters.offset / parameters.limit) - 1) * parameters.limit,
        );
        this.#lastPageChangeTime = Date.now();
    };

    onNextPageClick = () => {
        const { parameters } = this.props;
        const { result } = this.state;
        if (!result) return;
        const maxPage = Math.floor((result.total - 1) / parameters.limit);
        this.#skipNextDebounce = true;
        this.props.onSetOffset(Math.min(
            maxPage,
            Math.floor(parameters.offset / parameters.limit) + 1
        ) * parameters.limit);
        this.#lastPageChangeTime = Date.now();
    };

    render ({
        expanded,
        fields,
        parameters,
        onGetItemLink,
        locale: localizedFields,
        view,
        notice,
    }, { error, result, stale, loading }) {
        let className = 'overview-list';
        if (expanded) className += ' search-expanded';
        if (stale) className += ' stale';

        let stats, contents, paginationText;
        let prevDisabled = true;
        let nextDisabled = true;
        if (error) {
            // TODO
            contents = 'error';
        } else if (result) {
            const selectedFields = parameters.fields;
            const selectedFieldIds = selectedFields.map(x => x.id);
            let compiledFields = [];
            // first, push fixed fields
            for (const field of selectedFields) if (field.fixed) compiledFields.push(field);
            // then transient fields
            if (result.transientFields) {
                for (const id of result.transientFields) {
                    if (!selectedFieldIds.includes(id)) compiledFields.push({ id, transient: true });
                }
            }
            // finally, push user fields
            for (const field of selectedFields) if (!field.fixed) compiledFields.push(field);

            compiledFields = compiledFields.filter(({ id }) => !fields[id].hide);

            if (result.stats) {
                stats = locale.stats(
                    result.items.length,
                    result.stats.filtered,
                    result.total,
                    result.stats.time,
                );
            }

            paginationText = locale.paginationItems(
                Math.min(result.total, parameters.offset + 1),
                Math.min(result.total, parameters.offset + parameters.limit),
                result.total,
            );

            prevDisabled = parameters.offset === 0;
            nextDisabled = parameters.offset + parameters.limit >= result.total;

            contents = [
                <ListHeader
                    key="header"
                    selectedFields={compiledFields}
                    fields={fields}
                    locale={localizedFields} />,
            ];

            contents.push(...result.items.map((id, i) => <ListItem
                view={view}
                cursed={result.cursed && result.cursed.includes(id)}
                key={id}
                id={id}
                selectedFields={compiledFields}
                fields={fields}
                onGetItemLink={onGetItemLink}
                index={i}
                expanded={expanded}
                lastCollapseTime={this.#lastCollapseTime}
                locale={localizedFields} />));
        }

        return (
            <div class={className}>
                <header class="list-meta">
                    <span>{stats}</span>
                    <CircularProgress class="loading-indicator" indeterminate={loading} small />
                </header>
                {notice ? <div class="list-notice">{notice}</div> : null}
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
                        <NativeSelect value={parameters.limit} onChange={e => {
                            this.props.onSetLimit(e.target.value | 0);
                        }}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </NativeSelect>
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
    #ffScheduledUpdate;
    scheduleUpdate = () => {
        clearTimeout(this.#scheduledUpdate);
        clearTimeout(this.#ffScheduledUpdate);
        this.#scheduledUpdate = setTimeout(this.updateHeight, 1);
        // also a schedule update further in the future
        // because sometimes layout may be just a tad off
        this.#ffScheduledUpdate = setTimeout(this.updateHeight, 1000);
    };
    // because sometimes layout may be just a tad off

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
        clearTimeout(this.#ffScheduledUpdate);
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

function ListHeader ({ fields, selectedFields, locale }) {
    // FIXME: duplicate code with below
    const fieldWeights = selectedFields.map(x => fields[x.id].weight || 1);
    const weightSum = fieldWeights.reduce((a, b) => a + b, 0);
    const actualUnit = 100 / weightSum;
    const unit = Math.max(10, actualUnit);

    const style = {
        gridTemplateColumns: fieldWeights.map(x => (x * actualUnit) + '%').join(' '),
        width: weightSum * unit > 100 ? `${weightSum / unit * 100}%` : null,
    };
    style.maxWidth = style.width;

    const cells = selectedFields.map(({ id }) => (
        <div key={id} class="list-header-cell">
            <div class="cell-label">{locale[id]}</div>
            {/* sorting? */}
        </div>
    ));

    return <div class="list-header" style={style}>{cells}</div>;
}

const ListItem = connect(props => ([props.view, {
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
            return this.#node ? this.#node.button.getBoundingClientRect() : null;
        }
        return null;
    }

    componentDidUpdate (prevProps, _, oldRect) {
        if (prevProps.index !== this.props.index && this.#node && oldRect) {
            const newRect = this.#node.button.getBoundingClientRect();
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
        locale,
        cursed,
    }) {
        if (!data) return null;

        const selectedFieldIds = selectedFields.map(x => x.id);

        const cells = selectedFields.map(({ id }) => {
            let Component;
            if (fields[id]) Component = fields[id].component;
            else Component = () => `unknown field ${id}`;

            return (
                <div key={id} class="list-item-cell">
                    <div class="cell-label">{locale[id]}</div>
                    <Component value={data[id]} item={data} fields={selectedFieldIds} />
                </div>
            );
        });

        const fieldWeights = selectedFields.map(x => fields[x.id].weight || 1);
        const weightSum = fieldWeights.reduce((a, b) => a + b, 0);
        const actualUnit = 100 / weightSum;
        const unit = Math.max(10, actualUnit);

        const constOffset = this.#inTime === 5 ? 0 : 15 * Math.exp(-10 * this.#inTime);
        const spreadFactor = this.#inTime === 5 ? 0 : 4 * Math.exp(-10 * this.#inTime);
        const yOffset = this.#yOffset.value;

        const style = {
            gridTemplateColumns: fieldWeights.map(x => (x * actualUnit) + '%').join(' '),
            width: weightSum * unit > 100 ? `${weightSum / unit * 100}%` : null,
            transform: `translateY(${(constOffset + spreadFactor * index) * 10 + yOffset}px)`,
            opacity: Math.max(0, Math.min(1 - spreadFactor * index / 2, 1)),
        };
        style.maxWidth = style.width;

        const itemLink = onGetItemLink ? onGetItemLink(id) : null;
        const ItemComponent = onGetItemLink ? LinkButton : 'div';

        return (
            <ItemComponent
                target={itemLink}
                class={'list-item' + (cursed ? ' is-cursed' : '')}
                style={style}
                ref={node => this.#node = node}
                onClick={e => {
                    // don’t keep focus on what is essentially button
                    e.currentTarget.blur();
                }}>
                {cells}
            </ItemComponent>
        );
    }
});
