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
        title: 'Krei revuon',
        button: 'Krei',
        menuItem: 'Krei revuon',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti revuon',
        button: 'Aktualigi',

        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi revuon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la revuon? Ne eblas malfari tiun ĉi agon.',
    },
};

export const magazineEditions = {
    detailTitle: 'Revua numero',
    search: {
        fields: {
            idHuman: 'Numero',
            description: 'Priskribo',
        },
        placeholders: {
            idHuman: 'Serĉi numeron',
            description: 'Serĉi priskribon',
        },
    },
    fields: {
        idHuman: 'Numero',
        date: 'Dato',
        published: 'Publikigita',
        description: 'Priskribo',
    },
    create: {
        title: 'Krei numeron',
        button: 'Krei',
        menuItem: 'Krei numeron',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti numeron',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi numeron',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi numeron? Ne eblas malfari tiun ĉi agon.',
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
        downloads: n => `${n} elŝuto${n == 1 ? '' : 'j'}`,
    },
};

export const magazineToc = {
    title: 'Enhavo',
    detailTitle: 'Artikolo',
    search: {
        fields: {
            title: 'Titolo',
            author: 'Aŭtoro',
            recitationAuthor: 'Laŭtleginto',
            text: 'Teksto',
        },
        placeholders: {
            idHuman: 'Serĉi numeron',
            description: 'Serĉi priskribon',
            title: 'Serĉi titolon',
            author: 'Serĉi aŭtoron',
            recitationAuthor: 'Serĉi laŭtleginton',
            text: 'Serĉi en teksto',
        },
    },
    fields: {
        page: 'Paĝo',
        title: 'Titolo',
        author: 'Aŭtoro',
        recitationAuthor: 'Laŭtleginto',
        text: 'Teksto',
        highlighted: 'Aparte leginda',
    },
    create: {
        title: 'Aldoni artikolon',
        button: 'Aldoni',
        menuItem: 'Aldoni artikolon',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti artikolon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi artikolon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi artikolon? Ne eblas malfari tiun ĉi agon.',
    },
    recitations: {
        title: 'Voĉlego',
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

export const magazineSubs = {
    title: 'Simplaj abonoj revuaj',
    detailTitle: 'Simpla abono',
    search: {
        placeholders: {
            internalNotes: 'Internaj notoj',
        },
        filters: {
            paperVersion: '[[PaperVersion]]',
            paperVersionTypes: {
                yes: 'jes',
                no: 'ne',
                none: 'ne gravas',
            },
        },
    },
    fields: {
        magazineId: 'Revua identigilo',
        codeholderId: 'Membro',
        year: 'Jaro',
        createdTime: 'Horo de kreiĝo',
        internalNotes: 'Internaj notoj',
        paperVersion: '[[PaperVersion]]',
    },
    create: {
        title: 'Krei simplan abonon revuan',
        button: 'Krei',
        menuItem: 'Krei abonon',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti simplan abonon revuan',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi simplan abonon revuan',
        title: 'Forigi simplan abonon revuan',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi simplan abonon revuan? Ne eblas malfari tiun ĉi agon.',
    },
    buttonLabel: count => count ? `${count} simpla${count === 1 ? '' : 'j'} abono${count === 1 ? '' : 'j'}` : `Simplaj abonoj`,
};
