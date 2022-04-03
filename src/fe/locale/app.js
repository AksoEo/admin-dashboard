export const app = {
    title: p => p ? `${p} | AKSO-Administranto` : 'AKSO-Administranto',
    logOut: 'Elsaluti',

    // literally any error that causes the UI to fail to render
    genericErrorTitle: 'Eraro',
    genericError: 'Okazis neatendita eraro. Bonvolu poste reprovi. Se tiu ĉi eraro okazadas indus kontakti administranton.',
    genericErrorReload: 'Reŝarĝi la paĝon',
    genericErrorViewDetails: 'Montri teĥnikajn detalojn',

    notFound: 'Ni ne sukcesis trovi tiun ĉi paĝon. Eventaule kontrolu ĉu vi mistajpis adreson.',
    forbidden: 'Vi ne rajtas aliri tiun ĉi paĝon.',
    goHome: 'Hejmen',

    debugPageInfo: 'Se vi ne scias kio estas tio ĉi, ne zorgu kaj alklaku sur \'Hejmo\' en la menuo.',

    dirtyConfirmation: {
        description: 'Estas nekonservitaj ŝanĝoj. Ĉu vi certas ke vi volas forlasi la paĝon kaj perdi la malneton?',
    },
};

export const pages = {
    home: 'Hejmo',
    ch: 'Membroj',
    codeholders: 'Membroj',
    'change-requests': 'Ŝanĝopetoj',
    delegations: 'Delegitoj',
    statistics: 'Statistiko',
    membership: 'Membreco',
    'membership-categories': 'Kategorioj',
    'membership-registration': 'Agordoj',
    'membership-entries': 'Aliĝoj',
    roles: 'Roloj',
    email: 'Amasmesaĝoj',
    magazines: 'Revuoj',
    congresses: 'Kongresoj',
    votes: 'Voĉdonado',
    newsletters: 'Bultenoj',
    payments: 'AKSO-Pago',
    'payment-intents': 'Pagoj',
    'payment-orgs': 'Pagorganizoj',
    intermediaries: 'Perantoj',
    'intermediaries-intermediaries': 'Perantoj',
    'intermediaries-reports': 'Spezfolioj',
    administration: 'Administrado',
    'administration-groups': 'Administraj grupoj',
    'administration-clients': 'API-klientoj',
    'administration-log': 'API-protokolo',
    'administration-countries': 'Landoj',
    'administration-country-groups': 'Landaroj',
    'administration-country-lists': 'Landaj asocioj',
    'administration-org-lists': 'Fakaj asocioj',
    lists: 'Listoj',
    reports: 'Raportoj',
    documents: 'Ŝpureblaj dokumentoj',
};

export const index = {
    tasks: {
        title: 'Taskoj',
        empty: 'Neniuj taskoj',
        tabs: {
            aksopay: 'AKSO-Pago',
            intermediary: '[[Intermediary]]',
            registration: 'Aliĝoj',
        },
    },
    admin: {
        title: 'Asisto',
        description: 'Se vi spertas problemojn pri AKSO-Administranto, vi ĉiam povas sendi retmesaĝon al helpo@akso.org. Bonvolu indiki detale la problemon, eventuale aldonante ekranfotojn.',
    },
};

