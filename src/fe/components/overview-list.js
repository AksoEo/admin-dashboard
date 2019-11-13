import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { coreContext, connect } from '../core/connection';
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
        if (this.#stale && !this.props.expanded) this.load();
        this.#stale = false;
    }

    componentDidMount () {
        this.maybeReload();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.options !== this.props.options
            || prevProps.parameters !== this.props.parameters) {
            this.#stale = true;
        }

        this.maybeReload();
    }

    render ({ expanded, fields, parameters }, { error, result }) {
        let className = 'overview-list';
        if (expanded) className += ' search-expanded';

        let contents;
        if (error) {
            // TODO
            contents = 'error';
        } else if (result) {
            const selectedFields = parameters.fields;
            const compiledFields = [];
            // first, push fixed fields
            for (const field of selectedFields) if (field.fixed) compiledFields.push(field);
            // then transient fields
            for (const id of result.transientFields) compiledFields.push({ id, transient: true });
            // finally, push user fields
            for (const field of selectedFields) if (!field.fixed) compiledFields.push(field);

            contents = result.items.map(id => <ListItem
                key={id}
                id={id}
                selectedFields={compiledFields}
                fields={fields} />);
        }

        return (
            <div class={className}>
                <header class="list-meta">
                    request took bluh seconds
                </header>
                <button class="compact-prev-page-button">
                    up arrow
                    PREV PAGE
                </button>
                <div class="list-contents">
                    {contents}
                </div>
                <button class="compact-next-page-button">
                    nEXT PAGE
                    down arrow
                </button>
                <div class="compact-pagination">
                    compact pagination goes here
                </div>
                <div class="regular-pagination">
                    regular pagination goes here
                </div>
            </div>
        );
    }
}

const ListItem = connect(props => (['codeholders/codeholder', {
    id: props.id,
    fields: props.selectedFields,
    noFetch: true,
}]))(data => ({ data }))(function ListItem ({ selectedFields, data, fields }) {
    if (!data) return null;

    const selectedFieldIds = selectedFields.map(x => x.id);

    const cells = selectedFields.map(({ id }) => {
        let Component;
        if (fields[id]) Component = fields[id].component;
        else Component = () => `unknown field ${id}`;

        return (
            <div key={id} class="list-item-cell">
                (label {id}):
                <Component value={data[id]} item={data} fields={selectedFieldIds} />
            </div>
        );
    });

    return (
        <div class="list-item">
            {cells}
        </div>
    );
});
