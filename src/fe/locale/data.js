export const generic = {
    close: 'Fermi',
    cancel: 'Nuligi',

    openExternalLink: {
        title: 'Ĉu vi volas malfermi tiun ĉi aleksteran ligilon?',
        open: 'Malfermi',
    },
};

export const data = {
    copy: 'Kopii',
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
        countryEmpty: '- Elektu landon -',
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
        dialogTitleNoGroups: 'Elekti landojn',
    },
    largeMultiSelect: {
        search: 'Serĉi…',
        selectAll: 'Elekti ĉiujn',
        deselectAll: 'Malelekti ĉiujn',
        ok: 'Bone',
    },
    weekdays: 'DLMMJVS',
    weekStart: 1, // Monday
    timespanUnits: {
        years: y => y === 1 ? '1 jaro' : `${y} jaroj`,
        months: m => m === 1 ? '1 monato' : `${m} monatoj`,
        days: d => d === 1 ? '1 tago' : `${d} tagoj`,
        hours: h => h === 1 ? '1 horo' : `${h} horoj`,
        minutes: m => m === 1 ? '1 minuto' : `${m} minutoj`,
        seconds: s => s === 1 ? '1 sekundo' : `${s} sekundoj`,
        y: 'j',
        mo: 'm',
        d: 't',
        h: 'h',
        m: 'm',
        s: 's',
    },
    invalidCurrencyAmount: 'Nevalida valutokvanto', // this will only happen very rarely
    permsEditor: {
        note: 'Bv. noti, ke uzantaj permesoj estas kombinitaj de pluraj fontoj; tial la ĉi-suba montrilo ne donas la plenan superrigardon.',
        requires: 'Bezonas',
        mr: 'Membrorestriktoj (JSON-filtrilo)',
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
        stats: {
            permCount: n => `${n} simpla${n === 1 ? '' : 'j'} permeso${n === 1 ? '' : 'j'} donitaj`,
            fieldCount: n => `${n} membrokampo${n === 1 ? '' : 'j'} permesita${n === 1 ? '' : 'j'}`,
            fieldCountAll: 'Ĉiuj membrokampoj estas permesitaj',
        },
        data: {
            title: 'Simplaj permesoj',
            empty: 'Neniuj permesoj',
        },
    },
    mdEditor: {
        previewOn: 'Antaŭvidi formatigon',
        previewTitle: 'Antaŭvido',
        previewOff: 'Fermi antaŭvidon',

        formatButtons: {
            title: 'Titolo',
            bold: 'Grasa',
            italic: 'Kursiva',
            strike: 'Trastreko',
            link: 'Ligilo',
            image: 'Bildo',
            code: 'Kodo',
            table: 'Tabelo',
            ul: 'Neordigita listo',
            ol: 'Ordigita listo',
        },

        urlLabel: 'Teksto',
        url: 'Ligilo', // when inserting links or images
        urlPlaceholder: 'https://ekzemplo.eo/bildo.jpg',
        insertUrl: 'Enmeti',

        help: {
            title: 'Helpo pri Markdown',
            rules: {
                newline: `
Skribu tekston kiel kutime. Uzu du novajn liniojn por krei paragrafon.
                `,
                heading: `
### Kiel uzi titolojn
\`\`\`
# saluton
## mondo
\`\`\`
# saluton
## mondo`,
                emphasis: `
### Kiel uzi emfazon
\`\`\`
*saluton* **mondo**
\`\`\`
*saluton* **mondo**`,
                strikethrough: `
### Kiel uzi trastrekon
\`\`\`
~~saluton mondo~~
\`\`\`
~~saluton mondo~~`,
                backticks: `
### Kiel uzi kodekzemplojn unuliniajn
\`\`\`
\`saluton mondo\`
\`\`\`
\`saluton mondo\``,
                table: `
### Kiel uzi tabelojn
\`\`\`
| saluton | mondo     |
| ------- | --------- |
| kiel    | vi fartas |
\`\`\`
| saluton | mondo |
| ---- | ---- |
| kiel | vi fartas |`,
                link: `
### Kiel uzi ligilojn
\`\`\`
[alklaku min](https://uea.org)
\`\`\`
[alklaku min](https://uea.org)`,
                image: `
### Kiel uzi bildojn
\`\`\`
![Mi aperas se la bildo ne funkcias](https://uea.org/bildo.jpg)
\`\`\`
![Mi aperas se la bildo ne funkcias](/assets/logo.svg) `,
                list: `
### Kiel uzi listojn
\`\`\`
- saluton
- mondo
    - kaj mondanoj

1. mi
2. pli
3. gravas
4. ol mi
\`\`\`
- saluton
- mondo
    - kaj mondanoj

1. mi
2. pli
3. gravas
4. ol mi`,
            },
        },
    },
    mapList: {
        empty: 'Neniuj lokoj',
        searchPlaceholder: 'Serĉi…',
    },
    mapPicker: {
        pickPrompt: 'Alklaku por elekti lokon',
        movePrompt: 'Alklaku sur la mapo aŭ tiru la indikilon',
        fromAddress: 'Serĉi laŭ adreso',
        searchingForAddr: 'Serĉas',
    },
    tagManager: {
        noTags: 'Neniuj etikedoj',
        searchPlaceholder: 'Serĉi…',
        dialogTitle: 'Mastrumi etikedojn',
        addTag: 'Aldoni etikedon',
        deleteYouSure: 'Ĉu vi certas?', // keep this short
        deleting: 'Forigas etikedon …',
        delete: 'Forigi',
        ok: 'Bone',
    },
    membershipChip: {
        lifetime: 'dumviva',
        givesMembership: 'membrecdona',
    },
    geoDb: {
        nativeLabelMissing: 'Mankas loka nomo',
    },
    picker: {
        done: 'Bone',
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
            content: `[[json help content goes here]]`,
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
    noFieldsSelected: 'Neniuj kampoj elektitaj',
    sorting: {
        none: 'ne ordigata',
        asc: 'kreskanta',
        desc: 'malkreskanta',
    },
    fieldPicker: {
        title: 'Montrotaj kampoj',
        searchPlaceholder: 'Serĉi kampon',
        noFieldsAvailable: 'Neniuj kampoj estas elekteblaj',
        sortingDescription: 'La rezultoj estas ordigitaj laŭ la ordo de la kampoj, de supro al malsupro',
        ok: 'Bone',
    },
    searchHelp: {
        title: '[[Search Help]]',
        contents: `
Eblas uzi la jenajn kontrolsignojn por fari malsimplan serĉon:

- \`*\` post vorto por permesi ajnajn sekvantajn signojn post la vorto
- \`+\` antaŭ vorto por postuli ĝian ekziston
- \`-\` antaŭ vorto por postuli ĝian malekziston
- \`""\`-citilojn ĉirkaŭ frazo aŭ vorto por postuli la ekzaktan kombinon de la vortoj

Serĉoj kun kontrolsignoj ne rajtas enhavi vortojn malpli longajn ol tri signoj.
        `,
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
        '': 'Nekonata dosierspeco',
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
