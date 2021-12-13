export const errors = {
    unknown: 'Okazis nekonata eraro',
    invalidSearchQuery: {
        pre: [
            'La serĉkriterio ne estas valida. Ĉiuj signoj ne literaj aŭ numeraj estas ignoritaj.',
            'Eblas uzi la jenajn kontrolsignojn por fari malsimplan serĉon:',
        ],
        list: [
            ['*', ' post vorto por permesi ajnajn sekvantajn signojn post la vorto'],
            ['+', ' antaŭ vorto por postuli ĝian ekziston'],
            ['-', ' antaŭ vorto por postuli ĝian malekziston'],
            ['""', '-citilojn ĉirkaŭ frazo aŭ vorto por postuli la ekzaktan kombinon de la vortoj'],
        ],
        post: ['Serĉoj kun kontrolsignoj ne rajtas enhavi vortojn malpli longajn ol tri signoj.'],
    },
    'unknown-field': err => `Nekonata kampo ${err.field}`,
    'unknown-filter': err => `Nekonata kampo ${err.filter}`,
    'bad-request': 'La aplikaĵo sendis nevalidan peton. Bonvolu reŝarĝi la paĝon.',
    'unauthorized': 'La aplikaĵo ne bonorde ensalutis. Bonvolu reŝarĝi la paĝon.',
    'forbidden': 'Viaj permesoj ŝanĝiĝis ekde via ensaluto. Bonvolu reŝarĝi la paĝon.',
    'not-found': 'Tiu ĉi paĝo ne estis trovita. Bonvolu kontroli la adreson se vi ĝin permane entajpis.',
    'conflict': 'Okazis interna konflikto, bonvolu reprovi vian agon.',
    'payload-too-large': 'La alŝutita dosiero estis tro granda, bonvolu reprovi kun malpli granda dosiero.',
    'internal-server-error': 'Okazis interna eraro. Bonvolu reŝarĝi la paĝon.',
    'object-exists': 'Jam ekzistas resurso kun tiu nomo. Bonvolu reiri por reprovi.',

    // see payments/createIntent
    'payment-exceeds-max': 'Ne eblas krei pagojn por pli ol 500.000 USD',
    // see congresses/createParticipant
    'congresses-already-registered': 'Jam ekzistas aliĝo por tiu ĉi membro',
    // see clients/list
    'invalid-api-key': 'Nevalida API-ŝlosilo',

    schema: {
        nthItem: n => `${n}-a`,
        keywords: {
            required: p => `Mankas la deviga kampo ${p.missingProperty}`,
            additionalProperties: p => `Aperas nekonata kampo ${p.additionalProperty}`,
            minLength: p => `Ne estu pli mallonga ol ${p.limit}`,
            minItems: p => `Ne estu malpli ol ${p.limit} suberoj`,
            oneOf: () => `Estu identa al almenaŭ unu el la jenaj skemoj`,
        },
    },
};

