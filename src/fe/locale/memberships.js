export const memberships = {
    title: 'Membreco',
    pages: {
        categories: 'Membrecoj',
        options: 'Agordoj',
    },
};

export const membershipCategories = {
    title: 'Membrokategorioj',
    detailTitle: 'Membrokategorio',
    fields: {
        name: 'Nomo',
        nameAbbrev: 'Mallongigo',
        description: 'Priskribo',
        givesMembership: 'Membrecdona',
        lifetime: 'Dumviva',
        availableFrom: 'Uzebla ekde',
        availableTo: 'Uzebla ĝis',
    },
    availability: {
        always: '[[Always available]]',
        label: 'Uzebla:',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei membrecon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti membrecon',
        button: 'Aktualigi',

        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi membrecon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la membrecon? Ne eblas malfari tiun ĉi agon.',
    },
    csvFilename: 'membrecoj',
};

export const membershipOptions = {
    title: 'Agordoj',
    fields: {
        year: 'Jaro',
        enabled: 'Ŝaltita',
        paymentOrg: 'Pagorganizo',
        currency: 'Valuto',
        offers: 'Ofertoj',
    },
    paymentOrg: {
        pick: 'Elekti pagorganizon',
        pickEmpty: 'Estas neniuj pagorganizoj',
        pickNote: 'Bv. noti, ke se vi ŝanĝas pagorganizon, ĉiuj ekzistantaj aldonebloj ne plu estos validaj kaj tial estu anstataŭigitaj aŭ forigitaj.',
    },
    offers: {
        group: {
            title: 'Nomo de la grupo',
            description: 'Priskribo',
        },
        types: {
            addon: 'Aldoneblo',
            membership: 'Membrokategorio',
        },
        add: {
            title: 'Aldoni oferton',
            membershipsNote: '',
            categoriesEmpty: 'Restas neniu membrokategorio en tiu ĉi jaro, kiun vi ne jam aldonis.',
            addonsEmpty: 'Restas neniu aldoneblo, kiun vi ne jam aldonis.',
        },
        price: {
            title: 'Prezo',
            remove: 'Forigi',
            description: 'Priskribo de prezkalkulo',
            varLabel: 'Variablo de prezo',
            na: 'La oferto ne estas elektebla pro manko de prezo',
        },
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei agordojn',
        button: 'Krei',
        year: 'Jaro',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti agordojn',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi agordojn',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la agordoj por ĉi tiun jaron? Ne eblas malfari tiun ĉi agon.',
    },
};

export const membershipEntries = {
    title: 'Aliĝoj',
    detailTitle: 'Aliĝo',
    fields: {
        id: 'Aliĝo-identigilo',
        year: 'Jaro',
        status: 'Stato',
        issue: 'Problemo',
        newCodeholderId: 'Asignita UEA-kodo',
        timeSubmitted: 'Horo de aliĝo',
        timeSubmittedTime: 'Horo de lasta ŝanĝo',
        internalNotes: 'Internaj notoj',
        offers: 'Ofertoj',
        codeholderData: 'Membrodatumoj',

        fishyIsOkay: 'Strangaj datumoj enordas',

        statusTypes: {
            submitted: 'Ricevita',
            pending: 'Havas problemon',
            canceled: 'Nuligita',
            succeeded: 'Sukcese traktita',
        },
        codeholderDataTypes: {
            id: 'Ekzistanta',
            object: 'Nova',
        },
    },
    offers: {
        add: {
            title: 'Aldoni oferton',
            emptyGroup: 'Estas neniuj ofertoj en tiu ĉi grupo',
        },
        types: {
            addon: 'Aldoneblo',
            membership: 'Membrokategorio',
        },
    },
    issue: {
        title: 'Problemo pri aliĝo',
        what: {
            duplicate_data: 'Duobla datumo',
            duplicate_offer: 'Jam havata oferto',
            fishy_data: 'Strangaj membrodatumoj',
        },
        where: {
            // this is appended directly after the “what” string and should contain
            // a leading space or puncutation if neccessary
            'codeholderData.email': ': Retpoŝtadreso',
            'codeholderData.addressAndName': ': Nomo kaj retpoŝtadreso',
            'codeholderData.addressAndFeeCountries': ': Malsamaj loĝlando kaj paglando',
        },
        fishyMarkedOkay: 'Strangaj datumoj enordas',
        markFishyOkay: 'Indiki ke strangaj datumoj enordas',
        markFishyNotOkay: '[[Mark not ok]]',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei aliĝon',
        button: 'Krei',
        year: 'Jaro',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti aliĝon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi aliĝon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la aliĝon? Ne eblas malfari tiun ĉi agon.',
    },
};
