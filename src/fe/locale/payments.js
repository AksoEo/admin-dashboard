export const currencies = {
    USD: 'Usonaj Dolaroj (USD)',
    AUD: 'Aŭstraliaj Dolaroj (AUD)',
    CAD: 'Kanadaj Dolaroj (CAD)',
    CHF: 'Svisaj Frankoj (CHF)',
    DKK: 'Danaj Kronoj (DKK)',
    EUR: 'Eŭroj (EUR)',
    GBP: 'Britaj Pundoj (GBP)',
    HKD: 'Honkonga Dolaro (HKD)',
    JPY: 'Japana Eno (JPY)',
    MXN: 'Meksika Peso (MXN)',
    MYR: 'Malajzia Ringito (MYR)',
    NOK: 'Norvega Krono (NOK)',
    NZD: 'Nov-Zelanda Dolaro (NZD)',
    PLN: 'Polaj Zlotoj (PLN)',
    SEK: 'Svedaj Kronoj (SEK)',
    SGD: 'Singapuraj Dolaroj (SGD)',
};

export const paymentOrgs = {
    title: 'Pagorganizoj',
    detailTitle: 'Pagorganizo',
    fields: {
        org: 'Organizo',
        name: 'Nomo',
        description: 'Priskribo',
    },
    detailTabs: {
        org: 'Pri la pagorganizo',
        addons: 'Aldonebloj',
        methods: 'Pagmetodoj',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei pagorganizon',
        button: 'Krei',
        orgs: {
            tejo: 'TEJO',
            uea: 'UEA',
        },
    },
    createAddon: 'Krei aldoneblon',
    createMethod: 'Krei pagmetodon',
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi pagorganizon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi pagorganizon?',
        button: 'Forigi',
    },
};
export const paymentAddons = {
    detailTitle: 'Aldonebloj',
    fields: {
        name: 'Nomo',
        description: 'Priskribo',
    },
    create: {
        title: 'Krei aldoneblon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi aldoneblon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi aldoneblon?',
        button: 'Forigi',
    },
};
export const paymentMethods = {
    detailTitle: 'Pagmetodo',
    fields: {
        type: 'Pagmaniero',
        stripeMethods: 'Stripe-metodoj',
        name: 'Nomo',
        internalDescription: 'Internaj notoj',
        description: 'Publika priskribo',
        currencies: 'Valutoj',
        paymentValidity: 'Valideco de neplenumitaj pagoj',
        isRecommended: 'Rekomendita',
        stripeSecretKey: 'Sekreta ŝlosilo de Stripe',
        stripePublishableKey: 'Publika ŝlosilo de Stripe',
        fee: 'Kotizo',
        feeFixed: 'Fiksa kotizo',
        feePercent: 'Elcenta kotizo',
        fees: {
            fixed: 'Fiksa kotizo',
            percent: 'Elcenta kotizo',
            description: 'La fiksaj kaj elcentaj kotizoj estos kunaldonitaj',
        },

        types: {
            manual: 'Permana',
            stripe: 'Stripe™',
        },
        stripeMethodValues: {
            card: 'Karto',
        },
        noCurrenciesSelected: 'Neniu valuto estis elektita',
        paymentValidityTypes: {
            limited: 'Validas dum ...',
            forever: 'Neniam ekvalidiĝas',
        },
    },
    create: {
        title: 'Krei pagmetodon',
        button: 'Krei',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
        nameRequired: 'Necesas nomo',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi pagmetodon',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi pagmetodon?',
        button: 'Forigi',
    },
    methodPicker: {
        title: 'Elekti pagmetodon',
        orgsEmpty: 'Ekzistas neniu pagorganizo',
        empty: 'Tiu ĉi pagorganizo ne enhavas ajnan permanan pagmetodon',
    },
};
export const paymentIntents = {
    openInStripePrefix: 'Malfermi ĉe',
    stripeIntentLink: id => `https://dashboard.stripe.com/test/payments/${id}`,

    title: 'Pagoj',
    detailTitle: 'Pago',
    filters: {
        customerName: 'Nomo de Kliento',
        customerEmail: 'Retpoŝtadreso de Kliento',
        paymentOrg: 'Pagorganizo',
        paymentMethod: 'Pagmetodo',
        org: 'AKSO-Organizo',
        currencies: 'Valutoj',
        status: 'Stato',
        purposeTrigger: 'Enhavas AKSO-agon',
        purposeDataId: 'Aktivigas aliĝidentigilon',

        orgs: {
            tejo: 'TEJO',
            uea: 'UEA',
            '': 'ne gravas',
        },
        statuses: {
            '': 'ne gravas',
            pending: 'ankoraŭ ne plenumita',
            processing: 'traktata de sistemo',
            submitted: 'pago sendita de kliento',
            canceled: 'nuligita',
            succeeded: 'fintraktita',
            abandoned: 'eksvalidiĝis',
            disputed: 'disputita',
            refunded: 'mono redonita',
        },
        purposeTriggerNone: 'ne gravas',
    },
    fields: {
        customer: 'Kliento',
        customerName: 'Nomo',
        customerEmail: 'Retpoŝtadreso',
        method: 'Pagmetodo',
        org: 'Organizo',
        currency: 'Valuto',
        status: 'Stato',
        events: 'Okazintaĵoj',
        timeCreated: 'Kreiĝhoro',
        statusTime: 'Horo de lasta okazintaĵo',
        internalNotes: 'Internaj notoj',
        customerNotes: 'Notoj de la kliento',
        foreignId: 'Eksterna identigilo',
        stripePaymentIntentId: 'Identigilo ĉe Stripe (PaymentIntent ID)',
        stripeClientSecret: 'Sekreta klientŝlosilo ĉe Stripe (Client Secret)',
        purposes: 'Pagceloj',
        totalAmount: 'Sumo',
        amountRefunded: 'Sumo redonita',

        statuses: {
            created: 'Kreita', // not a real status; used in event log
            pending: 'Ankoraŭ ne plenumita',
            processing: 'Traktata de sistemo',
            submitted: 'Pago sendita de kliento',
            canceled: 'Nuligita',
            succeeded: 'Fintraktita',
            abandoned: 'Eksvalidiĝis',
            disputed: 'Disputita',
            refunded: 'Mono redonita',
            willBeAbandoned: 'Eksvalidiĝos', // used to indicate future abandonment
        },
        purposeTypes: {
            trigger: 'AKSO-ago',
            manual: 'Permana',
            addon: 'Donaco',
        },
        purpose: {
            triggerAmount: '[[Trigger amount]]',
            triggerStatuses: {
                awaiting: '[[Awaiting payment]]',
                processing: '[[Processing trigger]]',
                triggered: '[[Triggered]]',
            },
        },
    },
    detailTo: 'al', // X currency >to< org
    detailViewCodeholder: 'Montri membron',
    detailNoCodeholder: 'Neniu ligita membro',
    detailRefundSuffix: 'redonita', // goes after the refunded amount
    detailViewMethod: 'Montri pagmetodon',
    actions: {
        cancel: {
            title: 'Nuligi',
            description: 'Ĉu vi certas, ke vi volas nuligi tiun ĉi pagon?',
            button: 'Nuligi',
        },
        markDisputed: {
            title: 'Krei disputon',
            description: 'Ĉu vi certas, ke vi volas krei disputon pri tiu ĉi pago? Bv. aldoni detalojn pri la disputo en la internaj notoj.',
            button: 'Krei disputon',

            stripeTitle: 'Tio ĉi eblas nur en la retejo de Stripe',
            stripeDescription: 'Nur eblas krei disputojn en la retejo de Stripe. AKSO aŭtomate ĝisdatiĝas surbaze de la informoj de Stripe.',
            stripeButton: 'Iri al Stripe',
        },
        markRefunded: {
            title: 'Indiki pagon redonita',
            description: 'Ĉu vi certas, ke vi volas indiki, ke mono estis redonita el tiu ĉi pago? Bv. aldoni detalojn pri la redonita mono en la internaj notoj.',
            amount: 'Redonita monkvanto',
            button: 'Indiki',

            stripeTitle: 'Tio ĉi eblas nur en la retejo de Stripe',
            stripeDescription: 'Redonado de mono nur eblas per la platformo de Stripe. Kiam la mono estas redonita pere de Stripe, AKSO aŭtomate estos ĝidatigita.',
            stripeButton: 'Iri al Stripe',

            // errors
            lowerBound: 'Ne eblas redoni negativan monkvanton',
            upperBound: 'Ne eblas redoni pli ol estis pagita',
        },
        markSucceeded: {
            title: 'Indiki pagon ricevita',
            description: 'Ĉu vi certas, ke la mono estis ricevita? Bv. aldoni la eksteran identigilon de la pago se eblas.',
            button: 'Indiki',
        },
        submit: {
            title: 'Indiki monon sendita',
            description: 'Ĉu vi certas, ke la mono estis sendita (eĉ se ankoraŭ ne ricevita)?',
            button: 'Indiki',
        },
    },
    transitionUnavailabilityReasons: {
        stripe: 'Ne eblas fari tion ĉi por pagoj faritaj per Stripe.', // fallback

        // current state -> new state
        // the following table is for MANUAL methods. If something is allowed in manual but not
        // in stripe, the stripe fallback above will be shown
        pending: {
            submitted: '', // allowed
            canceled: '', // allowed
            succeeded: 'Ne eblas indiki, ke pago estis ricevita antaŭ ol ĝi estis sendita.',
            disputed: 'Ne eblas krei disputon pri pago, kiu ankoraŭ ne estis sendita.',
            refunded: '', // allowed
        },
        processing: 'Bonvolu atendi, la pago estas nuntempe traktata de la sistemo.',
        submitted: {
            submitted: 'La pago estis jam indikita kiel sendita.',
            canceled: '', // allowed
            succeeded: '', // allowed
            disputed: '', // allowed
            refunded: '', // allowed
        },
        canceled: {
            submitted: 'La pago estis nuligita; tial ne eblas indiki, ke la pago estis sendita. Se mono tamen estis sendita post nuligo, la mono estu resendita.',
            canceled: 'La pago estis jam nuligita.',
            succeeded: 'La pago estis nuligita; tial ne eblas indiki, ke la pago estis sukcese ricevita. Se mono tamen estis sendita post nuligo, la mono estu resendita.',
            disputed: 'La pago estis nuligita; tial ne eblas krei disputon.',
            refunded: 'La pago estis nuligita; tial ne eblas repagi ĝin.',
        },
        abandoned: 'La pago eksvalidiĝis; tial ne eblas agi pri ĝi.',
        succeeded: {
            submitted: 'La pago estis sukcesa; ne necesas indiki ke la mono estis sendita.',
            canceled: 'La pago estis sukcesa; ne eblas nun nuligi ĝin. Eblas redoni la monon aŭ krei disputon.',
            succeeded: 'La pago jam estis indikita kiel sukcesa.',
            disputed: '', // allowed
        },
        disputed: {
            submitted: 'La pago jam havas disputon; kaj do jam estas indikita, ke la pago estis ricevita. Se vi volas fini la disputon, elektu inter sukcesa kaj redonita.',
            canceled: '', // allowed
            succeeded: '', // allowed
            disputed: 'Tiu ĉi pago jam estas disputata.',
            refunded: '', // allowed
        },
        refunded: {
            submitted: 'La pago estis redonita; kaj do ne plu eblas indiki sendadon de la mono.',
            canceled: 'La pago estis redonita; kaj do ne eblas nun ĝin nuligi.',
            succeeded: 'La pago estis redonita; kaj do ne plu eblas indiki sukcesan ricevon de la mono.',
            disputed: 'La pago estis redonita; kaj do ne plu eblas krei disputon.',
            refunded: '', // allowed
        },
    },
    search: {
        fields: {
            customerEmail: 'Retpoŝtadreso de la kliento',
            customerName: 'Nomo de la kliento',
            internalNotes: 'Internaj notoj',
            customerNotes: 'Notoj de la kliento',
        },
        placeholders: {
            customerEmail: 'ekz. zamenhof@akso.org',
            customerName: 'ekz. Zamenhof',
            internalNotes: 'Traserĉi internajn notojn',
            customerNotes: 'Traserĉi notojn de klientoj',
        },
    },
    purposesPicker: {
        addTitle: 'Aldoni celon de la pago',
        selectMethodFirst: 'Unue necesas elekti pagmetodon',
        selectCurrencyFirst: 'Unue necesas elekti valuton',
        addPurposeButton: 'Aldoni pagcelon',
        useOriginalAmount: '[[Amount is discounted]]',
        originalAmount: 'Nerabatita prezo',
        useTriggerAmount: '[[Different trigger amount]]',
        types: {
            manual: 'Permana',
            addon: 'Aldoneblo',
            trigger: 'AKSO-ago',
        },
        manual: {
            title: 'Titolo',
            description: 'Priskribo',
        },
        noAddons: 'Tiu ĉi pagorganizo havas neniujn aldoneblojn',
        dataId: 'Aliĝidentigilo',
        invalidDataId: 'Nevalida aliĝidentigilo',
    },
    triggers: {
        congress_registration: 'Kongresa aliĝo',
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei pagon',
        button: 'Krei',

        noCurrencySelected: 'Neniu valuto estis elektita',
        paymentMethod: 'Pagmetodo',
        purposes: 'Pagceloj',
        total: 'Sumo',
        totalNote: 'La sumo estas supozo, la ver valoro estos la ekvivalento de minimume 1 USD/maksimume 500.000 USD',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Ĝisdatigi',
        button: 'Konservi',
    },

    report: {
        title: 'Raporto',

        startTime: 'Komenciĝhoro',
        endTime: 'Finiĝhoro',

        total: 'Sume',
        totalEarned: 'enspezita', // suffix
        totalRefunded: 'redonita', // suffix

        byCurrency: 'Laŭ valuto',

        paymentOrg: 'Pagorganizo',
        paymentMethod: 'Pagmetodo',
        paymentAddon: 'Aldoneblo',

        currencyHeader: 'Valuto', // table header
        totalHeader: 'Sume', // table header

        addonsNote: 'Ne eblas ŝpuri redonojn de aldonebloj; tial nevalidigitaj aldonebloj ne estas inkluzivitaj.',

        totals: {
            // prefixes
            earned: 'Enspezis',
            refunded: 'Redonis',
            // suffixes
            count: n => `${n} pago${n === 1 ? '' : 'j'}n`,
            refunds: n => `${n} redono${n === 1 ? '' : 'j'}n`,
        },

        print: 'Presi',
        failedToOpenPrintWindow: 'Ne sukcesis malfermi la presilan fenestron',
    },
};

