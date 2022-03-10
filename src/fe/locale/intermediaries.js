export const intermediaries = {
    title: 'Perantoj',
    detailTitle: 'Peranto',
    search: {
        placeholders: 'Serĉi paginstrukciojn ...',
    },
    fields: {
        countryCode: 'Lando',
        codeholderId: 'Membro',
        paymentDescription: 'Paginstrukcioj',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei peranton',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti peranton',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi peranton',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la peranton? Ne eblas malfari tiun ĉi agon.',
    },
};

export const intermediaryReports = {
    title: '[[Reports]]',
    failedToLoadMethod: '[[Failed to load intermediary settings [the payment method]. Please try again later.]]',
    failedToLoadYear: '[[Failed to load year. Please try again later.]]',
    idFmt: (year, number) => `A${number}/${year}`,
    idCountryInfix: 'por',
    reset: '[[Clear all inputs]]',
    entries: {
        edit: {
            title: '[[Edit entry]]',
            confirm: '[[Save]]',
        },
        add: {
            button: '[[Add entry]]',
        },
    },
    addons: {
        edit: {
            title: '[[Edit addon]]',
            confirm: '[[Save]]',
        },
        add: {
            button: '[[Add addon]]',
            empty: '[[There are no more addons.]]',
        },
    },
    expenses: {
        item: {
            title: '[[Title]]',
        },
        add: {
            button: '[[Add expense]]',
        },
    },
    create: {
        title: '[[Create Report]]',
    },
};
