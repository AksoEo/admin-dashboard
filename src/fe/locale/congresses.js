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
    },
    tabs: {
        locations: 'Lokoj',
        program: 'Programeroj',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei okazigon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Alŝuti okazigon',
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

        llLat: '[[Lat]]',
        llLon: '[[Lon]]',

        types: {
            external: '[[external]]',
            internal: '[[internal]]',
        }
    },
    locatedWithinExternalLoc: '[[located within]]', // prefix
    locatedWithinNowhere: '[[nowhere]]', // if externalLoc is null
    create: {
        menuItem: 'Krei',
        title: 'Krei lokon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Alŝuti lokon',
        button: 'Alŝuti',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi lokon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la lokon? Ne eblas malfari tiun ĉi agon.',
    },
};

