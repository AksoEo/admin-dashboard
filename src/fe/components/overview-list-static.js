import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { coreContext } from '../core/connection';
import DynamicHeightDiv from './dynamic-height-div';
import ListItem from './overview-list-item';
import './overview-list-static.less';

function scrollToNode (node) {
    if (!node) return;
    node.scrollIntoView && node.scrollIntoView({ behavior: 'smooth' });
}

/// Because the OverviewList component is very unwieldy, this is a variant that is specifically
/// meant for being embedded. This does not have any fancy `parameters` integration or anything
/// like that.
///
/// # Props
/// - task, view, options, viewOptions, locale: same as OL
/// - fields: same as OL, but all of them will be shown (in order)
/// - sorting: optional object { [field]: sorting }
/// - jsonFilter: optional JSON filter
/// - offset/onSetOffset: list offset
/// - limit/onSetLimit: page limit. onSetLimit is optional
/// - emptyLabel: empty label
/// - onItemClick: callback (id) => void
/// - compact: bool
export default class StaticOverviewList extends PureComponent {
    static contextType = coreContext;

    state = {
        loading: false,
        error: null,
        result: null,
        animateBackwards: false,
    };

    #currentTask = null;
    #nextLoadIsBackwards = false;
    #lastPageChangeTime = null;
    #scrollToNodeOnLoad = null;

    load () {
        if (this.#currentTask) this.#currentTask.drop();
        const { task, options, fields, sorting, offset, limit, jsonFilter } = this.props;
        this.setState({ loading: true });

        const s = sorting || {};
        const params = {
            fields: Object.keys(fields).map(f => s[f] ? [f, s[f]] : f),
            jsonFilter: jsonFilter ? { filter: jsonFilter } : null,
            offset,
            limit,
        };

        const t = this.#currentTask = this.context.createTask(task, options || {}, params);

        this.#currentTask.runOnceAndDrop().then(result => {
            if (this.#currentTask !== t) return;
            this.setState({
                result,
                error: null,
                loading: false,
                animateBackwards: this.#nextLoadIsBackwards,
            });

            if (this.#scrollToNodeOnLoad) {
                scrollToNode(this.#scrollToNodeOnLoad);
                this.#scrollToNodeOnLoad = null;
            }

            if (offset >= result.total && result.total !== 0) {
                // we’re out of bounds; adjust
                this.props.onSetOffset(Math.floor(result.total / limit) * limit);
            } else {
                this.#nextLoadIsBackwards = false;
            }
        }).catch(error => {
            if (this.#currentTask !== t) return;
            this.#nextLoadIsBackwards = false;
            console.error(error); // eslint-disable-line no-console
            this.setState({ result: null, error, loading: false });
        });
    }

    componentDidMount () {
        this.load();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.offset !== this.props.offset
            || prevProps.limit !== this.props.limit) {
            this.load();
        }
        if (prevProps.task !== this.props.task
            || prevProps.view !== this.props.view) {
            this.setState({ error: null, result: null });
            this.load();
        }
    }

    render ({
        view,
        viewOptions,
        fields,
        compact,
        locale,
        onItemClick,
        emptyLabel,
    }, { loading, error, result, animateBackwards }) {
        const selectedFields = Object.keys(fields).map(f => ({ id: f }));

        let contents = null;
        if (error) {
            // TODO
        } else if (result) {
            contents = [];

            if (result.total === 0 && emptyLabel) {
                contents.push(<div class="empty-label">{emptyLabel}</div>);
            }

            let i = 0;
            for (const id of result.items) {
                const onClick = onItemClick
                    ? () => onItemClick(id)
                    : null;

                contents.push(
                    <ListItem
                        view={view}
                        options={viewOptions || {}}
                        onClick={onClick}
                        compact={compact}
                        key={id}
                        id={id}
                        selectedFields={selectedFields}
                        fields={fields}
                        index={animateBackwards ? result.items.length - 1 - i : i}
                        animateBackwards={animateBackwards}
                        locale={locale} />
                );
                i++;
            }
        }

        return (
            <div class="static-overview-list">
                <DynamicHeightDiv
                    class={'list-contents' + (loading ? ' is-loading' : '')}
                    useCooldown cooldown={400}
                    lastChangeTime={this.#lastPageChangeTime}>
                    {contents}
                </DynamicHeightDiv>
            </div>
        );
    }
}
