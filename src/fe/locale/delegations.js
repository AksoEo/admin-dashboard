export const delegations = {
    title: 'Delegitoj',
    detailTitle: 'Delegitoj',
    search: {
        fields: {
            'hosting.description': '[[hostingdesc]]',
        },
        placeholders: {
            'hosting.description': '[[search descriptions]]',
        },
        filters: {},
    },
    fields: {
        org: 'Organizo',
        codeholderId: 'Membro',
        approvedBy: '[[approvedBy]]',
        approvedTime: '[[approvedTime]]',
        cities: '[[cities]]',
        cityCountries: '[[cityCountries]]',
        countries: '[[countries]]',
        subjects: '[[subjects]]',
        hosting: '[[hosting]]',
        tos: '[[tos]]',
    },
    hosting: {
        maxDays: '[[maxDays]]',
        maxPersons: '[[maxPersons]]',
        description: '[[description]]',
        psProfileURL: '[[psProfileURL]]',
        maxDaysNone: '[[None]]',
        maxPersonsNone: '[[None]]',
        psProfileURLInvalid: '[[This doesn’t look like a PS profile url]]',
    },
    tos: {
        docDataProtectionUEA: '[[docDataProtectionUEA]]',
        docDataProtectionUEATime: '[[docDataProtectionUEATime]]',
        docDelegatesUEA: '[[docDelegatesUEA]]',
        docDelegatesUEATime: '[[docDelegatesUEATime]]',
        docDelegatesDataProtectionUEA: '[[docDelegatesDataProtectionUEA]]',
        docDelegatesDataProtectionUEATime: '[[docDelegatesDataProtectionUEATime]]',
        paperAnnualBook: '[[paperAnnualBook]]',
        paperAnnualBookTime: '[[paperAnnualBookTime]]',
    },
    create: {
        title: 'Krei [[thing]]',
        button: 'Krei',
        menuItem: 'Krei [[thing]]',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti [[thing]]',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi [[thing]]',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la [[thing]]? Ne eblas malfari tiun ĉi agon.',
    },
    countryLevelsTitle: '[[Country levels]]',
    countryLevels: [
        '[[main]]',
        '[[vice]]',
    ],

};

export const delegationSubjects = {
    title: '[[Subjects]]',
    detailTitle: '[[Subject]]',
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
        name: 'Nomo',
        description: 'Priskribo',
    },
    create: {
        title: 'Krei [[subject]]',
        button: 'Krei',
        menuItem: 'Krei [[subject]]',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti [[subject]]',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi [[subject]]',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la [[subject]]? Ne eblas malfari tiun ĉi agon.',
    },
};
