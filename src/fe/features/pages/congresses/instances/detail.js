import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../components/page';
import DetailShell from '../../../../components/detail-shell';
import DynamicHeightDiv from '../../../../components/dynamic-height-div';
import TejoIcon from '../../../../components/tejo-icon';
import UeaIcon from '../../../../components/uea-icon';
import Tabs from '../../../../components/tabs';
import { date } from '../../../../components/data';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import { congressInstances as locale, congressLocations as locationLocale } from '../../../../locale';
import { FIELDS } from './fields';
import Locations from './locations';
import Programs from './programs';
import Map from '../map';
import './detail.less';

export default connectPerms(class CongressInstancePage extends Page {
    state = {
        edit: null,
        org: 'meow', // dummy placeholder
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

        this.#commitTask = this.context.createTask('congresses/updateInstance', {
            congress: this.congress,
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
        return +this.props.matches[this.props.matches.length - 3][1];
    }
    get id () {
        return +this.props.match[1];
    }

    get tab () {
        if (this.props.editing) return null;
        if (this.props.locations) return 'locations';
        if (this.props.programs) return 'programs';
        else {
            this.props.push('lokoj', true);
            return 'locations';
        }
    }
    set tab (tab) {
        if (tab === this.tab) return;
        if (this.props.locations) this.props.locations.pop(true);
        if (this.props.programs) this.props.programs.pop(true);
        if (tab === 'locations') {
            this.props.push('lokoj', true);
        } else if (tab === 'programs') {
            this.props.push('programeroj', true);
        }
    }

    render ({ perms, editing }, { org }) {
        const { congress, id, tab } = this;

        const actions = [];

        if (perms.hasPerm(`congress_instances.update.${org}`)) {
            actions.push({
                icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                label: locationLocale.create.menuItem,
                action: () => this.context.createTask('congresses/createLocation', { congress, instance: id }),
            }, {
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm(`congress_instances.delete.${org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('congresses/deleteInstance', { congress, id }),
                overflow: true,
            });
        }

        return (
            <div class="congress-instance-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailShell
                    view="congresses/instance"
                    id={id}
                    options={{ congress }}
                    editing={editing}
                    edit={this.state.edit}
                    onEditChange={edit => this.setState({ edit })}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    locale={locale}
                    onDelete={() => this.props.pop()}>
                    {data => (
                        <div class="instance-inner">
                            <Header
                                editing={editing}
                                onItemChange={edit => this.setState({ edit })}
                                item={this.state.edit || data}
                                org={org}
                                tab={tab}
                                onTabChange={tab => this.tab = tab} />
                            {!!editing && <LocationEditor
                                item={this.state.edit || data}
                                onItemChange={edit => this.setState({ edit })}/>}
                            {!editing && (tab === 'locations') && <Locations
                                congress={congress}
                                org={org}
                                instance={id}
                                push={this.props.push} />}
                            {!editing && (tab === 'programs') && <Programs
                                congress={congress}
                                org={org}
                                instance={id}
                                push={this.props.push} />}
                        </div>
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

function FieldWrapper ({ field, item, onItemChange }) {
    const Component = FIELDS[field].component;
    return <Component
        item={item}
        onItemChange={onItemChange}
        value={item[field]}
        onChange={value => onItemChange({ ...item, [field]: value })}
        slot="detail"
        editing={true} />;
}

function Header ({ item, editing, onItemChange, org, tab, onTabChange }) {
    let orgIcon;
    if (org === 'tejo') orgIcon = <TejoIcon />;
    else if (org === 'uea') orgIcon = <UeaIcon />;

    return (
        <div class="instance-header">
            <DynamicHeightDiv useFirstHeight>
                <div class="header-title">
                    {!editing && <span class="org-icon">{orgIcon}</span>}
                    {editing ? (
                        <TextField
                            class="title-editor"
                            outline
                            label={locale.fields.name}
                            value={item.name}
                            onChange={e => onItemChange({ ...item, name: e.target.value })} />
                    ) : item.name}
                </div>
                {editing ? (
                    <div class="header-timespan is-editing">
                        <FieldWrapper field="dateFrom" item={item} onItemChange={onItemChange} />
                        <FieldWrapper field="dateTo" item={item} onItemChange={onItemChange} />
                    </div>
                ) : (
                    <div class="header-timespan">
                        <date.renderer value={item.dateFrom} />
                        {'–'}
                        <date.renderer value={item.dateTo} />
                    </div>
                )}
                {!editing && (
                    <div class="header-location">
                        {item.locationName}
                    </div>
                )}
                {!editing && (
                    <Tabs
                        value={tab}
                        onChange={onTabChange}
                        tabs={locale.tabs} />
                )}
            </DynamicHeightDiv>
        </div>
    );
}

function LocationEditor ({ item, onItemChange }) {
    if (!item) return null;

    return (
        <div class="instance-location-editor">
            <div class="location-editor-top">
                <FieldWrapper field="locationName" item={item} onItemChange={onItemChange} />
                <FieldWrapper field="locationNameLocal" item={item} onItemChange={onItemChange} />
                <FieldWrapper field="locationAddress" item={item} onItemChange={onItemChange} />
            </div>
            <Map
                center={item.locationCoords || [0, 0]}
                zoom={10}
                markers={[
                    item.locationCoords && {
                        location: item.locationCoords,
                    },
                ].filter(x => x)} />
        </div>
    );
}
