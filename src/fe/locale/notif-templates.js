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

        addText: 'Aldoni tekston',
        addImage: 'Aldoni bildon',
        addButton: 'Aldoni butonon',
        setOneColumn: 'Unu-kolumnigi',
        setTwoColumns: 'Du-kolumnigi',
    },
    intents: {
        codeholder: 'membro',
        newsletter: 'bulteno',
        newsletter_magazine: 'revua bulteno',
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

    send: {
        title: 'Sendi amasmesaĝon',
        cursedNotice: 'Oraj rezultoj ne ricevos mesaĝon.',
        descriptionCodeholder: 'Mesaĝoj estos senditaj al ĉiuj membroj laŭ via nuna filtrilo.',
        descriptionNewsletter: 'Mesaĝoj estos senditaj al ĉiuj abonantoj de la bulteno.',
        empty: 'Estas neniuj ŝablonoj kun la celo “membro”',
        emptyWithQuery: 'Estas neniuj ŝablonoj kun la celo “membro” kiuj plenumas vian filtrilon',
        deleteOnComplete: 'Forigi la ŝablonon post sendado',
        send: {
            button: 'Al konfirma paŝo',

            title: 'Sendi amasmesaĝon',
            confirm: 'Sendi',

            messagePre: 'Sendas mesaĝon al',
            messagePost: n => `${n} membro${n === 1 ? '' : 'j'}`,
            messagePostIndeterminate: 'membroj',
            messagePostUnknown: '... kalkulas',

            sent: 'Sendis mesaĝojn.',
        },

        intentDescriptions: {
            newsletterMagazine: 'Tiu ĉi amasmesaĝa ŝablono estas por dissendado de bultenoj anoncantaj novan numeron de revuo. Pro tio, vi devas elekti la numeron de tiu revuo kiun ĝi anoncu.',
        },
    },

    templateVars: {
        'codeholder.id': 'Membro.ID',
        'codeholder.name': 'Membro.PlenaNomo',
        'codeholder.oldCode': 'Membro.MalnovaUEAKodo',
        'codeholder.newCode': 'Membro.NovaUEAKodo',
        'codeholder.codeholderType': 'Membro.Speco',
        'codeholder.hasPassword': 'Membro.HavasPasvorton',
        'codeholder.addressFormatted': 'Membro.FormatitaAdreso',
        'codeholder.addressLatin.country': 'Membro.LandoKodo',
        'codeholder.addressLatin.countryArea': 'Membro.LandaRegionoLatina',
        'codeholder.addressLatin.city': 'Membro.UrboLatina',
        'codeholder.addressLatin.cityArea': 'Membro.UrbaRegionoLatina',
        'codeholder.addressLatin.streetAddress': 'Membro.StratadresoLatina',
        'codeholder.addressLatin.postalCode': 'Membro.PoŝtkodoLatina',
        'codeholder.addressLatin.sortingCode': 'Membro.OrdigkodoLatina',
        'codeholder.feeCountry': 'Membro.Paglando',
        'codeholder.email': 'Membro.Retpoŝtadreso',
        'codeholder.birthdate': 'Membro.Naskiĝtago',
        'codeholder.age': 'Membro.Aĝo',
        'codeholder.agePrimo': 'Membro.AĝoJarkomence',
        'codeholder.cellphone': 'Membro.Poŝtelefono',
        'codeholder.officePhone': 'Membro.Oficejtelefono',
        'codeholder.landlinePhone': 'Membro.Hejmtelefono',
        'magazine.id': 'Revuo.ID',
        'magazine.org': 'Revuo.Organizo',
        'magazine.name': 'Revuo.Nomo',
        'magazine.description': 'Revuo.Priskribo',
        'magazine.issn': 'Revuo.ISSN',
        'magazine.magazineURL': 'Revuo.URL',
        'edition.id': 'Revuo.Numero.ID',
        'edition.idHuman': 'Revuo.Numero.IDHomoj',
        'edition.date': 'Revuo.Numero.Dato',
        'edition.thumbnailURL': 'Revuo.Numero.BildoURL',
        'edition.description': 'Revuo.Numero.Priskribo',
        'edition.editionURL': 'Revuo.Numero.URL',
        'toc.md': 'Revuo.Numero.Enhavo.Markdown',
        'toc.text': 'Revuo.Numero.Enhavo.Teksto',
        'toc.html': 'Revuo.Numero.Enhavo.HTML',
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
    magazine: {
        id: 3,
        org: 'uea',
        name: 'Esperanto',
        description: 'Esperanto estas la **ĉefa** revuo de UEA.',
        issn: '00140635',
        magazineURL: 'https://uea.org/revuoj/revuo/3',
    },
    edition: {
        id: 7,
        idHuman: 'julio-aŭgusto',
        date: '2021-07-01',
        thumbnailURL: 'https://uea.org/_/revuo/bildo?m=3&e=7&s=512px',
        description: 'La plej nova numero de la revuo Esperanto enhavas interalie …',
        editionURL: 'https://uea.org/revuoj/revuo/3/numero/7',
    },
    toc: {
        md: 'Enhavo aperos tie ĉi.',
        html: '<p>Enhavo aperos tie ĉi.</p>',
        text: 'Enhavo aperos tie ĉi.',
    },
};
