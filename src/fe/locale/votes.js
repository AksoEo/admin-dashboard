export const votes = {
    title: 'Voĉdonoj',
    templatesTitle: 'Ŝablonoj',
    detailTitle: 'Voĉdono',
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
            pending: 'ankoraŭ ne komenciĝis',
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
        isActive: 'Voĉdono malfermita',
        hasEnded: 'Voĉdono finiĝis,\natendas rezultojn',
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
        publishResults: 'Publikigi rezultojn',
        options: 'Opcioj',

        noMaxOptions: 'Bv. indiki la maksimuman kvanton de elekteblaj opcioj',
        tieBreakerRequired: 'Necesas egalecrompanto',
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
    stats: {
        ballots: (n, m, p) => `${n}/${m} (${p}%) rajtinto${m === 1 ? '' : 'j'} voĉdonis`,
        eligible: n => `${n} voĉdonrajtinto${n === 1 ? '' : 'j'}`,
    },
    results: {
        link: 'Vidi rezultojn',
        title: 'Rezultoj',
        statuses: {
            undefined: 'Eraro',
            'success': 'Sukcesis',
            'tie-breaker-needed': 'Necesas egalecrompanto',
            'tie': 'Finiĝis en egaleco',
            'majority-empty': '[[The majority of ballots is effectively empty]]',
            'no-quorum': 'Ne atingis kvorumon',
            'too-many-blanks': 'Tro da blankaj balotiloj',
        },
        ballots: {
            title: 'Nombrigo de balotiloj',
            blanks: n => `${n} blanka${n === 1 ? '' : 'j'} balotilo${n === 1 ? '' : 'j'}`,
            voters: n => `${n} voĉdoninto${n === 1 ? '' : 'j'}`,
            nonVoters: n => `${n} nevoĉdoninto${n === 1 ? '' : 'j'}`,
        },
        mentions: {
            candidateIncludedWithCount: n => `${n} mencio${n === 1 ? '' : 'j'}`,
            candidateExcludedWithCount: n => `${n} mencio${n === 1 ? '' : 'j'} (nekonsiderata)`,
        },

        winner: 'Venkinto',
        winners: 'Venkintoj',

        optionListEmpty: '(neniuj)',

        ynbResults: {
            resultPass: '[[Vote passed]]',
            resultFail: '[[Vote did not pass]]',
            majorityPass: '[[Majority passed]]',
            majorityFail: '[[Majority did not pass]]',
            votersPass: '[[Voters passed]]',
            votersFail: '[[Voters did not pass]]',
        },
        ynbOptions: {
            yes: 'Jes',
            no: 'Ne',
            blank: 'Blanka',
        },

        rpTieBreakerNeeded: {
            description: '[[A tie breaker is needed because the ranking of the following pairs is ambiguous.]]',
        },
        rpRounds: {
            title: 'Raŭndoj',
            diff: 'Diferenco',
            winner: 'Venkinto',
            pair: 'Paro',
        },

        stvTieBreakerNeeded: {
            description: '[[A tie breaker is needed because the following candidates could not be ranked against each other.]]',
        },
        stvEvents: {
            electWithQuota: quota => `[[Elected candidates with quota ${quota}]]`,
            electWithQuotaDescription: '[[Candidates whose votes were above the quota were elected, and their votes were transferred.]]',
            electingValuesDescription: '[[The surplus votes of the marked candidates will be transferred to the next choices:]]',

            electRest: '[[Elected all remaining candidates]]',
            electRestDescription: '[[There were now as only as many remaining candidates as remaining seats, so they were all elected.]]',

            eliminate: '[[Eliminated a candidate]]',
            eliminateDescription: '[[No candidates were elected, so one must be eliminated.]]',
            eliminatedValuesDescription: '[[The entire ballot value of the candidate has been transferred to the next choices:]]',

            elected: '[[Elected]]',
            eliminated: '[[Eliminated]]',
        },

        tmTie: {
            title: '[[Tied candidates]]',
            sortedNodes: '[[Sorted nodes]]',
            nodeIsTied: '[[Tied]]',
        },

        turnout: 'Voĉdonintoj',
        excludedByMentionThreshold: 'Opcioj nekonsiderataj pro limigo pri minimumaj mencioj',
        isEqualOpt: 'Neelektitaj opcioj ricevintaj je same multe da voĉoj kiel elektita opcio',
        electionQuota: n => `Elektiĝkvoto: ${n}`,
        majorityBallotsOkay: k => k ? 'Plimulto de la balotiloj estis atingita.' : 'Plimulto de la balotiloj NE estis atingita.',
        majorityVotersOkay: k => k ? 'Plimulto de la rajtantaj voĉdonantoj estis atingita.' : 'Plimulto de la rajtantaj voĉdonantoj NE estis atingita.',
        majorityOkay: k => k ? 'Ambaŭ plimultoj estis atingitaj.' : 'Ambaŭ plimultoj NE estis atingitaj.',
        rounds: 'Raŭndoj',
        roundsPagination: (n, m) => `Raŭndo ${n} el ${m}`,
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
    csvFilename: 'vochdonoj',
};

