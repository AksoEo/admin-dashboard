//! This file contains code for both memberships and roles, because they’re really similar.

import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import AddIcon from '@material-ui/icons/Add';
import BusinessIcon from '@material-ui/icons/Business';
import InfoIcon from '@material-ui/icons/Info';
import LanguageIcon from '@material-ui/icons/Language';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Page from '../../../components/page';
import DataList from '../../../components/lists/data-list';
import { IdUEACode } from '../../../components/data/uea-code';
import { country, date } from '../../../components/data';
import MembershipChip from '../../../components/membership-chip';
import TinyProgress from '../../../components/controls/tiny-progress';
import { coreContext } from '../../../core/connection';
import { connectPerms } from '../../../perms';
import { codeholders as locale } from '../../../locale';
import Meta from '../../meta';
import { LinkButton } from '../../../router';
import './membership.less';

// TODO: clean up some naming (currently everything is called membership)

function makeInDetailView (task, extra, signal, render, empty, target, className) {
    return class MRInDetailView extends PureComponent {
        state = {
            items: null,
        };

        static contextType = coreContext;

        loadPreview () {
            this.context.createTask(task, { id: this.props.id }, {
                offset: 0,
                limit: 20,
                ...extra,
            }).runOnceAndDrop().then(res => {
                this.setState({ items: res.items });
            }).catch(err => {
                console.error('Failed to fetch membership/roles', err); // eslint-disable-line no-console
            });
        }

        #sigView;
        bindSigView () {
            if (this.#sigView) this.#sigView.drop();
            this.#sigView = this.context.createDataView(signal, {
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
        componentWillUnmount () {
            if (this.#sigView) this.#sigView.drop();
        }

        render () {
            const memberships = this.state.items ? this.state.items.map(render) : [];
            const loading = this.state.items === null;

            let noMemberships = false;
            if (!memberships.length) {
                noMemberships = true;
                memberships.push(
                    <span key={0} class="membership-empty">
                        {empty}
                    </span>
                );
            }

            return (
                <div class={className + '-editor'}>
                    <div class={className + 's' + (noMemberships ? ' is-empty' : '')}>
                        {loading ? <TinyProgress /> : memberships}
                    </div>
                    <LinkButton
                        icon
                        small
                        class="membership-edit-button"
                        style={{ lineHeight: '36px' }} // FIXME: weird
                        target={`/membroj/${this.props.id}/${target}`}>
                        <MoreHorizIcon style={{ verticalAlign: 'middle' }} />
                    </LinkButton>
                </div>
            );
        }
    };
}

export const MembershipInDetailView = makeInDetailView(
    'codeholders/listMemberships',
    {},
    'codeholders/codeholderSigMemberships',
    item => {
        return (
            <MembershipChip
                class="membership-item"
                key={`${item.id}-${item.year}`}
                abbrev={item.nameAbbrev}
                name={item.name}
                year={item.year}
                givesMembership={item.givesMembership}
                lifetime={item.lifetime} />
        );
    },
    locale.noMemberships,
    'membrecoj',
    'membership',
);

export const RolesInDetailView = makeInDetailView(
    'codeholders/listRoles',
    {},
    'codeholders/codeholderSigRoles',
    item => {
        return (
            <span key={item.id} class={'role' + (!item.isActive ? ' is-inactive' : '')}>
                {item.role.name}
            </span>
        );
    },
    locale.noRoles,
    'roloj',
    'role',
);

function makePage (createTask, signal, listTask, deleteTask, fieldId, perm, renderItem, renderMenu, title, add, empty, itemHeight) {
    return connectPerms(class MRPage extends Page {
        static contextType = coreContext;

        render ({ perms }) {
            const canEdit = perms.hasCodeholderField(perm, 'w');

            // get codeholder id from the match above
            const id = +this.props.matches.codeholder[1];

            return (
                <div class="codeholder-memberships-page">
                    <Meta
                        title={title}
                        priority={9}
                        actions={[canEdit && {
                            label: add,
                            icon: <AddIcon />,
                            action: () => {
                                this.context.createTask(createTask, { id }); // task view
                            },
                        }].filter(x => x)} />
                    <DataList
                        updateView={[signal, { id }]}
                        onLoad={(offset, limit) =>
                            this.context.createTask(listTask, {
                                id,
                            }, { offset, limit }).runOnceAndDrop()}
                        emptyLabel={empty}
                        itemHeight={itemHeight}
                        onRemove={canEdit && (item =>
                            this.context.createTask(deleteTask, {
                                id,
                            }, { [fieldId]: item.id }).runOnceAndDrop())}
                        renderItem={renderItem}
                        renderMenu={renderMenu(id)} />
                </div>
            );
        }
    });
}

export const MembershipPage = makePage(
    'codeholders/addMembership',
    'codeholders/codeholderSigMemberships',
    'codeholders/listMemberships',
    'codeholders/deleteMembership',
    'membership',
    'membership',
    item => (
        <div class="membership-item">
            <div class="item-title">
                <MembershipChip
                    class="item-chip"
                    abbrev={item.nameAbbrev}
                    name={item.name}
                    year={item.year}
                    givesMembership={item.givesMembership}
                    lifetime={item.lifetime} />
                <span class="item-name">{item.name}</span>
            </div>
            <div class="item-desc">
                <span class="item-attr attr-lifetime" data-value={item.lifetime}>
                    {locale.membership.lifetime[item.lifetime ? 'yes' : 'no']}
                </span>
                <span class="item-attr attr-gives-membership" data-value={item.givesMembership}>
                    {locale.membership.givesMembership[item.givesMembership ? 'yes' : 'no']}
                </span>
                {item.canuto && (
                    <span class="item-attr attr-canuto" data-value="true">
                        {locale.membership.canutoAttr}
                    </span>
                )}
            </div>
        </div>
    ),
    () => null,
    locale.memberships,
    locale.addMembership,
    locale.noMemberships,
    60,
);

export const RolesPage = makePage(
    'codeholders/addRole',
    'codeholders/codeholderSigRoles',
    'codeholders/listRoles',
    'codeholders/deleteRole',
    'role',
    'roles',
    item => (
        <div class="role-item">
            <div class="item-name">
                {item.role.name}
            </div>
            <div class="item-desc">
                <span class="item-timespan">
                    <date.inlineRenderer value={item.durationFrom * 1000} />
                    {'–'}
                    <date.inlineRenderer value={item.durationTo * 1000} />
                </span>
                <span class="additional-details">
                    {item.dataCountry ? (
                        <span class="detail-country">
                            <LanguageIcon className="detail-icon" />
                            <country.renderer value={item.dataCountry} />
                        </span>
                    ) : null}
                    {item.dataOrg ? (
                        <span class="detail-org">
                            <BusinessIcon className="detail-icon" />
                            <IdUEACode id={item.dataOrg} />
                        </span>
                    ) : null}
                    {item.dataString ? (
                        <span class="detail-string">
                            <InfoIcon className="detail-icon" />
                            {item.dataString}
                        </span>
                    ) : null}
                </span>
            </div>
        </div>
    ),
    id => (item, core) => [
        {
            label: locale.role.edit,
            action: () => {
                core.createTask('codeholders/updateRole', {
                    id, entry: item.id,
                }, {
                    // FIXME: kinda hacky
                    durationFrom: item.durationFrom ? new Date(item.durationFrom * 1000).toISOString().split('T')[0] : null,
                    durationTo: item.durationTo ? new Date(item.durationTo * 1000).toISOString().split('T')[0] : null,
                    role: item.role.id,
                    dataCountry: item.dataCountry,
                    dataOrg: item.dataOrg,
                    dataString: item.dataString,
                }); // task view
            },
        },
    ],
    locale.roles,
    locale.addRole,
    locale.noRoles,
    56,
);
