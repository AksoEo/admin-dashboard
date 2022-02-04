export const codeholders = {
    title: 'Membroj',
    detailTitle: 'Membro',
    search: {
        fields: {
            nameOrCode: 'Nomo aŭ UEA-kodo',
            email: 'Retpoŝtadreso',
            landlinePhone: 'Hejma telefono',
            cellphone: 'Poŝtelefono',
            officePhone: 'Oficeja telefono',
            searchAddress: 'Adreso',
            notes: 'Notoj',
        },
        placeholders: {
            nameOrCode: 'Ekz. xxtejo aŭ Zamenhof',
            email: 'Ekz. zamenhof@co.uea.org',
            landlinePhone: 'Ekz. +314666…',
            cellphone: 'Ekz. +314666…',
            officePhone: 'Ekz. +314666…',
            searchAddress: 'Ekz. Nieuwe Binnenweg',
            notes: 'Serĉi en notoj',
        },
        filters: {
            age: 'Aĝo',
            hasOldCode: 'Kvarlitera UEA-kodo',
            hasEmail: 'Retpoŝtadreso',
            type: 'Membrospeco',
            enabled: 'Konto ŝaltita',
            isDead: 'Mortinta',
            country: 'Lando',
            birthdate: 'Naskiĝtago',
            hasPassword: 'Kreis konton',
            membership: 'Membreckategorioj',
            roles: 'Roloj',
            isActiveMember: 'Aktiva membro iam en',
            deathdate: 'Mortjaro',
            codeList: 'Listo de UEA-kodoj',
            delegations: 'Delegeco',
        },
        countryFilter: {
            all: 'ne gravas',
            fee: 'paglando',
            address: 'loĝlando',
        },
        enabledStates: {
            all: 'ne gravas',
            enabled: 'ŝaltita',
            disabled: 'malŝaltita',
        },
        agePrime: 'jarkomence',
        ageBirthYear: range => `naskiĝintoj en ${range}`,
        boolean: {
            all: 'ne gravas',
            yes: 'jes',
            no: 'ne',
        },
        existence: {
            all: 'ne gravas',
            yes: 'ekzistas',
            no: 'ne ekzistas',
        },
        membership: {
            invert: {
                yes: 'ne havas',
                no: 'havas',
            },
            lifetime: {
                yes: 'dumviva',
                no: 'unujara',
                all: 'ne gravas',
            },
            givesMembership: {
                yes: 'membrecdona',
                no: 'nemembrecdona',
                all: 'ne gravas',
            },
            conjunction: 'kaj',
            pickSome: 'Elekti kategoriojn',
        },
        role: {
            pickSome: 'Elekti rolojn',
            activeAtTime: 'aktiva je', // comes before the date picker
            anyTime: 'Iam ajn', // null value for date picker
        },
        types: {
            all: 'ne gravas',
            human: 'homo',
            org: 'organizo',
        },
        codeList: {
            pickCodes: 'Listo de kodoj',
            description: 'Enmetu UEA-kodojn en la ĉi-suban liston; po unu en unu vico.',
            ok: 'Bone',
        },
        delegations: {
            has: 'havas',
            invert: 'ne havas',
            conjunction: 'kaj',
        },
    },
    globalFilterTitle: 'La rezultoj estas filtritaj',
    globalFilterNotice: ['Ĉiuj viaj serĉoj estas limigitaj laŭ ', 'membrofiltrilo', '. Okaze de demandoj, kontaktu vian administranton.'],
    fields: {
        id: 'Identigilo',
        type: 'Membrospeco',
        types: {
            human: 'Homo',
            org: 'Organizo',
        },
        disabledTitle: 'malŝaltita',
        deadTitle: 'mortinta',
        name: 'Nomo',
        code: 'UEA-kodo',
        country: 'Lando',
        disjunctCountry: (fee, country) => `Pagas laŭ ${fee}, loĝas en ${country}`,
        disjunctCountryCSV: (fee, country) => `Pago: ${fee}, Loĝo: ${country}`,
        age: 'Aĝo',
        ageFormat: (age, agep, dead) => `${age}` + (dead ? '' : ` (${agep} jarkomence)`),
        email: 'Retpoŝtadreso',
        address: 'Adreso',
        addressLatin: 'Adreso latinigita',
        addressCity: 'Urbo',
        addressCountryArea: 'Regiono',
        codeholderDisabledTitle: 'malŝaltita',
        codeholderDeadTitle: 'mortinta',
        notes: 'Notoj',
        landlinePhone: 'Hejma telefono',
        cellphone: 'Poŝtelefono',
        officePhone: 'Oficeja telefono',
        enabled: 'Konto ŝaltita',
        enabledStates: {
            yes: 'Jes',
            no: 'Ne',
        },
        isDead: 'Mortinta',
        feeCountry: 'Paglando',
        birthdate: 'Naskiĝtago',
        deathdate: 'Mortdato',
        honorific: 'Titolo',
        profession: 'Profesio',
        membership: 'Membreco',
        website: 'Retejo',
        biography: 'Biografio',
        careOf: 'P/a',
        creationTime: 'Horo de kreiĝo',
        hasPassword: 'Kreis konton',
        password: 'Pasvorto',
        addressPublicity: 'Publikeco de adreso',
        emailPublicity: 'Publikeco de retpoŝtadreso',
        officePhonePublicity: 'Publikeco de oficeja telefono',
        profilePicturePublicity: 'Publikeco de profilbildo',
        lastNamePublicity: 'Publikeco de familinomo',
        landlinePhonePublicity: 'Publikeco de hejma telefono',
        cellphonePublicity: 'Publikeco de poŝtelefono',
        publicCountry: 'Publika lando',
        publicEmail: 'Publika retpoŝtadreso',
        mainDescriptor: 'Ĉefa priskribeto',
        factoids: 'Vizitkartaj faktoj',

        // used only in field history
        profilePictureHash: 'Profilbildo',

        sections: {
            contact: 'Kontaktinformoj',
            location: 'Adreso',
            factoids: 'Detalaj informoj',
            admin: 'Administrado',
        },
    },
    fieldEditorInsufficientPerms: 'Vi ne havas redaktorajton',
    countryChangeNotice: {
        description: 'Vi ŝanĝis la adresan landon, ĉu vi volas reflekte ŝanĝi la paglandon?',
        no: 'Ne, lasu ĝin',
        yes: 'Jes, ŝanĝu ĝin',
    },
    profilePictureHashSome: 'Havas bildon',
    profilePictureHashNone: 'Havas neniun bildon',
    csvFields: {
        membership: 'Membreco (resumo)',
    },
    csvFilename: 'membroj',
    nameSubfields: {
        legal: 'Jura nomo',
        abbrev: 'Mallongigo',
        honorific: 'Titolo',
        firstLegal: 'Jura persona nomo',
        lastLegal: 'Jura familia nomo',
        first: 'Persona nomo',
        last: 'Familia nomo',
        full: 'Plena nomo',
        local: 'Plena, loka nomo',
    },
    postalAddress: 'Poŝtadreso',
    postalLocale: 'Lingvo de adreso',
    honorificSuggestions: [
        'S-ro',
        'S-ino',
        'S-ano',
        'Prof.',
        'Prof-ino',
        'D-ro',
        'D-ino',
        'Mag.',
        'Mag-ino',
        'Fraŭlo',
        'F-ino',
        'Inĝ.',
        'Inĝ-ino',
        'Pastro',
        'Pastrino',
        'Civitano',
        'Ges-ro',
    ],
    factoids: {
        duplicateKey: 'Tiu lista punkto jam ekzistas',
        newDupKeyName: r => `Fakto ${r}`,
        types: {
            tel: 'Telefonnumero',
            text: 'Teksto',
            number: 'Numero',
            email: 'Retpoŝtadreso',
            url: 'Retadreso',
        },
        placeholders: {
            tel: '+',
            email: 'ekzemplo@uea.org',
            url: 'https://ekzemplo.uea.org',
        },
    },
    csvOptions: {
        countryLocale: 'Lingvo de landnomoj',
        countryLocales: {
            eo: 'Esperanto',
            en: 'English',
            fr: 'Français',
            es: 'Español',
            nl: 'Nederlands',
            pt: 'Português',
            sk: 'Slovenčina',
            zh: '中文',
            de: 'Deutsch',
        },
    },
    profilePicture: {
        crop: 'Tondi profilfoton',
        cancel: 'Nuligi',
        set: 'Alŝuti',
    },
    create: 'Aldoni membron',
    createNoName: 'Nomo estas deviga',
    createAction: 'Aldoni',
    invalidUEACode: 'Nevalida seslitera UEA-kodo',
    invalidHumanCode: 'UEA-kodoj por homoj ne rajtas komenciĝi je xx',
    invalidOrgCode: 'UEA-kodoj por organizoj devas komenciĝi je xx',
    createGenericError: 'Okazis neatendita eraro dum kreado de membro, bv. reprovi poste',
    memberships: 'Membrecoj',
    noMemberships: 'Neniuj membrecoj',
    addMembership: 'Aldoni membrecon',
    membership: {
        lifetime: {
            yes: 'dumviva',
            no: 'unujara',
        },
        givesMembership: {
            yes: 'membrecdona',
            no: 'nemembrecdona',
        },
        canutoAttr: 'canuto',
        useCanuto: 'Canuto',
        availableFrom: 'nur de',
        availableTo: 'nur ĝis',
        year: 'Jaro',
        notAYear: 'Bonvolu enmeti validan jaron',
        add: 'Aldoni',
    },
    roles: 'Roloj',
    noRoles: 'Neniuj roloj',
    addRole: 'Aldoni rolon',
    updateRole: 'Redakti rolon',
    role: {
        add: 'Aldoni',
        edit: 'Redakti',
        update: 'Redakti',
        description: 'Se la komenca kaj fina datoj restas malplenaj, la valido iĝas senlimaj.',
        durationFrom: 'Valida ekde',
        durationTo: 'Valida ĝis',
        dataCountry: 'Rola lando',
        dataOrg: 'Rola organizo',
        dataString: 'Rola subteksto',
        notADate: 'Ne estas valida dato',
    },
    files: {
        downloadToView: 'Elŝuti',
    },
    // TODO: move these in files
    filesButton: n => !n ? 'dosieroj' : n === 1 ? '1 dosiero' : `${n} dosieroj`,
    filesTitle: 'Dosieroj',
    fileTitle: 'Dosiero',
    noFiles: 'Neniuj dosieroj',
    editFile: 'Redakti dosieron',
    uploadFile: 'Alŝuti dosieron',
    uploadThisFile: 'Alŝuti',
    deleteFile: 'Forigi dosieron',
    downloadFile: 'Elŝuti',
    fileName: 'Dosiernomo',
    fileDescription: 'Priskribo',
    cancelUploadFile: 'Nuligi',
    retryFileUpload: 'Reprovi',
    failedFileUpload: 'Ne sukcesis alŝuti la dosieron',
    fileAddedBy: 'aldonita de ',
    delete: 'Forigi',
    deleteDescription: 'Ĉu vi certas, ke vi volas forigi tiun ĉi membron? Ne eblas malfari tion ĉi.',
    fieldHistory: {
        title: field => `Historio de ${field}`,
        comment: 'Priskribo de ŝanĝoj',
        changedBy: 'Ŝanĝita de',
        initial: 'Origina datumo',
    },
    addrLabelGen: {
        menuItem: 'Krei adresetikedojn',
        title: 'Kreado de adresetikedoj',
        labels: {
            language: 'Lingvo',
            latin: 'Latinigita',
            includeCode: 'UEA-kodoj',
            paper: 'Paperspeco',
            margins: 'Marĝenoj',
            cols: 'Kolumnoj',
            rows: 'Vicoj',
            colGap: 'Interkolumna spaco',
            rowGap: 'Intervica spaco',
            cellPadding: 'Enĉela marĝeno',
            fontSize: 'Tipargrandeco',
            drawOutline: 'Montri kadrojn',
        },
        paperSizes: {
            A3: 'A3',
            A4: 'A4',
            A5: 'A5',
            LETTER: 'US Letter',
            FOLIO: 'Folio',
            LEGAL: 'Legal',
            EXECUTIVE: 'Executive',
        },
        cursedNotice: 'Rezultoj trovitaj laŭ UEA-kodo markitaj per ora koloro ne aperos en la adresetikedoj.',
        generate: 'Krei etikedojn',
        success: 'Komencis generadon de viaj etikedoj. Vi ricevos sciigon/retmesaĝon kun alkroĉaĵo laŭeble baldaŭ.',
        genericError: 'Ne sukcesis sendi la adresetikedpeton.',
        closeDialog: 'Fermi',
        stats: ({ perPage, pages, total, withAddresses }) => `Trovis ${withAddresses} rezultojn (el entute ${total}) kiuj havas poŝtadreson. Kun po ${perPage} adreso${perPage === 1 ? '' : 'j'} por paĝo, tio estos ${pages} paĝo${pages === 1 ? '' : 'j'}`,
        statsFiltered: ({ total, filtered }) => `Atentu, ke la kvanto de ricevontoj (${filtered}) estas subaro de la vera kvanto de membroj, filtrite laŭ viaj permesoj kaj restriktoj.`,
        presets: {
            load: 'Ŝarĝi',
            pick: 'Ŝarĝi ŝablonon',
            empty: 'Estas neniuj ŝablonoj',
            name: 'Nomo',
            create: {
                menuItem: 'Konservi',
                title: 'Krei ŝablonon',
                button: 'Krei',
            },
            update: {
                menuItem: 'Konservi',
                title: 'Ĝisdatigi ŝablonon',
                button: 'Ĝisdatigi',
            },
        },
    },
    notifTemplates: {
        cursedNotice: 'Oraj rezultoj ne ricevos mesaĝon.',
        description: 'Mesaĝoj estos senditaj al ĉiuj membroj laŭ via nuna filtrilo.',
        menuItem: 'Sendi amasmesaĝon',
        title: 'Sendi amasmesaĝon',
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
        },
    },
    publicity: {
        private: 'Privata',
        members: 'Nur membroj',
        public: 'Publika',
    },
    logins: {
        title: 'Historio de ensalutoj',
        empty: 'Neniuj ensalutoj',
        inTimezone: 'en la horzono',
        viewInOSM: 'Montri ĉirkaŭaĵon sur mapo',
        osmLink: (area, lat, lon) => {
            // FIXME: bad zoom approximation
            let zoom = 6;
            if (area <= 1000) zoom = 7;
            if (area <= 100) zoom = 8;
            return `https://www.openstreetmap.org/#map=${zoom}/${lat}/${lon}`;
        },
    },
    detailIsSelf: {
        title: 'Tiu ĉi estas via konto',
        description: 'Vi povas ĝisdatigi viajn proprajn datumojn per uea.org.',
    },
    perms: {
        title: 'Permesoj',
    },

    picker: {
        none: 'Neniu elektita',
        add: 'Elekti membrojn',
        addOne: 'Elekti membron',
        search: 'Serĉi laŭ nomo aŭ UEA-kodo',
        done: 'Bone',
    },
    resetPassword: {
        create: 'Sciigi pri kontokreado',
        reset: 'Sciigi pri pasvortonuligo',
        descriptionCreate: 'Tio ĉi sendas retpoŝtmesaĝon al la membro pri kreado de AKSO-konto.',
        descriptionReset: 'Tio ĉi sendas sciigon al la membro pri nuligo de ties pasvorto.',
        orgsSelect: 'Elekti AKSO-organizon por la sciigo',
        orgs: {
            uea: 'UEA',
            tejo: 'TEJO',
            akso: 'AKSO',
        },
        send: 'Sciigo',
        success: 'Sciigo sendita',
    },
    resetTotp: {
        menuItem: 'Nuligu 2FA',
        title: 'Nuligo de 2-a faktora aŭtentiko',
        description: 'Farante tion ĉi, vi nuligas la agordojn de 2-a faktora aŭtentiko de la uzanto. Faru tion ĉi nur se vi certas, ke la posedanto de la konto ne plu povas ensaluti. Certiĝu, ke ne temas pri alia maliculo.',
        button: 'Nuligu',
        success: 'Sukcese nuligis la agordojn pri 2-a faktora aŭtentiko.',
        none: 'Tiu ĉi konto ne havas agorditan 2FA.',
    },
};

export const codeholderChgReqs = {
    title: 'Ŝanĝopetoj',
    detailTitle: 'Ŝanĝopeto',
    buttonLabel: n => n === 0 ? 'Ŝanĝopetoj' : `${n} ŝanĝopeto${n === 1 ? '' : 'j'}`,
    search: {
        placeholders: {
            codeholderDescription: 'Serĉi priskribojn',
            internalNotes: 'Serĉi notojn',
        },
        filters: {
            status: 'Stato',
            statusesEmpty: 'Ajna stato',
        },
    },
    fields: {
        time: 'Horo de kreiĝo',
        codeholderId: 'UEA-kodo',
        data: 'Petitaj ŝanĝoj',
        codeholderDescription: 'Priskribo de peto',
        internalNotes: 'Internaj notoj',
        status: 'Stato',

        codeholderDescriptionEmpty: 'Neniu priskribo',
        statuses: {
            pending: 'Atendanta',
            approved: 'Akceptita',
            denied: 'Malakceptita',
            canceled: 'Nuligita',
        },
    },
    approval: {
        approve: 'Akcepti',
        deny: 'Malakcepti',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti ŝanĝopeton',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi ŝanĝopeton',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi ŝanĝopeton? Ne eblas malfari tiun ĉi agon.',
    },
};
