/// Global permissions config
export const spec = [
    {
        type: 'perm',
        name: 'Ĉiuj',
        id: '*',
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
                        name: '[[codeholders.hist.read]]',
                        id: 'codeholders.hist.read',
                    },
                    {
                        type: 'switch',
                        name: '[[codeholders.perms]]',
                        options: [
                            {
                                name: 'Legi',
                                id: 'codeholders.perms.read',
                            },
                            {
                                name: 'Redakti',
                                id: 'codeholders.perms.update',
                                implies: ['codeholders.perms.read'],
                            },
                        ],
                    },
                ],
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
