/// Global permissions config
const baseOrgs = {'uea': 'UEA', 'tejo': 'TEJO'};

/// Specification for the permissions editor.
///
/// Each node is an object with a type:
///
/// - type `perm`: shows a simple permission checkbox. Has a `name` (string)
///   and `id` (permission string).
/// - type `category`: a category of permissions. has a `name` (string)
/// - type `group`: identical to category except in presentation
///   and `children` (list of nodes)
/// - type `switch`: a switch, mainly for read/write/create/delete permission escalation.
///   Has a `name` (string) and `options`, which are objects with a `name` and `id`.
///
/// Every node may additionally have a field `implies` that contains a list of permissions that will
/// also be activated by this node (requirements, sort of), and `requires`, which will disable the
/// node until all requirements are met.
///
/// There are also three special nodes:
/// - `{ type: '!memberRestrictionsSwitch', name: string }` which will show a switch to enable or
///   disable member restrictions
/// - `'!memberFieldsEditor'` and `'!memberFilterEditor'`, which will show their namesake
///
/// The `id` of a node must be unique across the entire spec.
export const spec = [
    {
        type: 'perm',
        name: 'Ĉio',
        id: '*',
    },
    {
        type: 'perm',
        name: 'Aliro al admin.akso.org',
        id: 'admin',
    },
    {
        type: 'perm',
        name: 'Malŝalti uzadlimon',
        id: 'ratelimit.disable',
    },
    {
        type: 'category',
        name: 'Membroj',
        children: [
            {
                type: 'switch',
                options: [
                    {
                        name: 'Legi',
                        id: 'codeholders.read',
                        implies: ['codeholder_roles.read'],
                    },
                    {
                        name: 'Redakti',
                        id: 'codeholders.update',
                        implies: ['codeholders.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'codeholders.create',
                        implies: ['codeholders.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'codeholders.delete',
                        implies: ['codeholders.create'],
                    },
                    {
                        name: 'Ĉio',
                        id: 'codeholders.*',
                    },
                ],
            },
            {
                type: 'group',
                requires: ['codeholders.read'],
                children: [
                    { type: '!memberRestrictionsSwitch', name: 'Membrorestriktoj' },
                    '!memberFieldsEditor',
                    '!memberFilterEditor',
                ],
            },
            {
                type: 'group',
                requires: ['codeholders.read'],
                children: [
                    {
                        type: 'perm',
                        name: 'Legi datumhistorion',
                        id: 'codeholders.hist.read',
                    },
                    {
                        type: 'switch',
                        name: 'Membropermesoj',
                        options: [
                            {
                                name: 'Legi',
                                id: 'codeholders.perms.read',
                            },
                            {
                                name: 'Ŝanĝi',
                                id: 'codeholders.perms.update',
                                implies: ['codeholders.perms.read'],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'perm',
                name: 'Malŝalti duan faktoron',
                id: 'codeholders.disable_totp',
                requires: ['codeholders.read'],
            },
            {
                type: 'perm',
                name: 'Sendi sciigon',
                id: 'codeholders.send_notif',
                requires: ['codeholders.read'],
            },
        ],
    },
    {
        type: 'category',
        name: 'Membrokategorioj',
        children: [
            {
                type: 'switch',
                options: [
                    {
                        name: 'Legi',
                        id: 'membership_categories.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'membership_categories.update',
                        implies: ['membership_categories.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'membership_categories.create',
                        implies: ['membership_categories.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'membership_categories.delete',
                        implies: ['membership_categories.create'],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Roloj',
        children: [
            {
                type: 'switch',
                options: [
                    {
                        name: 'Legi',
                        id: 'codeholder_roles.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'codeholder_roles.update',
                        implies: ['codeholder_roles.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'codeholder_roles.create',
                        implies: ['codeholder_roles.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'codeholder_roles.delete',
                        implies: ['codeholder_roles.create'],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Membrolistoj',
        requires: ['codeholders.read'],
        children: [
            {
                type: 'switch',
                options: [
                    {
                        name: 'Legi',
                        id: 'lists.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'lists.update',
                        implies: ['lists.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'lists.create',
                        implies: ['lists.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'lists.delete',
                        implies: ['lists.create'],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Konservitaj filitriloj',
        children: [
            {
                type: 'switch',
                options: [
                    {
                        name: 'Legi',
                        id: 'queries.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'queries.update',
                        implies: ['queries.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'queries.create',
                        implies: ['queries.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'queries.delete',
                        implies: ['queries.create'],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Adresetikedaj ŝablonoj',
        children: [
            {
                type: 'switch',
                options: [
                    {
                        name: 'Legi',
                        id: 'address_label_templates.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'address_label_templates.update',
                        implies: ['address_label_templates.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'address_label_templates.create',
                        implies: ['address_label_templates.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'address_label_templates.delete',
                        implies: ['address_label_templates.create'],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Administrado',
        children: [
            {
                type: 'perm',
                name: 'Legi la HTTP-protokolon',
                id: 'log.read',
            },
            {
                type: 'perm',
                name: 'Ĝisdatigi landojn',
                id: 'countries.update',
            },
            {
                type: 'group',
                name: 'Landaroj',
                children: [
                    {
                        type: 'switch',
                        options: [
                            {
                                name: 'Redakti',
                                id: 'country_groups.update',
                            },
                            {
                                name: 'Krei',
                                id: 'country_groups.create',
                                implies: ['country_groups.update'],
                            },
                            {
                                name: 'Forigi',
                                id: 'country_groups.delete',
                                implies: ['country_groups.create'],
                            },

                        ],
                    },
                ],
            },
            {
                type: 'group',
                name: 'API-klientoj',
                children: [
                    {
                        type: 'switch',
                        options: [
                            {
                                name: 'Legi',
                                id: 'clients.read',
                            },
                            {
                                name: 'Redakti',
                                id: 'clients.update',
                                implies: ['clients.read'],
                            },
                            {
                                name: 'Krei',
                                id: 'clients.create',
                                implies: ['clients.update'],
                            },
                            {
                                name: 'Forigi',
                                id: 'clients.delete',
                                implies: ['clients.create'],
                            },
                        ],
                    },
                    {
                        type: 'switch',
                        name: 'Permesoj',
                        requires: ['clients.read'],
                        options: [
                            {
                                name: 'Legi',
                                id: 'clients.perms.read',
                            },
                            {
                                name: 'Redakti',
                                id: 'clients.perms.update',
                                implies: ['clients.perms.read'],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'group',
                name: 'Administraj grupoj',
                children: [
                    {
                        type: 'switch',
                        options: [
                            {
                                name: 'Legi',
                                id: 'admin_groups.read',
                            },
                            {
                                name: 'Redakti',
                                id: 'admin_groups.update',
                                implies: ['admin_groups.read'],
                            },
                            {
                                name: 'Krei',
                                id: 'admin_groups.create',
                                implies: ['admin_groups.update'],
                            },
                            {
                                name: 'Forigi',
                                id: 'admin_groups.delete',
                                implies: ['admin_groups.create'],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Voĉdonoj',
        children: Object.entries(baseOrgs).map(([org, name]) => {
            return {
                type: 'switch',
                name: 'Voĉdonoj de ' + name,
                options: [
                    {
                        name: 'Legi',
                        id: 'votes.read.' + org,
                    },
                    {
                        name: 'Redakti',
                        id: 'votes.update.' + org,
                        implies: ['votes.read.' + org],
                    },
                    {
                        name: 'Krei',
                        id: 'votes.create.' + org,
                        implies: ['votes.update.' + org],
                    },
                    {
                        name: 'Forigi',
                        id: 'votes.delete.' + org,
                        implies: ['votes.create.' + org],
                    },
                ],
            };
        }),
    },
    {
        type: 'category',
        name: 'Amasmesaĝaj ŝablonoj',
        children: Object.entries(baseOrgs).map(([org, name]) => {
            return {
                type: 'switch',
                name: 'Amasmesaĝaj ŝablonoj de ' + name,
                options: [
                    {
                        name: 'Legi',
                        id: 'notif_templates.read.' + org,
                    },
                    {
                        name: 'Redakti',
                        id: 'notif_templates.update.' + org,
                        implies: ['notif_templates.read.' + org],
                    },
                    {
                        name: 'Krei',
                        id: 'notif_templates.create.' + org,
                        implies: ['notif_templates.update.' + org],
                    },
                    {
                        name: 'Forigi',
                        id: 'notif_templates.delete.' + org,
                        implies: ['notif_templates.create.' + org],
                    },
                ],
            };
        }),
    },
    {
        type: 'category',
        name: 'AKSO-Pago',
        children: [
            {
                type: 'switch',
                name: 'Vidi pagagordojn ...',
                options: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        name: '... por ' + name,
                        id: 'pay.read.' + org,
                    };
                }),
            },
            {
                type: 'group',
                children: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        type: 'switch',
                        name: 'Pagoj por ' + name,
                        options: [
                            {
                                name: 'Legi',
                                id: 'pay.payment_intents.read.' + org,
                                implies: ['pay.read.' + org],
                            },
                            {
                                name: 'Redakti',
                                id: 'pay.payment_intents.update.' + org,
                                implies: ['pay.payment_intents.read.' + org],
                            },
                            {
                                name: 'Krei',
                                id: 'pay.payment_intents.create.' + org,
                                implies: ['pay.payment_intents.update.' + org],
                            },
                            {
                                name: 'Forigi',
                                id: 'pay.payment_intents.delete.' + org,
                                implies: ['pay.payment_intents.create.' + org],
                            },
                        ],
                    };
                }),
            },
            {
                type: 'switch',
                name: 'Aliri sentemajn paginformojn ...',
                options: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        name: '... por ' + name,
                        id: 'pay.payment_intents.sensitive_data.' + org,
                        implies: ['pay.payment_intents.read.' + org],
                    };
                }),
            },
            {
                type: 'group',
                children: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        type: 'switch',
                        name: 'Pagorganizoj por ' + name,
                        options: [
                            {
                                name: 'Redakti',
                                id: 'pay.payment_orgs.update.' + org,
                                implies: ['pay.read.' + org],
                            },
                            {
                                name: 'Krei',
                                id: 'pay.payment_orgs.create.' + org,
                                implies: ['pay.payment_orgs.update.' + org],
                            },
                            {
                                name: 'Forigi',
                                id: 'pay.payment_orgs.delete.' + org,
                                implies: ['pay.payment_orgs.create.' + org],
                            },
                        ],
                    };
                }),
            },
            {
                type: 'group',
                children: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        type: 'switch',
                        name: 'Pagmetodoj por ' + name,
                        options: [
                            {
                                name: 'Redakti',
                                id: 'pay.payment_methods.update.' + org,
                                implies: ['pay.read.' + org],
                            },
                            {
                                name: 'Krei',
                                id: 'pay.payment_methods.create.' + org,
                                implies: ['pay.payment_methods.update.' + org],
                            },
                            {
                                name: 'Forigi',
                                id: 'pay.payment_methods.delete.' + org,
                                implies: ['pay.payment_methods.create.' + org],
                            },
                        ],
                    };
                }),
            },
            {
                type: 'group',
                children: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        type: 'switch',
                        name: 'Aldonebloj por ' + name,
                        options: [
                            {
                                name: 'Redakti',
                                id: 'pay.payment_addons.update.' + org,
                                implies: ['pay.read.' + org],
                            },
                            {
                                name: 'Krei',
                                id: 'pay.payment_addons.create.' + org,
                                implies: ['pay.payment_addons.update.' + org],
                            },
                            {
                                name: 'Forigi',
                                id: 'pay.payment_addons.delete.' + org,
                                implies: ['pay.payment_addons.create.' + org],
                            },
                        ],
                    };
                }),
            },
        ],
    },
    {
        type: 'category',
        name: 'Membreco',
        children: [
            {
                type: 'switch',
                name: 'Agordoj',
                options: [
                    {
                        name: 'Legi',
                        id: 'registration.options.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'registration.options.update',
                        implies: ['registration.options.read'],
                    },
                    {
                        name: 'Forigi',
                        id: 'registration.options.delete',
                        implies: ['registration.options.update'],
                    },
                ],
            },
            {
                type: 'switch',
                name: 'Aliĝintoj',
                requires: ['registration.options.read'],
                options: [
                    {
                        name: 'Legi',
                        id: 'registration.entries.read',
                    },
                    {
                        name: 'Redakti',
                        id: 'registration.entries.update',
                        implies: ['registration.entries.read'],
                    },
                    {
                        name: 'Krei',
                        id: 'registration.entries.create',
                        implies: ['registration.entries.update'],
                    },
                    {
                        name: 'Forigi',
                        id: 'registration.entries.delete',
                        implies: ['registration.entries.create'],
                    },
                ],
            },
        ],
    },
    {
        type: 'category',
        name: 'Kongresoj',
        children: [
            {
                type: 'group',
                children: Object.entries(baseOrgs).map(([org, name]) => {
                    return {
                        type: 'switch',
                        name: 'Kongresoj de ' + name,
                        options: [
                            {
                                name: 'Legi',
                                id: 'congresses.read.' + org,
                            },
                            {
                                name: 'Redakti',
                                id: 'congresses.update.' + org,
                                implies: ['congresses.read.' + org],
                            },
                            {
                                name: 'Krei',
                                id: 'congresses.create.' + org,
                                implies: ['congresses.update.' + org],
                            },
                            {
                                name: 'Forigi',
                                id: 'congresses.delete.' + org,
                                implies: ['congresses.create.' + org],
                            },
                        ],
                    };
                }),
            },
            {
                type: 'group',
                name: 'Kongresaj okazoj',
                children: [
                    ...Object.entries(baseOrgs).map(([org, name]) => {
                        return {
                            type: 'switch',
                            name: 'Kongresaj okazoj de ' + name,
                            options: [
                                {
                                    name: 'Legi',
                                    id: 'congress_instances.read.' + org,
                                },
                                {
                                    name: 'Redakti',
                                    id: 'congress_instances.update.' + org,
                                    implies: ['congress_instances.read.' + org],
                                },
                                {
                                    name: 'Krei',
                                    id: 'congress_instances.create.' + org,
                                    implies: ['congress_instances.update.' + org],
                                },
                                {
                                    name: 'Forigi',
                                    id: 'congress_instances.delete.' + org,
                                    implies: ['congress_instances.create.' + org],
                                },
                            ],
                        };
                    }),
                    {
                        type: 'group',
                        name: 'Kongresaj aliĝintoj',
                        children: Object.entries(baseOrgs).map(([org, name]) => {
                            return {
                                type: 'switch',
                                name: 'Kongresaj aliĝintoj de kongresoj de ' + name,
                                options: [
                                    {
                                        name: 'Legi',
                                        id: 'congress_instances.participants.read.' + org,
                                    },
                                    {
                                        name: 'Redakti',
                                        id: 'congress_instances.participants.update.' + org,
                                        implies: ['congress_instances.participants.read.' + org],
                                    },
                                    {
                                        name: 'Krei',
                                        id: 'congress_instances.participants.create.' + org,
                                        implies: ['congress_instances.participants.update.' + org],
                                    },
                                    {
                                        name: 'Forigi',
                                        id: 'congress_instances.participants.delete.' + org,
                                        implies: ['congress_instances.participants.create.' + org],
                                    },
                                ],
                            };
                        }),
                    },
                ],
            },
        ],
    },
];


/*
{
    type: 'group',
    name: 'Membrecoj',
    requires: ['codeholders.read'],
    children: [
        {
            type: 'perm',
            name: 'fjkdsfda',
            id: 'memberships.read',
            impliesFields: {
                profilePicture: 'r',
            },
        },
    ],
},
 */

export const memberFieldsAll = 'Ĉiuj kampoj';
export const memberFieldsRead = 'Vidi';
export const memberFieldsWrite = 'Redakti';

/// List of member fields. Some member fields may correspond to multiple API fields.
export const memberFields = {
    birthdate: { name: 'Naskiĝtago', fields: ['birthdate'] },
    code: { name: 'Kodo', fields: ['newCode', 'oldCode'] },
    codeholderType: { name: 'Membrospeco', fields: ['codeholderType'] },
    creationTime: { name: 'Horo de kreiĝo', fields: ['creationTime'] },
    feeCountry: { name: 'Paglando', fields: ['feeCountry'] },
    address: { name: 'Adreso', fields: ['address', 'addressLatin', 'searchAddress'] },
    addressCountry: { name: 'Lando', fields: ['address.country', 'addressLatin.country'] },
    addressCountryArea: { name: 'Regiono', fields: ['address.countryArea', 'addressLatin.countryArea'] },
    addressCity: { name: 'Urbo', fields: ['address.city', 'addressLatin.city'] },
    addressCityArea: { name: 'Urboparto', fields: ['address.cityArea', 'addressLatin.cityArea'] },
    addressStreetAddress: { name: 'Stratadreso', fields: ['address.streetAddress', 'addressLatin.streetAddress'] },
    addressPostalCode: { name: 'Poŝtkodo', fields: ['address.postalCode', 'addressLatin.postalCode'] },
    addressSortingCode: { name: 'Ordigkodo', fields: ['address.sortingCode', 'addressLatin.sortingCode'] },
    addressPublicity: { name: 'Publikeco de adreso', fields: ['addressPublicity'] },
    searchAddress: { name: 'Plena, serĉebla adreso', fields: ['searchAddress'] },
    email: { name: 'Retpoŝtadreso', fields: ['email'] },
    emailPublicity: { name: 'Publikeco de retpoŝtadreso', fields: ['emailPublicity'] },
    notes: { name: 'Notoj', fields: ['notes'] },
    enabled: { name: 'Kontoŝalteco', fields: ['enabled'] },
    officePhone: { name: 'Oficeja telefono', fields: ['officePhone', 'officePhoneFormatted'] },
    officePhonePublicity: { name: 'Publikeco de oficeja telefono', fields: ['officePhonePublicity'] },
    isDead: { name: 'Morteco', fields: ['isDead'] },
    deathdate: { name: 'Mortdato', fields: ['deathdate'] },
    profilePicture: { name: 'Profilbildo', fields: ['profilePicture', 'profilePictureHash'] },
    profilePicturePublicity: { name: 'Publikeco de profilbildo', fields: ['profilePicturePublicity'] },
    membership: { name: 'Membreco', fields: ['membership'] },
    isActiveMember: { name: 'Ĉu aktiva membro', fields: ['isActiveMember'] },
    hasPassword: { name: 'Ĉu kreis konton', fields: ['hasPassword'] },
    searchName: { name: 'Plena, serĉebla nomo', fields: ['searchName'] },
    website: { name: 'Retejo', fields: ['website'] },
    biography: { name: 'Biografio', fields: ['biography'] },

    name: { name: 'Nomo', fields: ['firstName', 'firstNameLegal', 'lastName', 'lastNameLegal', 'honorific', 'fullName', 'fullNameLocal', 'careOf', 'nameAbbrev'] },
    honorific: { name: 'Titolo', fields: ['honorific'] },
    firstName: { name: 'Persona nomo', fields: ['firstName'] },
    firstNameLegal: { name: 'Persona nomo jura', fields: ['firstNameLegal'] },
    lastName: { name: 'Familia nomo', fields: ['lastName'] },
    lastNameLegal: { name: 'Familia nomo jura', fields: ['lastNameLegal'] },
    lastNamePublicity: { name: 'Publikeco de familia nomo', fields: ['lastNamePublicity'] },
    fullName: { name: 'Plena nomo de organizo', fields: ['fullName'] },
    fullNameLocal: { name: 'Plena, loka nomo de organizo', fields: ['fullNameLocal'] },
    careOf: { name: 'p/a', fields: ['careOf'] },
    nameAbbrev: { name: 'Organiza mallongigo', fields: ['nameAbbrev'] },

    age: { name: 'Aĝo', fields: ['age', 'agePrimo'] },
    profession: { name: 'Profesio', fields: ['profession'] },
    landlinePhone: { name: 'Hejma telefono', fields: ['landlinePhone', 'landlinePhoneFormatted'] },
    landlinePhonePublicity: { name: 'Publikeco de hejma telefono', fields: ['landlinePhonePublicity'] },
    cellphone: { name: 'Poŝtelefono', fields: ['cellphone', 'cellphoneFormatted'] },
    cellphonePublicity: { name: 'Publikeco de poŝtelefono', fields: ['cellphonePublicity'] },

    files: { name: 'Alkroĉitaj dosieroj', fields: ['files'] },
    logins: { name: 'Historio de ensalutoj', fields: ['logins'] },
    roles: { name: 'Roloj', fields: ['roles'] },
};

/// Builds a map from permission id to node.
/// Also sifts down requirements.
function buildReverseMap (spec, mapping, path = [], reqs = []) {
    if (spec.type === 'category' || spec.type === 'group') {
        reqs = reqs.concat(spec.requires || []);
        for (let i = 0; i < spec.children.length; i++) {
            buildReverseMap(spec.children[i], mapping, path.concat([i]), reqs);
        }
    } else if (spec.type === 'switch') {
        reqs = reqs.concat(spec.requires || []);
        let i = 0;
        for (const opt of spec.options) {
            mapping[opt.id] = { path: path.concat([i++]), type: 'option', node: opt, requires: reqs };
        }
    } else if (spec.type === 'perm') {
        reqs = reqs.concat(spec.requires || []);
        mapping[spec.id] = { path, type: 'perm-node', node: spec, requires: reqs };
    } else if (typeof spec === 'string' || spec.type.startsWith('!')) {
        // nope
    } else {
        throw new Error('unknown spec type ' + spec.type);
    }

    return mapping;
}

export const reverseMap = buildReverseMap({ type: 'category', children: spec }, {});

export const reverseImplicationGraph = new Map();
export const reverseFieldsImplicationGraph = new Map();
export const reverseRequirementGraph = new Map();
for (const perm in reverseMap) {
    const { node, requires } = reverseMap[perm];
    const implied = [];

    if (node.implies) implied.push(...node.implies);
    if (perm.endsWith('.*')) {
        const prefix = perm.substr(0, perm.length - 1);
        for (const p of Object.keys(reverseMap).filter(x => x.startsWith(prefix))) {
            if (p === perm) continue; // don’t imply self
            implied.push(p);
        }
    }

    for (const perm of implied) {
        if (!reverseImplicationGraph.has(perm)) reverseImplicationGraph.set(perm, new Set());
        reverseImplicationGraph.get(perm).add(node.id);
    }

    for (const field in (node.impliesFields || {})) {
        if (!reverseFieldsImplicationGraph.has(field)) reverseFieldsImplicationGraph.set(field, new Map());
        const fieldMap = reverseFieldsImplicationGraph.get(field);

        const flags = node.impliesFields[field].split('');
        for (const flag of flags) {
            if (!fieldMap.has(flag)) fieldMap.set(flag, new Set());
            fieldMap.get(flag).add(node.id);
        }
    }

    for (const perm of requires) {
        if (!reverseRequirementGraph.has(perm)) reverseRequirementGraph.set(perm, new Set());
        reverseRequirementGraph.get(perm).add(node.id);
    }
}
