import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Meta from '../../../../meta';
import Page from '../../../../../components/page';
import DetailShell from '../../../../../components/detail-shell';
import DynamicHeightDiv from '../../../../../components/dynamic-height-div';
import TaskImage from '../../../../../components/task-image';
import { coreContext } from '../../../../../core/connection';
import { connectPerms } from '../../../../../perms';
import { congressLocations as locale } from '../../../../../locale';
import { FIELDS } from './fields';
import Map from '../../map';
import MapPicker from '../../map-picker';
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
        return +this.props.matches.congress[1];
    }
    get instance () {
        return +this.props.matches.instance[1];
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
        slot="detail"
        {...extra}
        value={item[field]}
        editing={editing}
        onChange={v => onItemChange({ ...item, [field]: v })}
        item={item}
        onItemChange={onItemChange} />;
}

export function DetailInner ({ congress, instance, id, item, editing, onItemChange, isCreation }) {
    if (!item) return null;
    const showTags = id !== null;
    const external = item.type === 'external';
    const ll = item.ll;
    const markers = [
        {
            location: ll,
            icon: item.icon !== 'GENERIC' && <InnerField field="icon" item={item} slot="marker" />,
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
        <div class="congress-location-detail-inner">
            <div class={'header-top' + (isCreation ? ' is-creation' : '')}>
                {!isCreation && <TaskImage
                    lightbox class="header-cover-image"
                    task="congresses/locationThumbnail"
                    options={{ congress, instance, id }}
                    sizes={[32, 64, 128, 256, 512, 1024, 2048]}
                    id={id}
                    editing={editing}
                    onUpdate={(thumbnail, core) => {
                        const task = core.createTask('congresses/updateLocationThumbnail', {
                            congress, instance, id,
                        }, {
                            thumbnail,
                        });
                        return new Promise(resolve => task.on('drop', resolve));
                    }} />}
                <div class="header-text-protection" />
                <div class={'inner-header-container' + (editing ? ' is-editing' : '')}>
                    <DynamicHeightDiv class="inner-header" useFirstHeight>
                        <div class="header-title">
                            {external ? (
                                <InnerField field="icon" item={item} editing={editing} onItemChange={onItemChange} />
                            ) : null}
                            <InnerField field="name" item={item} editing={editing} onItemChange={onItemChange} />
                        </div>
                        {locatedWithin}
                        {showTags && (
                            <TagManager
                                list="congresses/listLocationTags"
                                selected="congresses/listTagsOfLocation"
                                options={{ congress, instance, location: id }}
                                view="congresses/locationTag"
                                viewOptions={{ congress, instance }}
                                taskOptions={{ congress, instance, location: id }}
                                addTask="congresses/createLocationTag"
                                updateTask="congresses/updateLocationTag"
                                deleteTask="congresses/deleteLocationTag"
                                attachTask="congresses/addTagToLocation"
                                removeTask="congresses/removeTagFromLocation" />
                        )}
                    </DynamicHeightDiv>
                </div>
            </div>
            <DynamicHeightDiv class="inner-desc" useFirstHeight>
                {external ? (
                    <div class="inner-field">
                        {editing ? <label>{locale.fields.rating}</label> : null}
                        <InnerField field="rating" item={item} editing={editing} onItemChange={onItemChange} />
                    </div>
                ) : null}
                <div class="inner-field">
                    {editing ? <label>{locale.fields.description}</label> : null}
                    <InnerField field="description" item={item} editing={editing} onItemChange={onItemChange} />
                </div>
                <div class="inner-field">
                    {(editing || item.openHours) ? <label>{locale.fields.openHours}</label> : null}
                    <InnerField
                        field="openHours"
                        item={item}
                        editing={editing}
                        onItemChange={onItemChange}
                        userData={{ congress, instance }} />
                </div>
            </DynamicHeightDiv>
            {external ? (
                <div class="inner-map-title">
                    {locale.fields.location}
                </div>
            ) : null}
            {external ? (
                <div class="inner-map-container">
                    {(editing || item.address) && (
                        <div class="inner-address inner-field">
                            {editing ? <label>{locale.fields.address}</label> : null}
                            <InnerField field="address" item={item} editing={editing} onItemChange={onItemChange} />
                        </div>
                    )}
                    {editing ? (
                        <MapPicker
                            value={ll}
                            onChange={ll => onItemChange({ ...item, ll })}
                            address={item.address}
                            onAddressChange={address => onItemChange({ ...item, address })} />
                    ) : ll ? (
                        <Map class="inner-map" center={ll} zoom={13} markers={markers} />
                    ) : null}
                    {!editing && (
                        <div class="inner-ll">
                            <InnerField field="ll" item={item} editing={editing} onItemChange={onItemChange} />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

