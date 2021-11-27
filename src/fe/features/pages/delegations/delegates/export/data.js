function loadDataView (core, ...args) {
    return new Promise((resolve, reject) => {
        const view = core.createDataView(...args);
        view.on('update', data => {
            resolve(data);
            view.drop();
        });
        view.on('error', err => {
            reject(err);
            view.drop();
        });
    });
}

async function loadCities (onProgress, core, ids) {
    onProgress('loadCities', 0, ids.length);

    const cities = {};
    let cityCount = 0;
    let offset = 0;
    while (offset < ids.length) {
        const result = await core.createTask('geoDb/listCities', {}, {
            jsonFilter: { filter: { id: { $in: ids.slice(offset, offset + 100).map(id => +id.substr(1)) } } },
            offset,
            limit: 100,
        }).runOnceAndDrop();
        offset += 100;
        for (const id of result.items) {
            const data = await loadDataView(core, 'geoDb/city', { id, noFetch: true });
            cities[id] = data;
            onProgress('loadCities', ++cityCount, ids.length);
        }
    }
    return cities;
}

async function loadSubjects (onProgress, core, ids) {
    onProgress('loadSubjects', 0, ids.length);

    const subjects = {};
    let subjectCount = 0;
    let offset = 0;
    while (offset < ids.length) {
        const result = await core.createTask('delegations/listSubjects', {}, {
            jsonFilter: { filter: { id: { $in: ids.slice(offset, offset + 100) } } },
            offset,
            limit: 100,
        }).runOnceAndDrop();
        offset += 100;
        for (const id of result.items) {
            const data = await loadDataView(core, 'delegations/subject', { id, noFetch: true });
            subjects[id] = data;

            onProgress('loadSubjects', ++subjectCount, ids.length);
        }
    }
    return subjects;
}

export async function load (onProgress, core, org) {
    onProgress('loadCountries', 0, 0);
    const countries = await loadDataView(core, 'countries/countries');
    onProgress('loadCountries', Object.keys(countries).length, Object.keys(countries).length);
    const delegates = [];

    const cityIds = new Set();
    const subjectIds = new Set();

    onProgress('loadDelegates', 0, 0);

    let offset = 0;
    let totalItems = Infinity;
    while (offset < totalItems) {
        const delegatesList = await core.createTask('delegations/listDelegatesExt', {}, {
            jsonFilter: { filter: { org, 'tos.paperAnnualBook': true } },
            offset,
            limit: 100,
        }).runOnceAndDrop();

        totalItems = delegatesList.total;
        offset += delegatesList.items.length;

        onProgress('loadDelegates', offset, totalItems);
        onProgress('loadCodeholders', 0, delegatesList.items.length);

        const codeholderList = await core.createTask('codeholders/list', {}, {
            jsonFilter: { filter: { id: { $in: delegatesList.items } } },
            fields: [
                'id', 'type', 'name', 'lastNamePublicity', 'profilePictureHash',
                'profilePicturePublicity', 'mainDescriptor', 'website', 'factoids', 'biography',
                'publicEmail', 'email', 'emailPublicity', 'officePhone', 'officePhonePublicity',
                'address', 'addressPublicity',
            ].map(id => ({ id, sorting: 'none' })),
            limit: 100,
        }).runOnceAndDrop();

        const codeholders = {};
        for (const id of codeholderList.items) {
            codeholders[id] = await loadDataView(core, 'codeholders/codeholder', { id, noFetch: true });

            onProgress('loadCodeholders', Object.keys(codeholders).length, delegatesList.items.length);
        }

        onProgress('loadDelegatesSub', delegates.length, totalItems);

        for (const id of delegatesList.items) {
            const delegation = await loadDataView(core, 'codeholders/delegation', { id, noFetch: true });
            if (codeholders[delegation.codeholderId]) {
                delegates.push({
                    codeholder: codeholders[delegation.codeholderId],
                    delegation,
                });
                for (const city of delegation.cities) cityIds.add(city);
                for (const subject of delegation.subjects) subjectIds.add(subject);

                onProgress('loadDelegatesSub', delegates.length, totalItems);
            } else {
                console.warn(`delegates export: missing codeholder ${id}`, id); // eslint-disable-line no-console
            }
        }
    }

    const cities = await loadCities(onProgress, core, [...cityIds]);
    const subjects = await loadSubjects(onProgress, core, [...subjectIds]);

    return { countries, cities, subjects, delegates };
}
