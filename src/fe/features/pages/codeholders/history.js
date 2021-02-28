import { h } from 'preact';
import { CircularProgress } from '@cpsdqs/yamdl';
import Page from '../../../components/page';
import { coreContext } from '../../../core/connection';
import Meta from '../../meta';
import { codeholders as locale } from '../../../locale';
import { IdUEACode } from '../../../components/data/uea-code';
import { timestamp } from '../../../components/data';
import { fields as detailFields } from './detail-fields';
import './history.less';

// TODO: add loading indicator

export default class History extends Page {
    static contextType = coreContext;

    state = {
        items: [],
        loading: false,
    };

    #loadTask = null;
    #reloadTimeout = null;

    load () {
        if (this.#loadTask) return;
        this.setState({ loading: true });
        this.#loadTask = this.context.createTask('codeholders/fieldHistory', {
            // get codeholder id from the match above
            id: +this.props.matches[this.props.matches.length - 2][1],
            field: this.props.query,
        }).runOnceAndDrop().then(({ items }) => {
            this.setState({ items, loading: false });
        }).catch(err => {
            console.error('Failed to fetch field history', err); // eslint-disable-line no-console
            this.#reloadTimeout = setTimeout(() => this.load(), 1000);
        }).then(() => this.#loadTask = null);
    }

    componentDidMount () {
        this.load();
    }

    componentDidUpdate (prevProps) {
        // FIXME: does not check if codeholder id changed
        if (prevProps.query !== this.props.query) {
            this.load();
        }
    }

    componentWillUnmount () {
        clearTimeout(this.#reloadTimeout);
    }

    render () {
        const renderer = detailFields[this.props.query]
            ? detailFields[this.props.query].component
            : (() => 'eraro');

        const fieldName = (locale.fields[this.props.query] || '???').toLowerCase();

        return (
            <div class="codeholder-field-history">
                <Meta title={locale.fieldHistory.title(fieldName)} />
                {this.state.loading ? (
                    <div class="history-loading-container">
                        <CircularProgress indeterminate />
                    </div>
                ) : null}
                <div class="history-items">
                    {this.state.items.map(item => <FieldHistoryItem
                        key={item.id}
                        item={item}
                        field={this.props.query}
                        renderer={renderer} />)}
                </div>
            </div>
        );
    }
}

function FieldHistoryItem ({ item, field, renderer: Renderer }) {
    let className = 'field-history-item';
    if (!item.author) className += ' initial';

    return (
        <div class={className}>
            <div class="item-value">
                <Renderer value={item.data[field]} item={item.data} isHistory />
            </div>
            {item.author ? (
                <div class="item-meta">
                    {item.comment ? (
                        <div class="item-comment">
                            {locale.fieldHistory.comment}: {item.comment}
                        </div>
                    ) : null}
                    <div class="item-additional">
                        {locale.fieldHistory.changedBy} <DiffAuthor author={item.author} />
                        {' · '}
                        <timestamp.inlineRenderer value={item.time} />
                    </div>
                </div>
            ) : (
                <div class="item-meta">
                    {locale.fieldHistory.initial}
                </div>
            )}
        </div>
    );
}

function DiffAuthor ({ author }) {
    const parts = author.split(':');
    if (parts[0] === 'ch') {
        // codeholder
        return <IdUEACode id={+parts[1]} />;
    } else {
        // app
        // TODO: this
        throw new Error('unimplemented: app author');
    }
}
