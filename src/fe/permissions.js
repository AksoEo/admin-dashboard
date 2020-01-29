/// Global permissions config
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
            },



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
        ],
    },
];

export const memberFieldsAll = 'Ĉiuj kampoj';
export const memberFieldsRead = 'Vidi';
export const memberFieldsWrite = 'Redakti';

export const memberFields = {
    birthdate: { name: 'Naskiĝtago', fields: ['birthdate'] },
    code: { name: 'Kodo', fields: ['newCode', 'oldCode'] },
    profilePicture: { name: 'Profilbildo', fields: ['profilePicture', 'profilePictureHash'] },
};

function buildReverseMap (spec, mapping, path = []) {
    if (spec.type === 'category' || spec.type === 'group') {
        for (let i = 0; i < spec.children.length; i++) {
            buildReverseMap(spec.children[i], mapping, path.concat([i]));
        }
    } else if (spec.type === 'switch') {
        for (const opt of spec.options) {
            mapping[opt.id] = { path, type: 'option', node: opt };
        }
    } else if (spec.type === 'perm') {
        mapping[spec.id] = { path, type: 'perm-node', node: spec };
    } else if (typeof spec === 'string') {
        // nope
    } else {
        throw new Error('unknown spec type ' + spec.type);
    }

    return mapping;
}

export const reverseMap = buildReverseMap({ type: 'category', children: spec }, {});
