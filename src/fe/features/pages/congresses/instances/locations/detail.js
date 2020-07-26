import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import DetailShell from '../../../../../components/detail-shell';
import { coreContext } from '../../../../../core/connection';
import { connectPerms } from '../../../../../perms';
import { congressLocations as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import Map from '../../map';
import LocationPicker from '../location-picker';
import TagManager from '../tag-manager';
import './detail.less';

export default connectPerms(class LocationPage extends Page {
    state = {
        edit: null,
        org: 'meow', // nonsense default value
    };

    static contextType = coreContext;

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('congresses/updateLocation', {
            congress: this.congress,
            instance: this.instance,
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };
    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
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
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                action: () => push('redakti', true),
            }, {
                label: locale.delete.menuItem,
                overflow: true,
                action: () => this.context.createTask('congresses/deleteLocation', {
                    congress, instance, id,
                }),
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
                            congress={congress}
                            instance={instance}
                            id={id}
                            editing={editing}
                            onItemChange={edit => this.setState({ edit })}
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

function InnerField ({ field, item, editing, onItemChange, ...extra }) {
    const Component = FIELDS[field].component;
    return <Component
        {...extra}
        slot="detail"
        value={item[field]}
        editing={editing}
        onChange={v => onItemChange({ ...item, [field]: v })}
        item={item}
        onItemChange={onItemChange} />;
}

function DetailInner ({ congress, instance, id, item, editing, onItemChange }) {
    const external = item.type === 'external';
    const ll = item.ll;
    const markers = [
        {
            location: ll,
            icon: <InnerField field="icon" item={item} />,
            onDragEnd: editing && (e => {
                const newPos = e.target.getLatLng();
                onItemChange({ ...item, ll: [newPos.lat, newPos.lng] });
            }),
        },
    ];

    let locatedWithin = null;
    if (item.type === 'internal') {
        locatedWithin = (
            <div class="header-external-loc">
                {locale.locatedWithinExternalLoc}
                {(item.externalLoc || editing) ? (
                    <LocationPicker
                        externalOnly
                        canClear
                        congress={congress}
                        instance={instance}
                        value={item.externalLoc}
                        editing={editing}
                        onChange={externalLoc => onItemChange({ ...item, externalLoc })} />
                ) : ' ' + locale.locatedWithinNowhere}
            </div>
        );
    }

    return (
        <div class="location-inner">
            <div class="inner-header">
                <div class="header-title">
                    <InnerField field="icon" item={item} editing={editing} onItemChange={onItemChange} />
                    <InnerField field="name" item={item} editing={editing} onItemChange={onItemChange} />
                </div>
                {locatedWithin}
                <TagManager
                    list="congresses/listLocationTags"
                    selected="congresses/listTagsOfLocation"
                    options={{ congress, instance, location: id }}
                    view="congresses/locationTag"
                    viewOptions={{ congress, instance }}
                    taskOptions={{ congress, instance, location: id }}
                    addTask="congresses/createLocationTag"
                    updateTask="congresses/updateLocationTag"
                    deleteTask="congresses/removeLocationTag"
                    attachTask="congresses/addTagToLocation"
                    removeTask="congresses/removeTagFromLocation" />
            </div>
            <div class="inner-desc">
                {external ? (
                    <InnerField field="rating" item={item} editing={editing} onItemChange={onItemChange} />
                ) : null}
                <InnerField field="description" item={item} editing={editing} onItemChange={onItemChange} />
            </div>
            {external ? (
                <div class="inner-map-title">
                    {locale.fields.location}
                </div>
            ) : null}
            {external ? (
                <div class="inner-map-container">
                    <div class="inner-address">
                        <InnerField field="address" item={item} editing={editing} onItemChange={onItemChange} />
                    </div>
                    {ll ? <Map class="inner-map" center={ll} zoom={13} markers={markers} /> : null}
                    <div class="inner-ll">
                        <InnerField field="ll" item={item} editing={editing} onItemChange={onItemChange} />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
