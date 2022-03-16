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
    createdBy: '[[Created by]]',
    entries: {
        title: '[[Entries]]',
        edit: {
            title: '[[Edit entry]]',
            confirm: '[[Save]]',
        },
        add: {
            button: '[[Add entry]]',
        },
        autoInternalNotes: (year, number) => `[[Part of report A${number}/${year}]]`,
        purposeTitle: 'Registration',
    },
    addons: {
        title: '[[Addons]]',
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
        title: '[[Expenses]]',
        item: {
            title: '[[Title]]',
        },
        add: {
            button: '[[Add expense]]',
        },
    },
    totals: {
        sum: '',
        final: '[[Total]]',
    },
    create: {
        reset: '[[Clear all inputs]]',
        title: '[[Create Report]]',
        setup: {
            method: '[[Payment method]]',
            country: '[[Country]]',
            year: '[[Year]]',
        },
        submit: {
            button: '[[Submit]]',
            description: '[[Submit this report? This will take a little moment. If your connection dies in the middle of it we will have a horrible incomplete state situation and I am going to make no attempt to fix it.]]',
            commit: '[[Submit]]',
            cancel: '[[Cancel]]',

            entries: '[[Submitting entries]]',
            intent: '[[Submitting report]]',
        },
    },
};
