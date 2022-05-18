export const votes = {
    title: 'Voĉdonadoj',
    templatesTitle: 'Ŝablonoj',
    detailTitle: 'Voĉdonado',
    templateDetailTitle: 'Ŝablono',
    templates: {
        menuItem: 'Ŝablonoj',
        createVote: 'Krei voĉdonon surbaze de la ŝablono',
    },
    search: {
        placeholders: {
            name: 'Serĉi nomon',
            description: 'Serĉi priskribon',
        },
    },
    fields: {
        org: 'Organizo',
        type: 'Speco',
        name: 'Nomo',
        state: 'Ŝtato',
        description: 'Priskribo',
        voterCodeholders: 'Voĉdonantoj',
        voterCodeholdersMemberFilter: 'Membrofiltrilo de voĉdonantoj',
        viewerCodeholders: 'Rigardantoj',
        viewerCodeholdersMemberFilter: 'Membrofiltrilo de rigardantoj',
        timespan: 'Daŭro',
        timeStart: 'Komenciĝo',
        timeEnd: 'Finiĝo',
        ballotsSecret: 'Sekretaj balotiloj',
        config: 'Agordoj',
        // template fields
        vote: 'Voĉdonagordoj',
    },
    voterCodeholdersDescription: 'Voĉdonantoj estas JSON-filtrilo de membroj, kiuj rajtas voĉdoni.',
    viewerCodeholdersDescription: 'Rigardantoj estas JSON-filtrilo de membroj, kiuj rajtas rigardi la voĉdonon (sed ne nepre voĉdoni).',
    viewerCodeholdersSame: 'Nur voĉdonantoj',
    filters: {
        org: 'AKSO-organizo',
        timeStart: 'Komenĉiĝo',
        timeEnd: 'Finiĝo',
        timeRangeStart: 'Komenco',
        timeRangeEnd: 'Fino',
        state: 'Ŝtato',
        type: 'Speco',
        orgTypes: {
            tejo: 'TEJO',
            uea: 'UEA',
            none: 'ne gravas',
        },
        stateTypes: {
            pending: 'Ankoraŭ ne komenciĝis',
            active: 'aktiva',
            ended: 'finiĝis',
            none: 'ne gravas',
        },
        noneType: 'ne gravas',
    },
    cannotEditActive: 'Ne eblas redakti aktivan voĉdonon',
    bool: {
        yes: 'Jes',
        no: 'Ne',
    },
    rational: {
        numerator: 'Numeratoro',
        denominator: 'Denominatoro',
    },
    state: {
        hasNotStarted: 'Ankoraŭ ne komenciĝis',
        isActive: 'Voĉdonado malfermita',
        hasEnded: 'Voĉdonado finiĝis,\natendas rezultojn',
        hasResults: 'Rezultoj pretas',
        hasResultsTiebreaker: 'Rezultoj pretas,\nuzis egalecrompanton',
    },
    config: {
        ballotsSecret: 'Sekretaj balotiloj',
        quorum: 'Necesa kvorumo',
        majorityBallots: 'Plimulto de voĉdonintoj',
        majorityVoters: 'Plimulto de rajtantoj',
        majorityMustReachBoth: 'Devas esti plimulto de kaj voĉdonintoj kaj rajtintoj',
        blankBallotsLimit: 'Maksimuma kvanto de blankaj balotiloj',
        numChosenOptions: 'Kvanto de venkontaj opcioj',
        mentionThreshold: 'Minimuma postulata kvanto de mencioj por kandidato',
        maxOptionsPerBallot: 'Maksimuma kvanto de elektitaj opcioj sur balotilo',
        tieBreakerCodeholder: 'Egalecrompanto',
        publishVoters: 'Publikigi nomojn de voĉdonintoj',
        publishVotersPercentage: 'Publikigi procentaĵon de voĉdonintoj',
        options: 'Opcioj',

        noMaxOptions: 'Bv. indiki la maksimuman kvanton de elekteblaj opcioj',
        tieBreakerRequired: '[[Tie breaker required]]',
    },
    inclusive: 'Inkluziva', // checkbox label
    options: {
        simple: 'Simpla opcio',
        codeholder: 'Membro',
        name: 'Nomo',
        descriptionPlaceholder: 'Priskribo',
    },
    types: {
        yn: 'Jes/Ne',
        ynb: 'Jes/Ne/Sindetene',
        rp: 'TEJO-Paroranga Sistemo',
        stv: 'TEJO-Unuopa Transdonebla Voĉo',
        tm: 'UEA-Unuvica Plurnoma Majoritata Balotsistemo',
    },
    results: {
        link: 'Vidi rezultojn',
        title: 'Rezultoj',
        resultTypes: {
            undefined: 'Eraro',
            success: 'Sukcesis',
            NO_QUORUM: 'Ne atingis kvorumon',
            TOO_MANY_BLANK_BALLOTS: 'Tro da blankaj balotiloj',
            TIE_BREAKER_NEEDED: 'Necesas egalecrompanto',
            TIE: 'Finiĝis en egaleco',
            CHOSEN: 'Rezulto trovita',
            MAJORITY: 'Voĉdono havas plimulton',
            NO_MAJORITY: 'Voĉdono ne havas plimulton',
        },
        turnout: 'Voĉdonintoj',
        voters: n => `${n} voĉdonintoj`,
        nonVoters: n => `${n} nevoĉdonintoj`,
        votersBlank: n => `${n} blankaj balotiloj`,
        tally: 'Nombrigo de balotiloj',
        optionYes: 'Jes',
        optionNo: 'Ne',
        optionBlank: 'Blanka',
        excludedByMentionThreshold: 'Opcioj nekonsiderataj pro limigo pri minimumaj mencioj',
        isEqualOpt: 'Neelektitaj opcioj ricevintaj je same multe da voĉoj kiel elektita opcio',
        electionQuota: n => `Elektiĝkvoto: ${n}`,
        majorityBallotsOkay: k => k ? 'Plimulto de la balotiloj estis atingita.' : 'Plimulto de la balotiloj NE estis atingita.',
        majorityVotersOkay: k => k ? 'Plimulto de la rajtantaj voĉdonantoj estis atingita.' : 'Plimulto de la rajtantaj voĉdonantoj NE estis atingita.',
        majorityOkay: k => k ? 'Ambaŭ plimultoj estis atingitaj.' : 'Ambaŭ plimultoj NE estis atingitaj.',
        rounds: 'Raŭndoj',
        roundsPagination: (n, m) => `Raŭndo ${n} el ${m}`,
        roundsChosen: 'Venkintoj: ',
        roundsOptionStats: (won, lost, mentions) => `[[won ${won}, lost ${lost}, mentioned ${mentions} time(s)]]`,
        lockGraph: '[[lock graph]]',
        rankedPairs: {
            diff: 'Diferenco',
            winner: 'Venkinto',
            pair: 'Paro',
            vs: 'kontraŭ',
        },
    },
    create: {
        menuItem: 'Krei',
        title: 'Krei voĉdonon',
        templateTitle: 'Krei ŝablonon',
        button: 'Krei',
        pages: {
            template: 'Ŝablono',
            general: 'Ĝenerale',
            vote: 'Voĉdono',
            voters: 'Voĉdonantoj',
            config: 'Agordoj',
        },
        continue: 'Daŭrigi',

        nameRequired: 'Necesas nomo',
        requiresSelection: 'Vi devas elekti opcion',
        emptyTimespan: 'La tempointervalo estas malplena',
    },
    numberRequired: 'Bv. enmeti nombron',
    optionsRequired: 'Bv. enmeti voĉdonopciojn',
    update: {
        menuItem: 'Redakti',
        title: 'Redakti voĉdonon',
        templateTitle: 'Redakti ŝablonon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi voĉdonon',
        templateTitle: 'Forigi ŝablonon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi la voĉdonon? Ne eblas malfari tiun ĉi agon.',
        templateDescription: 'Ĉu vi certas, ke vi volas forigi la ŝablonon? Ne eblas malfari tiun ĉi agon.',
    },
    csvFilename: 'vochdonadoj',
};

