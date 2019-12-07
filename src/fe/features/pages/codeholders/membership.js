import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Button, Dialog } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Page from '../../../components/page';
import DataList from '../../../components/data-list';
import { coreContext, connect } from '../../../core/connection';
import { codeholders as locale } from '../../../locale';
import Meta from '../../meta';
import { LinkButton } from '../../../router';
import './membership.less';

export class MembershipInDetailView extends PureComponent {
    state = {
        preview: [],
    };

    static contextType = coreContext;

    loadPreview () {
        this.context.createTask('codeholders/listMemberships', { id: this.props.id }, {
            offset: 0,
            limit: 20,
        }).runOnceAndDrop().then(res => {
            this.setState({ preview: res.items });
        }).catch(err => {
            console.error('Failed to fetch membership', err); // eslint-disable-line no-console
        });
    }

    #sigView;
    bindSigView () {
        if (this.#sigView) this.#sigView.drop();
        this.#sigView = this.context.createDataView('codeholders/codeholderSigMemberships', {
            id: this.props.id,
        });
        this.#sigView.on('update', () => this.loadPreview());
    }

    componentDidMount () {
        this.loadPreview();
        this.bindSigView();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) {
            this.loadPreview();
            this.bindSigView();
        }
    }

    render () {
        const memberships = this.state.preview.map(item => {
            let className = 'membership';
            if (item.givesMembership) className += ' gives-membership';
            if (item.lifetime) className += ' lifetime';
            return (
                <span key={item.id} class={className}>
                    <span class="membership-name">{item.nameAbbrev}</span>
                    <span class="membership-year">{item.year}</span>
                </span>
            );
        });

        let noMemberships = false;
        if (!memberships.length) {
            noMemberships = true;
            memberships.push(
                <span key={0} class="membership-empty">
                    {locale.noMemberships}
                </span>
            );
        }

        return (
            <div class="membership-editor">
                <div class={'memberships' + (noMemberships ? ' is-empty' : '')}>
                    {memberships}
                </div>
                <LinkButton
                    icon
                    small
                    class="membership-edit-button"
                    style={{ lineHeight: '36px' }} // FIXME: weird
                    target={`/membroj/${this.props.id}/membrecoj`}>
                    <MoreHorizIcon style={{ verticalAlign: 'middle' }} />
                </LinkButton>
            </div>
        );
    }
}

/// Membership editor.
export default class MembershipPage extends Page {
    static contextType = coreContext;

    render () {
        const canEdit = true; // TODO

        // get codeholder id from the match above
        const id = +this.props.matches[this.props.matches.length - 2][1];

        return (
            <div class="codeholder-memberships-page">
                <Meta
                    title={locale.memberships}
                    priority={9}
                    actions={[canEdit && {
                        label: locale.addMembership,
                        icon: <AddIcon />,
                        action: () => {
                            this.context.createTask('codeholders/addMembership', { id, }); // task view
                        },
                    }].filter(x => x)} />
                <DataList
                    updateView={['codeholders/codeholderSigMemberships', { id }]}
                    onLoad={(offset, limit) =>
                        this.context.createTask('codeholders/listMemberships', {
                            id,
                        }, { offset, limit }).runOnceAndDrop()}
                    emptyLabel={locale.noMemberships}
                    itemHeight={56}
                    onRemove={canEdit && (item =>
                        this.context.createTask('codeholders/deleteMembership', {
                            id,
                        }, { membership: item.id }).runOnceAndDrop())}
                    renderItem={item => (
                        <div class="membership-item">
                            <div class="item-name">
                                {item.name}
                                {item.nameAbbrev ? ` (${item.nameAbbrev})` : null}
                            </div>
                            <div class="item-desc">
                                {item.year}
                                {', '}
                                {locale.membership.lifetime[item.lifetime ? 'yes' : 'no']}
                                {', '}
                                {locale.membership.givesMembership[item.givesMembership ? 'yes' : 'no']}
                                {/* TODO: more stuff */}
                            </div>
                        </div>
                    )} />

                <Dialog
                    backdrop
                    class="membership-editor-add-dialog"
                    open={this.state.addingMembership}
                    onClose={() => this.setState({ addingMembership: false })}
                    title={locale.addMembership}>
                    <AddMembership id={id} onSuccess={() => this.setState({ addingMembership: false, editing: true })} />
                </Dialog>
            </div>
        );
    }
}

// FIXME: super rudimentary
const AddMembership = connect('memberships/categories')((categories, core) => ({
    categories,
    core,
}))(function AddMembership ({ id, onSuccess, categories, core }) {
    categories = categories || {};
    const [category, setCategory] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());

    return (
        <div>
            <select value={category} onChange={e => setCategory(e.target.value)}>
                {Object.values(categories).map(({ id, nameAbbrev, name, availableFrom, availableTo }) => <option key={id} value={id}>
                    ({nameAbbrev}) {name} ({availableFrom}-{availableTo})
                </option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} />
            <Button onClick={() => {
                core.createTask('codeholders/addMembership', { id }, {
                    category: +category,
                    year: +year,
                }).runOnceAndDrop().then(onSuccess).catch(err => {
                    console.error('failed to add', err); // eslint-disable-line no-console
                });
            }}>
                [[add]]
            </Button>
        </div>
    );
});
