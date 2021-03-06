import { h } from 'preact';
import { Button, TextField } from '@cpsdqs/yamdl';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import BusinessIcon from '@material-ui/icons/Business';
import Page from '../../../../components/page';
import DetailShell from '../../../../components/detail-shell';
import DynamicHeightDiv from '../../../../components/dynamic-height-div';
import OrgIcon from '../../../../components/org-icon';
import Tabs from '../../../../components/tabs';
import { date } from '../../../../components/data';
import Meta from '../../../meta';
import { coreContext } from '../../../../core/connection';
import { connectPerms } from '../../../../perms';
import {
    congressInstances as locale,
    congressLocations as locationLocale,
    congressPrograms as programLocale,
    congressParticipants as participantLocale,
} from '../../../../locale';
import { FIELDS } from './fields';
import Locations from './locations';
import Programs from './programs';
import Participants from './participants';
import MapPicker from '../map-picker';
import './detail.less';

export default connectPerms(class CongressInstancePage extends Page {
    state = {
        edit: null,
        org: '',
        tz: null,
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

    previousTabState = null;
    get tab () {
        let tab;
        if (this.props.editing) tab = null;
        else if (this.props.locations) tab = 'locations';
        else if (this.props.programs) tab = 'programs';
        else if (this.props.participants) tab = 'participants';
        else {
            tab = null;
            if (this.props.isTopPage) {
                this.props.push('lokoj', true);
                tab = 'locations';
            }
        }

        if (tab !== null) {
            this.previousTabState = tab;
        }

        return this.previousTabState;
    }
    set tab (tab) {
        if (tab === this.tab) return;
        this.props.onQueryChange(''); // to prevent crosstalk between the two pages
        if (this.props.locations) this.props.locations.pop(true);
        if (this.props.programs) this.props.programs.pop(true);
        if (this.props.participants) this.props.participants.pop(true);
        if (tab === 'locations') {
            this.props.push('lokoj', true);
        } else if (tab === 'programs') {
            this.props.push('programeroj', true);
        } else if (tab === 'participants') {
            this.props.push('alighintoj', true);
        }
    }

    render ({ perms, editing, query, onQueryChange }, { org }) {
        const { congress, id, tab } = this;

        const actions = [];

        if (perms.hasPerm(`congress_instances.update.${org}`)) {
            if (tab === 'locations') {
                actions.push({
                    key: 'locations',
                    icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                    label: locationLocale.create.menuItem,
                    action: () => this.context.createTask('congresses/createLocation', { congress, instance: id }),
                });
            } else if (tab === 'programs') {
                actions.push({
                    key: 'programs',
                    icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                    label: programLocale.create.menuItem,
                    action: () => this.context.createTask('congresses/createProgram', {
                        congress,
                        instance: id,
                        tz: this.state.tz,
                    }),
                });
            } else if (tab === 'participants') {
                actions.push({
                    key: 'participants',
                    icon: <AddIcon style={{ verticalAlign: 'middle' }} />,
                    label: participantLocale.create.menuItem,
                    action: () => this.context.createTask('congresses/createParticipant', { congress, instance: id }),
                });
            }
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => {
                    // editing breaks the current tab state, so just empty the query
                    this.props.onQueryChange('');
                    this.props.push('redakti', true);
                },
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
                    onData={data => data && this.setState({ tz: data.tz })}
                    onDelete={() => this.props.pop()}>
                    {data => (
                        <div class="instance-inner">
                            <Header
                                editing={editing}
                                onItemChange={edit => this.setState({ edit })}
                                item={this.state.edit || data}
                                org={org}
                                push={this.props.push}
                                tab={tab}
                                onTabChange={tab => this.tab = tab} />
                            {!!editing && <LocationEditor
                                item={this.state.edit || data}
                                onItemChange={edit => this.setState({ edit })}/>}
                            {!editing && (tab === 'locations') && <Locations
                                key="locations"
                                congress={congress}
                                congressAddress={data.locationAddress}
                                congressLocation={data.locationCoords}
                                org={org}
                                instance={id}
                                query={query}
                                onQueryChange={onQueryChange}
                                push={this.props.push} />}
                            {!editing && (tab === 'programs') && <Programs
                                key="programs"
                                congress={congress}
                                org={org}
                                instance={id}
                                query={query}
                                onQueryChange={onQueryChange}
                                push={this.props.push} />}
                            {!editing && (tab === 'participants') && <Participants
                                key="participants"
                                congress={congress}
                                org={org}
                                instance={id}
                                query={query}
                                onQueryChange={onQueryChange}
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

function Header ({ item, editing, onItemChange, org, tab, onTabChange, push }) {
    const orgIcon = <OrgIcon org={org} />;

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
                <div class={'header-id' + (editing ? ' is-editing' : '')}>
                    {editing ? (
                        <TextField
                            class="id-editor"
                            outline
                            label={locale.fields.humanId}
                            value={item.humanId}
                            onChange={e => onItemChange({ ...item, humanId: e.target.value })} />
                    ) : (
                        <div>
                            {locale.fields.humanId}
                            {': '}
                            {item.humanId}
                        </div>
                    )}
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
                {(!editing && (item.locationName || item.locationNameLocal)) && (
                    <div class="header-location">
                        {locale.fields.locationPrefix}
                        {' '}
                        {item.locationName || item.locationNameLocal}
                        {item.locationName && item.locationNameLocal && ` (${item.locationNameLocal})`}
                    </div>
                )}
                {editing ? (
                    <div class="header-time-zone">
                        {locale.fields.tz}
                        {': '}
                        <FieldWrapper field="tz" item={item} onItemChange={onItemChange} />
                    </div>
                ) : item.tz ? (
                    <div class="header-time-zone">
                        {locale.fields.tz}
                        {': '}
                        {item.tz}
                    </div>
                ) : null}
                {!editing && (
                    <div class="header-links">
                        <Button
                            onClick={() => push('alighilo')}
                            class="registration-link">
                            {locale.registrationFormLink}
                        </Button>
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
                <div class="address-field">
                    <FieldWrapper field="locationName" item={item} onItemChange={onItemChange} />
                </div>
                <div class="address-field">
                    <FieldWrapper field="locationNameLocal" item={item} onItemChange={onItemChange} />
                </div>
                <div class="address-field">
                    <label>{locale.fields.locationAddress}</label>
                    <FieldWrapper field="locationAddress" item={item} onItemChange={onItemChange} />
                </div>
            </div>
            <MapPicker
                icon={<BusinessIcon />}
                nullable value={item.locationCoords}
                onChange={locationCoords => onItemChange({ ...item, locationCoords })} />
        </div>
    );
}
