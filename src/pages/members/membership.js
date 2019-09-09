import { h, Component } from 'preact';
import { Button, Dialog } from 'yamdl';
import EditIcon from '@material-ui/icons/Edit';
import DataList from '../../components/data-list';
import client from '../../client';
import locale from '../../locale';

/// Membership editor.
///
/// # Props
/// - `id`: codeholder ID
export default class MembershipEditor extends Component {
    state = {
        // first 100 items (maybe there’s more? We Just Don’t Know)
        preview: [],

        editing: false,
    };

    loadPreview () {
        client.get(`/codeholders/${this.props.id}/membership`, {
            limit: 100,
            fields: ['id', 'year', 'nameAbbrev', 'givesMembership', 'lifetime'],
            order: [['year', 'desc']],
        }).then(res => {
            this.setState({ preview: res.body });
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

        if (!memberships.length) {
            memberships.push(
                <span key={0} class="membership-empty">
                    {locale.members.detail.noMembership}
                </span>
            );
        }

        return (
            <div class="membership-editor">
                {memberships}
                <Button
                    icon
                    small
                    class="membership-edit-button"
                    onClick={() => this.setState({ editing: true })}>
                    <EditIcon />
                </Button>

                <Dialog
                    backdrop
                    class="membership-editor-dialog"
                    fullScreen={width => width < 400}
                    open={this.state.editing}
                    onClose={() => {
                        this.setState({ editing: false });
                        this.loadPreview();
                    }}
                    title={locale.members.detail.membership}>
                    <DataList
                        onLoad={(offset, limit) =>
                            client.get(`/codeholders/${this.props.id}/membership`, {
                                offset,
                                limit,
                                fields: [
                                    'id',
                                    'year',
                                    'name',
                                    'nameAbbrev',
                                    'givesMembership',
                                    'lifetime',
                                ],
                                order: [['year', 'desc']],
                            }).then(res => ({
                                items: res.body,
                                totalItems: +res.res.headers.map['x-total-items'],
                            }))}
                        emptyLabel={locale.members.detail.noMembership}
                        itemHeight={56}
                        onRemove={item =>
                            client.delete(`/codeholders/${this.prosp.id}/membership/${item.id}`)}
                        renderItem={item => (
                            <div class="membership-item">
                                <div class="item-name">
                                    {item.name}
                                    {item.nameAbbrev ? ` (${item.nameAbbrev})` : null}
                                </div>
                                <div class="item-desc">
                                    {item.year}
                                    {/* TODO: more stuff */}
                                </div>
                            </div>
                        )} />
                </Dialog>
            </div>
        );
    }
}
