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
        title: 'Alŝuti kongreson',
        button: 'Alŝuti',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi kongreson',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la kongreson? Ne eblas malfari tiun ĉi agon.',
    },
    misc: {
        llLat: '[[Lat]]',
        llLon: '[[Lon]]',
    },
};

export const congressInstances = {
    detailTitle: 'Kongresa okazigo',
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

        locationPrefix: '[[in]]',
    },
    tabs: {
        locations: 'Lokoj',
        programs: 'Programeroj',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei okazigon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti okazigon',
        button: 'Alŝuti',
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
            name: '[[name]]',
            description: '[[desc]]',
        },
    },
    fields: {
        name: 'Nomo',
        type: '[[type]]',
        description: '[[description]]',
        address: '[[address]]',
        ll: '[[ll]]',
        rating: '[[rating]]',
        icon: '[[icon]]',
        externalLoc: '[[externalLoc]]',

        ratingInfixOf: '[[of]]',
        ratingInvalid: '[[invalid]]',
        nameRequired: 'Necesas nomo',

        location: '[[location]]',

        types: {
            external: '[[external]]',
            internal: '[[internal]]',
        },
    },
    locatedWithinExternalLoc: '[[located within]]', // prefix
    locatedWithinNowhere: '[[nowhere]]', // if externalLoc is null
    locationPicker: {
        pick: 'Elekti lokon',
        search: 'Serĉi…',
    },
    iconPicker: {
        empty: '[[no icon]]',
        pick: '[[Pick icon]]',
        labels: {
            GENERIC: '[[generic]]',
            STAR: '[[star]]',
            BUS: '[[bus]]',
            TRAIN: '[[train]]',
            AIRPORT: '[[airport]]',
            TAXI: '[[taxi]]',
            METRO: '[[metro]]',
            TRAM: '[[tram]]',
            FERRY: '[[ferry]]',
            BIKE_RENTAL: '[[bike_rental]]',
            PARKING: '[[parking]]',
            GAS_STATION: '[[gas_station]]',
            ATM: '[[atm]]',
            HOSPITAL: '[[hospital]]',
            PHARMACY: '[[pharmacy]]',
            PRINT_SHOP: '[[print_shop]]',
            MALL: '[[mall]]',
            LAUNDRY_SERVICE: '[[laundry_service]]',
            POST_OFFICE: '[[post_office]]',
            TOURIST_INFORMATION: '[[tourist_information]]',
            POLICE: '[[police]]',
            RESTAURANT: '[[restaurant]]',
            FAST_FOOD: '[[fast_food]]',
            CAFE: '[[cafe]]',
            BAR: '[[bar]]',
            GROCERY_STORE: '[[grocery_store]]',
            CONVENIENCE_STORE: '[[convenience_store]]',
            STORE: '[[store]]',
            MUSEUM: '[[museum]]',
            MOVIE_THEATER: '[[movie_theater]]',
            THEATER: '[[theater]]',
            CULTURAL_CENTER: '[[cultural_center]]',
            LIBRARY: '[[library]]',
            POINT_OF_INTEREST: '[[point_of_interest]]',
            HOTEL: '[[hotel]]',
            HOSTEL: '[[hostel]]',
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
        button: 'Alŝuti',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi lokon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la lokon? Ne eblas malfari tiun ĉi agon.',
    },
};

export const congressPrograms = {
    detailTitle: 'Kongresa programero',
    search: {
        placeholders: {
            title: '[[title]]',
            description: '[[desc]]',
        },
    },
    fields: {
        title: '[[title]]',
        description: '[[description]]',
        owner: '[[owner]]',
        timeFrom: '[[timeFrom]]',
        timeTo: '[[timeTo]]',
        location: '[[location]]',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei programeron',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti programeron',
        button: 'Alŝuti',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi programeron',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la programeron? Ne eblas malfari tiun ĉi agon.',
    },
};

