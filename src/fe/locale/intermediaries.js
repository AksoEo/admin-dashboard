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
    detailTitle: '[[Report]]',
    failedToLoadMethod: '[[Failed to load intermediary settings [the payment method]. Please try again later.]]',
    failedToLoadYear: '[[Failed to load year. Please try again later.]]',
    idFmt: (year, number) => `A${number}/${year}`,
    idCountryInfix: 'por',
    createdBy: '[[Created by]]',
    markSucceeded: '[[Mark payment received]]',
    intentStatuses: {
        pending: 'Ankoraŭ ne plenumita',
        processing: 'Traktata de sistemo',
        submitted: '[[Pago sendita de kliento (some other text probably?)]]',
        canceled: 'Nuligita',
        succeeded: 'Fintraktita',
        abandoned: 'Eksvalidiĝis',
        disputed: 'Disputita',
        refunded: 'Mono redonita',
    },
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
        purposeTitle: '[[Registration]]',
    },
    addons: {
        title: '[[Addons]]',
        edit: {
            title: '[[Edit addon]]',
            confirm: '[[Save]]',
            description: '[[Description]]',
            descriptionPlaceholder: '[[Please type your favorite reason to add this addon]]',
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
        menuItem: '[[Create report]]',
        reset: '[[Reset form]]',
        resetConfirm: '[[Are you sure you want to reset your inputs?]]',
        title: '[[Create Report]]',
        currency: '[[Currency]]',
        setup: {
            method: '[[Payment method]]',
            country: '[[Country]]',
            year: '[[Year]]',
            confirm: '[[Confirm]]',
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
    update: {
        menuItem: '[[Delete & Re-Draft]]',
        title: '[[Delete & Re-Draft]]',
        description: '[[Do you want t cancel this report and re-create it?]]',
        cancel: '[[Cancel]]',
        confirm: '[[Confirm]]',
        errorClose: '[[Close]]',
        steps: {
            intent: '[[Loading report]]',
            method: '[[Checking payment method]]',
            regYear: '[[Checking availability]]',
            entries: '[[Loading entries]]',
            addons: '[[Checking addons]]',
            delEntries: '[[Canceling entries]]',
            delIntent: '[[Canceling intent]]',
            // we will attempt to remove the payment fee item by checking if the last manual purpose
            // has a title matching this regex
            matchPaymentFee: /kotizo pro pagmaniero/i,

            error: 'Eraro',
            yearUnavailable: '[[Registration year unavailable]]',
            unknownPurpose: '[[Intent contains unknown purpose]]',
            entryInvalidStatus: '[[A registration entry has already been processed]]',
        },
    },
};
