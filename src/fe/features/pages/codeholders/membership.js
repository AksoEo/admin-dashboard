import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Button, Dialog, AppBarProxy, MenuIcon } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import { CardStackItem } from '../../../components/card-stack';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import DataList from '../../../components/data-list';
import { coreContext, connect } from '../../../core/connection';
import { codeholders as locale } from '../../../locale';

// TODO: use core properly

/// Membership editor.
///
/// # Props
/// - `id`: codeholder ID
/// - `canEdit`: edit permission
export default class MembershipEditor extends PureComponent {
    state = {
        // first 100 items (maybe there’s more? We Just Don’t Know)
        preview: [],

        editing: false,
        addingMembership: false,
    };

    static contextType = coreContext;

    loadPreview () {
        this.context.createTask('codeholders/listMemberships', { id: this.props.id }, {
            offset: 0,
            limit: 100,
        }).runOnceAndDrop().then(res => {
            this.setState({ preview: res.items });
        }).catch(err => {
            console.error('Failed to fetch membership', err); // eslint-disable-line no-console
        });
    }

    componentDidMount () {
        this.loadPreview();
    }
    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id) {
            this.loadPreview();
        }
    }

    render () {
        const { canEdit } = this.props;

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
                <Button
                    icon
                    small
                    class="membership-edit-button"
                    onClick={() => this.setState({ editing: true })}>
                    <MoreHorizIcon />
                </Button>

                <CardStackItem
                    depth={1}
                    class="membership-editor-dialog"
                    open={this.state.editing}
                    onClose={() => {
                        this.setState({ editing: false });
                        this.loadPreview();
                    }}
                    appBar={
                        <AppBarProxy
                            menu={<Button icon small onClick={() => {
                                this.setState({ editing: false });
                                this.loadPreview();
                            }}>
                                <MenuIcon type="back" />
                            </Button>}
                            title={locale.memberships}
                            priority={9}
                            actions={[canEdit && {
                                label: locale.addMembership,
                                icon: <AddIcon />,
                                action: () => this.setState({ addingMembership: true }),
                            }].filter(x => x)} />
                    }>
                    <DataList
                        onLoad={(offset, limit) =>
                            this.context.createTask('codeholders/listMemberships', {
                                id: this.props.id,
                            }, { offset, limit }).runOnceAndDrop().then(res => ({
                                items: res.items,
                                totalItems: res.total,
                            }))}
                        emptyLabel={locale.noMemberships}
                        itemHeight={56}
                        onRemove={canEdit && (item =>
                            this.context.createTask('codeholders/deleteMembership', {
                                id: this.props.id
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
                </CardStackItem>

                <Dialog
                    backdrop
                    class="membership-editor-add-dialog"
                    open={this.state.addingMembership}
                    onClose={() => this.setState({ addingMembership: false })}
                    title={locale.addMembership}>
                    <AddMembership id={this.props.id} onSuccess={() => this.setState({ addingMembership: false, editing: true })} />
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
    categories = categories || [];
    const [category, setCategory] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());

    return (
        <div>
            <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(({ id, nameAbbrev, name, availableFrom, availableTo }) => <option key={id} value={id}>
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
