export const memberships = {
    title: 'Membreco',
};

export const membershipCategories = {
    title: 'Membrecoj',
    detailTitle: 'Membreco',
    fields: {
        name: 'Nomo',
        nameAbbrev: 'Mallongigo',
        description: 'Priskribo',
        givesMembership: 'Membrecdona',
        lifetime: 'Dumviva',
        availableFrom: 'Uzebla ekde',
        availableTo: 'Uzebla ĝis',
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
        offers: '[[Offers]]',
    },
    paymentOrg: {
        pick: '[[Pick payment org]]',
        pickEmpty: '[[No payment orgs]]',
        pickNote: '[[Note that changing this means that any payment addons will become invalid. You’ll probably want to remove them first]]',
    },
    offers: {
        group: {
            title: '[[Group title]]',
            description: 'Priskribo',
        },
        types: {
            addon: 'Aldoneblo',
            membership: 'Membreco',
        },
        add: {
            title: '[[Add offer]]',
            membershipsNote: '[[Note that memberships that giveMembership can only be added once per offers object]]',
            categoriesEmpty: '[[No membership categories available this year that you havent already added]]',
            addonsEmpty: '[[No payment addons remaining]]',
        },
        price: {
            title: '[[Price]]',
            varLabel: '[[Price variable]]',
            na: '[[No price/not available]]',
        },
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei agordoj',
        button: 'Krei',
        year: 'Jaro',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti agordoj',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi agordoj',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la agordoj por ĉi tiun jaron? Ne eblas malfari tiun ĉi agon.',
    },
};
