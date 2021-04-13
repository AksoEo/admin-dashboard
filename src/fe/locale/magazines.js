export const magazines = {
    title: 'Revuoj',
    detailTitle: 'Revuo',
    search: {
        fields: {
            name: 'Nomo',
            description: 'Priskribo',
        },
        placeholders: {
            name: 'Serĉi nomon',
            description: 'Serĉi priskribon',
        },
    },
    fields: {
        org: 'Organizo',
        name: 'Nomo',
        description: 'Priskribo',
    },
    create: {
        title: 'Krei revuo',
        button: 'Krei',
        menuItem: 'Krei revuo',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti revuon',
        button: 'Aktualigi',

        nameRequired: 'Necesas nomon',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi revuon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la revuon? Ne eblas malfari tiun ĉi agon.',
    },
};

export const magazineEditions = {
    detailTitle: '[[Edition]]',
    search: {
        fields: {
            idHuman: 'Homa ID',
            description: 'Priskribo',
        },
        placeholders: {
            idHuman: 'Serĉi homan ID-on',
            description: 'Serĉi priskribon',
        },
    },
    fields: {
        id: 'ID',
        idHuman: 'Homa ID',
        date: 'Dato',
        description: 'Priskribo',
    },
    create: {
        title: '[[Create edition]]',
        button: 'Krei',
        menuItem: '[[Create edition]]',
    },
    update: {
        menuItem: 'Redakti',
        title: '[[Edit edition]]',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: '[[Delete edition]]',
        button: 'Forigi',
        description: '[[copy paste warning text]]',
    },
    files: {
        update: {
            title: 'Alŝuti dosieron',
            button: 'Alŝuti',
        },
        delete: {
            title: 'Forigi dosieron',
            description: 'Ĉu vi certas, ke vi volas forigi la dosieron? Ne eblas malfari tiun ĉi agon.',
            button: 'Forigi',
        },
        upload: 'Alŝuti',
        download: 'Elŝuti',
        downloads: n => `[[${n} downloads]]`,
    },
};

export const magazineToc = {
    title: 'Enhavo',
    detailTitle: '[[Toc entry]]',
    search: {
        fields: {
            title: 'Titolo',
            author: '[[Author]]',
            recitationAuthor: '[[RecitationAuthor]]',
            text: 'Teksto',
        },
        placeholders: {
            idHuman: 'Serĉi homan ID-on',
            description: 'Serĉi priskribon',
            title: 'Serĉi titolon',
            author: '[[search author]]',
            recitationAuthor: '[[search recitationAuthor]]',
            text: '[[search text]]',
        },
    },
    fields: {
        page: '[[Page]]',
        title: 'Titolo',
        author: '[[Author]]',
        recitationAuthor: '[[RecitationAuthor]]',
        text: 'Teksto',
        highlighted: '[[Highlighted]]',
    },
    create: {
        title: '[[Create toc entry]]',
        button: 'Krei',
        menuItem: '[[Create toc entry]]',
    },
    update: {
        menuItem: 'Redakti',
        title: '[[Edit toc entry]]',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: '[[Delete toc entry]]',
        button: 'Forigi',
        description: '[[copy paste warning text]]',
    },
    recitations: {
        update: {
            title: 'Alŝuti voĉlegon',
            button: 'Alŝuti',
        },
        delete: {
            title: 'Forigi voĉlegon',
            description: 'Ĉu vi certas, ke vi volas forigi la voĉlegon? Ne eblas malfari tiun ĉi agon.',
            button: 'Forigi',
        },
    },
};
