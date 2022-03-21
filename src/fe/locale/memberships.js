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
        always: 'Ĉiam uzebla',
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
    detailTitle: 'Agordoj',
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
            magazine: 'Revua abono',
        },
        add: {
            title: 'Aldoni oferton',
            membershipsNote: '',
            categoriesEmpty: 'Restas neniu membrokategorio en tiu ĉi jaro, kiun vi ne jam aldonis.',
            magazinesEmpty: 'Restas neniu simpla abono revua, kiun vi ne jam aldonis.',
            addonsEmpty: 'Restas neniu aldoneblo, kiun vi ne jam aldonis.',
        },
        price: {
            title: 'Prezo',
            remove: 'Forigi',
            description: 'Priskribo de prezkalkulo',
            varLabel: 'Variablo de prezo',
            na: 'La oferto ne estas elektebla pro manko de prezo',
        },
        paperVersion: 'Papera versio',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei agordojn',
        button: 'Krei',
        year: 'Jaro',
    },
    duplicate: {
        title: 'Krei kopion',
        menuItem: 'Krei kopion',
        button: 'Krei',
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
    search: {
        placeholders: {
            internalNotes: 'Serĉi en notoj',
        },
        fields: {
            internalNotes: 'Internaj notoj',
        },
    },
    filters: {
        year: 'Jaro',
        status: 'Stato',
        statusTypeAny: 'ne gravas',
        codeholder: 'UEA-kodoj',
    },
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

        yearSelectYear: 'Elekti jaron',
        yearSearchYear: 'Serĉi jaron',
        yearSelectEmpty: 'Ankoraŭ neniu aliĝilo estis kreita',
        fishyIsOkay: 'Strangaj datumoj enordas',

        statusTypes: {
            submitted: 'Ricevita',
            pending: 'Havas problemon',
            processing: 'Traktata',
            canceled: 'Nuligita',
            succeeded: 'Sukcese traktita',
        },
        codeholderDataTypes: {
            id: 'Ekzistanta',
            object: 'Nova',
        },
    },
    titlePrefix: 'Aliĝo por la jaro',
    actions: {
        cancel: 'Nuligi',
    },
    offers: {
        selectYearFirst: 'Bonvolu unue elekti membron kaj jaron',
        selectMemberFirst: 'Bonvolu unue elekti membron',
        currency: 'Valuto',
        add: {
            button: 'Aldoni oferton',
            title: 'Aldoni oferton',
            emptyGroup: 'Estas neniuj ofertoj en tiu ĉi grupo',
        },
        types: {
            addon: 'Aldoneblo',
            membership: 'Membrokategorio',
            magazine: 'Revua abono',
            memberships: 'Membrokategorioj',
            magazines: 'Revuaj abonoj',
        },
        cannotAddAddonNote: 'Ne eblas rekte aldoni aldoneblojn al aliĝoj.',
        availabilityCheck: {
            checking: '[[Checking…]]',
            duplicateConflict: '[[Unavailable because this item has already been registered.]]',
            givesMembershipConflict: '[[Unavailable because the member already has membership for this year.]]',
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
            // a leading space or punctuation if neccessary
            'codeholderData.email': ': Retpoŝtadreso',
            'codeholderData.addressAndName': ': Nomo kaj retpoŝtadreso',
            'codeholderData.addressAndFeeCountries': ': Malsamaj loĝlando kaj paglando',
        },
        fishyMarkedOkay: 'Strangaj datumoj enordas',
        markFishyOkay: 'Indiki ke strangaj datumoj enordas',
        markFishyNotOkay: 'Malindiki ke strangaj datumoj enordas',
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
    cancel: {
        title: 'Nuligi aliĝon',
        button: 'Nuligi',
        description: 'Ĉu vi certas, ke vi volas nuligi la aliĝon? Ne eblas malfari tiun ĉi agon.',
    },
};
