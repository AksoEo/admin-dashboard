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
    'bad-request': 'Nevalida peto',
    'unauthorized': 'Mankas aŭtentiko',
    'forbidden': 'Mankas permeso',
    'not-found': 'La paĝo ne estis trovita',
    'conflict': 'Okazis interna konflikto, bonvolu reprovi',
    'internal-server-error': 'Okazis interna eraro',

    // see payments/createIntent
    'payment-exceeds-max': '[[Amount exceeds 500k USD]]',
    // see congresses/createParticipant
    'congresses-already-registered': '[[Codeholder is already registered]]',
};

