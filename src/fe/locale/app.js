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
};

export const pages = {
    home: 'Hejmo',
    ch: 'Membroj',
    codeholders: 'Membroj',
    statistics: 'Statistiko',
    membership: 'Membreco',
    'membership-categories': 'Membrokategorioj',
    'membership-registration': 'Aliĝoj',
    roles: 'Roloj',
    email: 'Amasmesaĝoj',
    magazines: 'Revuoj',
    congresses: 'Kongresoj',
    votes: 'Voĉdonado',
    newsletters: 'Bultenoj',
    payments: 'AKSO-Pago',
    'payment-intents': 'Pagoj',
    'payment-orgs': 'Pagorganizoj',
    administration: 'Administrado',
    'administration-groups': 'Administraj grupoj',
    'administration-clients': 'API-klientoj',
    'administration-log': 'API-protokolo',
    'administration-countries': 'Landoj',
    'administration-country-groups': 'Landaroj',
    lists: 'Listoj',
    reports: 'Raportoj',
    documents: 'Ŝpureblaj dokumentoj',
};

export const index = {
    tasks: {
        title: 'Taskoj',
        empty: 'Neniuj taskoj',
    },
    admin: {
        title: 'Asisto',
        description: 'Se vi spertas problemojn pri AKSO-Administranto, vi ĉiam povas sendi retmesaĝon al helpo@akso.org. Bonvolu indiki detale la problemon, eventuale aldonante ekranfotojn.',
    },
};

