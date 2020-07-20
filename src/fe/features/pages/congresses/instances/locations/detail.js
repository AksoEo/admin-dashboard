import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import DetailShell from '../../../../../components/detail-shell';
import { connectPerms } from '../../../../../perms';
import { congressLocations as locale } from '../../../../../locale';

export default connectPerms(class LocationPage extends Page {
    state = {
        edit: null,
        org: 'meow', // nonsense default value
    };

    get congress () {
        return +this.props.matches[this.props.matches.length - 5][1];
    }
    get instance () {
        return +this.props.matches[this.props.matches.length - 3][1];
    }
    get id () {
        return +this.props.match[1];
    }

    render ({ perms, push, editing }, { org }) {
        const { congress, instance, id } = this;

        const actions = [];

        if (perms.hasPerm(`congress_instances.update.${org}`)) {
            actions.push({
                label: locale.update.menuItem,
                icon: <EditIcon />,
                action: () => push('redakti', true),
            });
        }

        return (
            <div class="congress-location-detail">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailShell
                    view="congresses/location"
                    id={id}
                    options={{ congress, instance }}
                    editing={editing}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    locale={locale}
                    onDelete={() => this.props.pop()}>
                    {data => (
                        <DetailInner
                            editing={editing}
                            onItemChange={edit => this.setState({ edit})}
                            item={this.state.edit || data}
                            org={org} />
                    )}
                </DetailShell>
                <DetailShell
                    /* this is kind of a hack to get the org field */
                    view="congresses/congress"
                    id={congress}
                    fields={{}}
                    locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
            </div>
        );
    }
});

function DetailInner ({ item, editing, onItemChange, org }) {
    return (
        <div class="location-inner">
            {item.icon}
            {item.name}
            {item.description}
            {item.address}
        </div>
    );
}
