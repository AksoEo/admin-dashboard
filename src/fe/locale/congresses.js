export const congresses = {
    title: 'Kongresoj',
    detailTitle: 'Kongreso',
    search: {
        placeholders: {
            name: 'Serĉi kongresan nomon',
            abbrev: 'Serĉi kongresan mallongigon',
        },
    },
    fields: {
        name: 'Nomo',
        abbrev: 'Mallongigo',
        org: 'Organizo',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei kongreson',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti kongreson',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi kongreson',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la kongreson? Ne eblas malfari tiun ĉi agon.',
    },
    misc: {
        llLat: 'Lat.',
        llLon: 'Lon.',
    },
};

export const congressInstances = {
    detailTitle: 'Kongresa okazigo',
    registrationFormLink: '[[Registration form]]',
    search: {
        placeholders: {
            name: 'Serĉi nomon de kongresa okazigo',
            locationName: 'Serĉi nomon de kongresa loko',
            locationNameLocal: 'Serĉi lokan nomon de kongresa loko',
        },
    },
    fields: {
        name: 'Nomo',
        humanId: 'Homa ID',
        dateFrom: 'Komenciĝdato',
        dateTo: 'Finiĝdato',
        locationName: 'Loko',
        locationNameLocal: 'Loka nomo de loko',
        locationCoords: 'Koordinatoj de loko',
        locationAddress: 'Adreso de loko',
        tz: 'Horzono',

        locationPrefix: 'en',
    },
    tabs: {
        locations: 'Lokoj',
        programs: 'Programeroj',
        participants: '[[Participants]]',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei okazigon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti okazigon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi okazigon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la okazigon? Ne eblas malfari tiun ĉi agon.',
    },
};

export const congressLocations = {
    detailTitle: 'Kongresa loko',
    search: {
        placeholders: {
            name: 'Serĉi nomon',
            description: 'Serĉi priskribon',
        },
        filters: {
            type: 'Tipo',
            externalLoc: 'Ekstera loko',
        },
    },
    fields: {
        name: 'Nomo',
        type: 'Tipo',
        description: 'Priskribo',
        address: 'Adreso',
        ll: 'Koordinatoj',
        rating: 'Taksa valoro',
        icon: 'Bildeto',
        externalLoc: 'Ekstera loko',

        ratingInfixOf: 'el',
        ratingInvalid: 'Nevalida taksa valoro',
        nameRequired: 'Necesas nomo',

        location: 'Loko',

        types: {
            external: 'Ekstera loko',
            internal: 'Interna loko',
            none: 'ne gravas',
        },
    },
    locatedWithinExternalLoc: 'situas ene de', // prefix
    locatedWithinNowhere: 'nenie', // if externalLoc is null
    locationPicker: {
        pick: 'Elekti lokon',
        search: 'Serĉi…',
    },
    congressAddress: 'Adreso de la kongreso',
    iconPicker: {
        empty: 'Neniu bildeto',
        pick: 'Elekti bildeton',
        labels: {
            GENERIC: 'Ĝenerala',
            STAR: 'Kongresejo',
            BUS: 'Aŭtobushaltejo',
            TRAIN: 'Trajnstacio',
            AIRPORT: 'Flughaveno',
            TAXI: 'Taksihaltejo',
            METRO: 'Metrostacio',
            TRAM: 'Tramhaltejo',
            FERRY: 'Pramŝipejo',
            BIKE_RENTAL: 'Luejo de bicikloj',
            PARKING: 'Parkejo',
            GAS_STATION: 'Benzinstacio',
            ATM: 'Monaŭtomato',
            HOSPITAL: 'Malsanulejo',
            PHARMACY: 'Apoteko',
            PRINT_SHOP: 'Presvendejo',
            MALL: 'Amasvendejo',
            LAUNDRY_SERVICE: 'Lavejo',
            POST_OFFICE: 'Poŝtoficejo',
            TOURIST_INFORMATION: 'Turisma informejo',
            POLICE: 'Policejo',
            RESTAURANT: 'Restoracio',
            FAST_FOOD: 'Rapidmanĝejo',
            CAFE: 'Kafejo',
            BAR: 'Drinkejo',
            GROCERY_STORE: 'Superbazaro',
            CONVENIENCE_STORE: 'Rapidvendejo',
            STORE: 'Vendejo',
            MUSEUM: 'Muzeo',
            MOVIE_THEATER: 'Kinejo',
            THEATER: 'Teatro',
            CULTURAL_CENTER: 'Kultura centro',
            LIBRARY: 'Biblioteko',
            POINT_OF_INTEREST: 'Vidindaĵo',
            HOTEL: 'Hotelo',
            HOSTEL: 'Hostelo',
        },
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei lokon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti lokon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi lokon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la lokon? Ne eblas malfari tiun ĉi agon.',
    },
    updateThumbnail: {
        title: 'Alŝuti bildon',
        button: 'Alŝuti',
    },
};

export const congressPrograms = {
    detailTitle: 'Kongresa programero',
    search: {
        placeholders: {
            title: 'Programa titolo',
            description: 'Priskribo',
        },
        filters: {
            location: 'Loko',

            timeSlice: 'Tempointervalo',
            timeSliceFrom: 'ekde',
            timeSliceTo: 'ĝis',
        },
    },
    fields: {
        title: 'Titolo',
        description: 'Priskribo',
        owner: 'Respondeculo(j)',
        timeFrom: 'Ekde',
        timeTo: 'Ĝis',
        location: 'Loko',
    },
    timeline: {
        empty: 'Okazas neniuj programeroj en tiu ĉi tago',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei programeron',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti programeron',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi programeron',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la programeron? Ne eblas malfari tiun ĉi agon.',
    },
};

export const congressParticipants = {
    title: 'Aliĝintoj',
    detailTitle: 'Aliĝinto',
    search: {
        placeholders: {
            notes: 'Serĉi notoj',
        },
        filters: {
            approval: '[[Approval]]',
            approvalTypes: {
                true: '[[approved]]',
                false: '[[not approved]]',
                none: 'ne gravas',
            },
            validity: '[[Validity]]',
            validityTypes: {
                true: '[[valid]]',
                false: '[[not valid]]',
                none: 'ne gravas',
            },
            createdTime: '[[Creation Time]]',
            timeRangeStart: '[[Start Time]]',
            timeRangeEnd: '[[End Time]]',
            amountPaid: '[[Amount Paid]]',
            hasPaidMinimum: '[[Has Paid Minimum]]',
            paidMinimumTypes: {
                true: '[[did pay]]',
                false: '[[did not]]',
                none: 'ne gravas',
            },
            data: '[[Data]]',
        },
    },
    fields: {
        dataId: '[[DataId]]',
        codeholderId: 'Membro',
        approved: '[[Approved]]',
        notes: 'Notoj',
        price: '[[Price]]',
        paid: '[[Paid]]', // amountPaid + hasPaidMinimum
        isValid: '[[Valid]]',
        sequenceId: '[[SeqId]]',
        cancelledTime: '[[Cancelled]]',
        createdTime: '[[Created]]',
        editedTime: '[[Last Edited]]',
        data: '[[Data]]',

        statuses: {
            pending: '[[Pending]]',
            canceled: '[[Canceled]]',
            valid: '[[Valid]]',
        },

        codeholderIdViewCodeholder: 'Vidi membron',
        hasPaidMinimumShort: 'min',
        hasPaidMinimumDescription: '[[Participant has paid minimum]]',
    },
    spreadsheet: {
        title: 'Aliĝintoj',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei aliĝinton',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti aliĝinton',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi aliĝinton',
        button: 'Forigi',
        description: '[[Are you sure you don’t want to cancel the registration instead? ]] kaj vi certas, ke vi volas forigi la aliĝinton? Ne eblas malfari tiun ĉi agon.',
    },
    csvFilename: 'alighintoj',
};

export const congressRegistrationForm = {
    title: 'Aliĝilo',
    editingTitle: 'Redakti aliĝilo',
    create: 'Krei',
    noForm: '[[No registration form]]', // when user doesn't have permissions to create
    update: {
        menuItem: 'Redakti',
        title: 'Redakti aliĝilo',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi aliĝilo',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la aliĝilon? Ne eblas malfari tiun ĉi agon.',
    },
};

