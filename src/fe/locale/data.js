export const generic = {
    close: 'Fermi',
    cancel: 'Nuligi',
};

export const data = {
    timeSeparator: ':',
    requiredField: 'Tiu ĉi kampo estas deviga',
    byteSizes: [
        ['bajto', 'bajtoj'],
        'kB',
        'MB',
        'GB',
    ],
    delete: 'Forigi',
    retry: 'Reprovi',
    showMore: 'Montri pliajn',
    objViewerArrayItems: items => `${items} ero${items === 1 ? '' : 'j'}`,
    addressFields: {
        country: 'Lando',
        countryArea: 'Regiono',
        city: 'Urbo',
        cityArea: 'Urboparto',
        streetAddress: 'Stratadreso',
        postalCode: 'Poŝtkodo',
        sortingCode: 'Ordigkodo',
    },
    address: {
        invalidPostalCode: 'Nevalida poŝtkodo',
    },
    ueaCode: {
        newCode: 'Seslitera UEA-kodo',
        invalidUEACode: 'Nevalida seslitera UEA-kodo',
        codeTaken: 'La UEA-kodo estas jam uzata',
        idFailed: 'Ne sukcesis ŝarĝi UEA-kodon',
    },
    deleteTitle: 'Forigi',
    deleteDescription: 'Ĉu vi certas, ke vi volas forigi tiun ĉi eron?',
    months: [
        'Januaro',
        'Februaro',
        'Marto',
        'Aprilo',
        'Majo',
        'Junio',
        'Julio',
        'Aŭgusto',
        'Septembro',
        'Oktobro',
        'Novembro',
        'Decembro',
    ],
    countryPicker: {
        // section labels in <select>
        countryGroups: 'Landaroj',
        countries: 'Landoj',
        // types
        all: 'ne gravas',
        fee: 'paglando',
        address: 'loĝlando',
        dialogTitle: 'Elekti land(ar)ojn',
        placeholder: 'Elekti land(ar)ojn',
        search: 'Serĉi land(ar)ojn',
        selectAll: 'Elekti ĉiujn',
        deselectAll: 'Malelekti ĉiujn',
    },
    weekdays: 'DLMMJVS',
    weekStart: 1, // Monday
    timespanUnits: {
        days: d => d === 1 ? '1 tago' : `${d} tagoj`,
        hours: h => h === 1 ? '1 horo' : `${h} horoj`,
        minutes: m => m === 1 ? '1 minuto' : `${m} minutoj`,
        seconds: s => s === 1 ? '1 sekundo' : `${s} sekundoj`,
        d: 't',
        h: 'h',
        m: 'm',
        s: 's',
    },
    invalidCurrencyAmount: 'Nealida valutokvanto', // this will only happen very rarely
    permsEditor: {
        note: 'Bv. noti, ke uzantaj permesoj estas kombinitaj de pluraj fontoj; tial la ĉi-suba montrilo ne donas la plenan superrigardon.',
        requires: 'Bezonas',
        update: {
            title: 'Ĝisdatigi permesojn',
            button: 'Ĝisdatigi',

            // changes
            added: n => `Aldonis ${n} permeso${n === 1 ? '' : 'j'}n`,
            removed: n => `Forigis ${n} permeso${n === 1 ? '' : 'j'}n`,
            mrChanged: 'Ŝanĝis membrorestriktojn',

            // task completion list
            px: 'Permesoj',
            mr: 'Membrorestriktoj',
        },
    },
    mdEditor: {
        previewOn: '[[Preview Markdown]]',
        previewTitle: '[[Preview]]',
        previewOff: '[[Close Preview]]',
    },
};

export const search = {
    normalFilter: 'Facilaj filtriloj',
    jsonFilter: 'JSON-filtriloj',
    loadingJSONEditor: 'Ŝarĝas...',
    filtersDisclosure: 'Filtriloj',
    json: {
        help: {
            title: 'JSON-helpo',
            content: `[[json help content goes here. if you would like this to be raw html\
            that can be arranged (it’s not like we’re going to html inject ourselves though\
            this locale object isn’t immutable so technically that is a possibility but who\
            would even do that)\
            if this is going to be interactive (api doc browser?) that too can be\
            arranged]]`,
        },
    },
    stats: (count, filtered, total, time) => {
        const plural = n => n === 1 ? '' : 'j';
        return `Montras ${count} rezulto${plural(count)}n ${
            filtered ? `filtrita${plural(count)}n ` : ''}el entute ${
            total} trovita${plural(total)} en ${time
            .replace('.', ',')
            // put a space before the unit
            .replace(/ms/, ' ms')}`;
    },
    prevPage: 'Antaŭa',
    nextPage: 'Sekva',
    paginationItems: (from, to, count) => `${from}–${to} el ${count.toLocaleString('de-DE')}`,
    pickFields: 'Elekti kampojn',
    resetFilters: 'Nuligi filtrilojn',
    viewJSON: 'Konverti al JSON-filtrilo',
    loadFilter: 'Ŝargi',
    saveFilter: 'Konservi',
    pickFilter: 'Ŝargi filtrilon',
    saveFilterTitle: 'Konservi filtrilon',
    noFilters: 'Neniuj konservitaj filtriloj',
    savedFilterName: 'Nomo',
    savedFilterDesc: 'Priskribo',
    csvExport: 'Elporti kiel CSV',
    sorting: {
        none: 'ne ordigata',
        asc: 'kreskanta',
        desc: 'malkreskanta',
    },
    fieldPicker: {
        title: 'Montrotaj kampoj',
        searchPlaceholder: 'Serĉi kampon',
    },
};

export const detail = {
    editing: 'Redakti',
    edit: 'Redakti',
    delete: 'Forigi',
    cancel: 'Nuligi',
    done: 'Konservi',
    saveTitle: 'Konservado',
    diff: 'Redaktitaj kampoj',
    updateComment: 'Fonto aŭ kialo de ŝanĝoj farotaj',
    commit: 'Aktualigi',
};

export const csvExport = {
    title: 'Elporti kiel CSV',
    beginExport: 'Elporti',
    tryResumeExport: 'Provi daŭrigi',
    abortExport: 'Nuligi',
    download: 'Elŝuti CSV',
    commaSeparated: 'CSV (komoj)',
    tabSeparated: 'TSV (taboj)',
    status: (n, m) => `Ŝarĝis ${n} el ${m} ero${m === 1 ? '' : 'j'}`,
    endingExport: (n, m) => `Elportis ${n} el entute ${m} vico${m === 1 ? '' : 'j'}`,
    summary: rows => `Kreis csv-dosieron de ${rows} vico${rows === 1 ? '' : 'j'}`,
};

export const mime = {
    types: {
        application: null,
        multipart: null,
        audio: 'sono',
        font: 'tiparo',
        image: 'bildo',
        model: '3D-modelo',
        text: 'teksto',
        video: 'video',
    },
    exceptions: {
        'application/pdf': 'PDF-dokumento',
        'application/msword': 'Word-dokumento', // .doc, .dot
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word-dokumento', // .docx
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'Word-ŝablono', // .dotx
        'application/msexcel': 'Excel-kalkultabelo', // .xls, .xlt
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel-kalkultabelo', // .xlsx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'Excel-kalkultabelŝablono', // .xltx
        'application/mspowerpoint': 'PowerPoint-prezentaĵo', // .ppt, .pot
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint-prezentaĵo', // .pptx
        'application/vnd.openxmlformats-officedocument.presentationml.template': 'PowerPoint-prezentaĵo', // .potx
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'PowerPoint-prezentaĵo', // .ppsx
        'application/vnd.oasis.opendocument.presentation': 'OpenDocument-prezentaĵo', // .odp
        'application/vnd.oasis.opendocument.spreadsheet': 'OpenDocument-kalkultabelo', // .ods
        'application/vnd.oasis.opendocument.text': 'OpenDocument-dokumento', // .odt
        'application/rtf': 'RTF-dokumento',
        'text/plain': 'Teksto',
        'application/octet-stream': 'Dosiero',
        'application/zip': 'ZIP-dosiero',
        'application/x-rar': 'RAR-dosiero',
        'text/csv': 'CSV-tabelo',
    },
};
