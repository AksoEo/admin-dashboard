export const notifTemplates = {
    title: 'Amasmesaĝoj',
    detailTitle: 'Amasmesaĝo',
    search: {
        placeholders: {
            name: 'Serĉi nomon',
            description: 'Serĉi priskribon',
            subject: 'Serĉi temlinion',
        },
    },
    fields: {
        base: 'Bazo',
        org: 'Organizo',
        name: 'Nomo',
        description: 'Priskribo',
        intent: 'Celo',
        subject: 'Temlinio',
        script: 'Skripto',
        from: 'Sendanto',
        fromName: 'Nomo de sendanto',
        replyTo: 'Respondu al-adreso',
        html: 'HTML',
        text: 'Teksto',
        modules: 'Moduloj',

        replyToPlaceholder: 'Uzas la sendoadreson',
    },
    bases: {
        raw: 'Kruda',
        inherit: 'Modula',
    },
    raw: {
        noHtmlVersion: 'Mankas HTML-mesaĝo',
        noTextVersion: 'Mankas teksta mesaĝo',
        unknownVar: v => `Nekonata variablo “${v}”`,

        defaultHtml: '<p>Anstataŭigu min je la mesaĝo</p>',
        defaultText: 'Anstataŭigu min je la mesaĝo',
    },
    modules: {
        textButton: 'Butono',
        textButtonHref: 'Ligilo',
        textButtonLabel: 'Etikedo',
        imageUrl: 'Retadreso',
        imageAlt: 'Priskribo de bildo',
    },
    intents: {
        codeholder: 'membro',
        newsletter: 'bulteno',
    },
    sendIntent: 'Sendi mesaĝon',
    preview: {
        title: 'Antaŭvido de mesaĝo',
        button: 'Antaŭvidi',
        tabs: {
            html: 'HTML',
            text: 'Teksto',
        },
        htmlNavigationPrompt: href => `Vi alklakis ligilon al ${href} en la antaŭvido. Ĉu vi ŝatus malfermi ĝin en nova langeto?`,
        htmlNavigationCancel: 'Nuligi',
        htmlNavigationConfirm: 'Malfermi',
    },

    templating: {
        insertTitle: 'Enmeti ŝablonaĵon',
    },

    create: {
        title: 'Krei ŝablonon',
        button: 'Krei',
    },
    duplicate: {
        title: 'Krei kopion de ŝablono',
        menuItem: 'Krei kopion',
        description: 'Ĉu vi certas, ke vi volas krei kopion de la ŝablono?',
        button: 'Krei kopion',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti ŝablonon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi ŝablonon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi ŝablonon?',
        button: 'Forigi',
    },

    sendCodeholder: {
        title: 'Sendi amasmesaĝon', // should be short
        description: 'Por sendi amasmesaĝon al membroj, unue elektu la ricevontojn per filtrilo. Poste elektu “Sendi amasmesaĝon” en la menuo en la supra, dekstra angulo.',
        ok: 'Bone',
    },
};

export const notifTemplateIntentExamples = {
    codeholder: {
        id: 1,
        name: 'Ludoviko Zamenhof',
        oldCode: 'zmld-w',
        newCode: 'zamlud',
        codeholderType: 'human',
        hasPassword: true,
        addressFormatted: 'Esperantostrato 42\n2020 Bjalistoko\nPOLLANDO',
        addressLatin: {
            country: 'pl',
            countryArea: null,
            city: 'Bjalistoko',
            cityArea: null,
            streetAddress: 'Esperantostrato 42',
            postalCode: '2020',
            sortingCode: null,
        },
        feeCountry: 'pl',
        email: 'zamenhof@example.org',
        birthdate: '1859-12-15', // this is not 1970 so it's not unix 0
        age: 57,
        agePrimo: 56,
        cellphone: null,
        officePhone: null,
        landlinePhone: null,
    },
};
