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
        filters: {
            org: 'Organizo',
            approvedBy: '[[approvedBy]]',
            subjects: '[[subjects]]',
            cities: '[[cities]]',
            countries: '[[countries]]',
            countryLevels: '[[Country level]]',
            countryLevelsDontCare: 'ne gravas',
            hostingMaxDays: '[[hostingMaxDays]]',
            hostingMaxPersons: '[[hostingMaxPersons]]',
        },
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
        docDelegatesUEA: '[[docDelegatesUEA]]',
        docDelegatesDataProtectionUEA: '[[docDelegatesDataProtectionUEA]]',
        paperAnnualBook: '[[paperAnnualBook]]',

        fieldTime: '[[Accepted on]]',
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
    countrySelectTitle: '[[Select countries]]',
    countryLevelsTitle: '[[Country levels]]',
    countryLevels: [
        '[[main]]',
        '[[vice]]',
    ],
    cityPicker: {
        pick: '[[Select cities]]',
        pickOne: '[[Select city]]',
        search: '[[Search cities by name]]',
        done: 'Bone',

        // TODO: move this out
        fields: {
            nativeLabel: '[[Native label]]',
            eoLabel: '[[Eo label]]',
            subdivision_nativeLabel: '[[subdivision_nativeLabel]]',
            subdivision_eoLabel: '[[subdivision_eoLabel]]',
        },
    },
    buttonLabel: count => count ? `[[${count} Delegation${count === 1 ? '' : 's'}]]` : `[[Delegations]]`,
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
        org: 'Organizo',
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
    picker: {
        pick: '[[Select subjects]]',
        search: '[[Search subjects by name]]',
        done: 'Bone',
    },
};
