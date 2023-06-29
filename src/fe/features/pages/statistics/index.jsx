import { h } from 'preact';
import { Checkbox, CircularProgress } from 'yamdl';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/compat';
import Page from '../../../components/page';
import Meta from '../../meta';
import Tabs from '../../../components/controls/tabs';
import Select from '../../../components/controls/select';
import { date } from '../../../components/data';
import { coreContext } from '../../../core/connection';
import { statistics as locale } from '../../../locale';
import DisplayError from '../../../components/utils/error';
import { useDataView } from '../../../core';
import './index.less';
import Segmented from '../../../components/controls/segmented';

export default class StatisticsPage extends Page {
    render () {
        return (
            <div>
                <Meta
                    title={locale.title} />
                <Statistics />
            </div>
        );
    }
}

const TABS = {
    demo: MembershipsAndRoles,
};

function Statistics () {
    const [tab, setTab] = useState('demo');
    const TabComponent = TABS[tab];

    return (
        <div>
            <Tabs
                value={tab}
                onChange={setTab}
                tabs={
                    Object.fromEntries(Object.keys(TABS).map(tab => ([
                        tab,
                        locale.tabs[tab],
                    ])))
                } />
            <TabComponent />
        </div>
    );
}

function useStatisticsHistory ({ beforeDate, afterDate, offset, limit }) {
    const core = useContext(coreContext);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const currentLoadKey = useRef(0);
    useEffect(() => {
        let filter = {};
        if (beforeDate) {
            filter = { date: { $lte: beforeDate } };
        } else if (afterDate) {
            filter = { date: { $lte: afterDate } };
        }

        currentLoadKey.current++;
        setLoading(true);
        setError(null);
        const loadKey = currentLoadKey.current;
        core.createTask('statistics/listStatistics', {}, {
            fields: [{ id: 'date', sorting: 'desc' }],
            jsonFilter: { filter },
            offset,
            limit,
        }).runOnceAndDrop().then(result => {
            if (loadKey !== currentLoadKey.current) return;
            setResult(result);
        }).catch(error => {
            if (loadKey !== currentLoadKey.current) return;
            setError(error);
        }).finally(() => {
            if (loadKey !== currentLoadKey.current) return;
            setLoading(false);
        });
    }, [offset, beforeDate, afterDate]);

    return [loading, error, result];
}

function getAllCategoriesAndRoles (data) {
    const categories = new Map();
    const roles = new Map();

    for (const country in data) {
        const countryData = data[country];
        for (const category of countryData.membershipCategories) {
            if (!categories.has(category.membershipCategoryId)) {
                categories.set(category.membershipCategoryId, category.membershipCategory[0]);
            }
        }
        for (const role of countryData.roles) {
            if (!roles.has(role.roleId)) {
                roles.set(role.roleId, role.role[0]);
            }
        }
    }

    return  { categories: [...categories.values()], roles: [...roles.values()] };
}

const CATEGORY_TYPE_MEM = 'm';
const CATEGORY_TYPE_ROLE = 'r';
function getAllCategoriesAndRolesAsSelectItems (data) {
    const { categories, roles } = getAllCategoriesAndRoles(data);
    return categories
        .map(cat => ({
            value: CATEGORY_TYPE_MEM + cat.id,
            label: (cat.nameAbbrev ? cat.nameAbbrev + ' ' : '') + cat.name,
        }))
        .concat(roles.map(role => ({
            value: CATEGORY_TYPE_ROLE + role.id,
            label: role.name,
        })));
}

function MembershipsAndRoles () {
    const [,, countries] = useDataView('countries/countries', {});

    const [currentDate, setCurrentDate] = useState(null);

    const [byFieldType, setByFieldType] = useState('category');
    const [country, setCountry] = useState('total');
    const [category, setCategory] = useState(null);
    const [showTejo, setShowTejo] = useState(false);

    const [loadingHist, histError, histData] = useStatisticsHistory({ offset: 0, limit: 10 });
    const [loadingData, dataError, currentData] = useDataView('statistics/statistics', currentDate && { date: currentDate });

    const thisYear = currentDate && currentDate.split('-')[0];
    const lastYearDate = thisYear && `${thisYear - 1}-12-31`;
    const aYearAgoDate = thisYear && `${thisYear - 1}-${currentDate.split('-').slice(1).join('-')}`;

    let thirtyDaysAgoDate = null;
    if (thisYear) {
        thirtyDaysAgoDate = new Date(thisYear + 'T00:00:00Z');
        thirtyDaysAgoDate.setUTCDate(thirtyDaysAgoDate.getUTCDate() - 30);
        thirtyDaysAgoDate = thirtyDaysAgoDate.toISOString().split('T')[0];
    }

    const [,, lastYearData] = useDataView(
        'statistics/statistics',
        lastYearDate && { date: lastYearDate },
    );
    const [,, aYearAgoData] = useDataView(
        'statistics/statistics',
        aYearAgoDate && { date: aYearAgoDate },
    );
    const [,, thirtyDaysAgoData] = useDataView(
        'statistics/statistics',
        thirtyDaysAgoDate && { date: thirtyDaysAgoDate },
    );

    useEffect(() => {
        if (histData && !currentDate) {
            setCurrentDate(histData.items[0] || null);
        }
    }, [histData, currentDate]);
    useEffect(() => {
        if (currentData && !category) {
            setCategory(getAllCategoriesAndRolesAsSelectItems(currentData.data)[0]?.value);
        }
    }, [currentData, category]);

    if (histError) return <DisplayError error={histError} />;
    if (dataError) return <DisplayError error={dataError} />;
    if (loadingHist || loadingData || !histData || !currentData) {
        return <CircularProgress indeterminate />;
    }

    const showTejoCheckboxId = Math.random().toString(36);
    const ageDemoFilter = useMemo(() => {
        if (byFieldType === 'category') {
            if (country === 'total') return {};
            return {
                feeCountry: country,
            };
        } else if (byFieldType === 'country') {
            if (category.startsWith(CATEGORY_TYPE_MEM)) {
                return {
                    $membership: {
                        categoryId: +category.substring(1),
                    },
                };
            } else {
                return {
                    $roles: {
                        roleId: +category.substring(1),
                    },
                };
            }
        }
    }, [byFieldType, country, category]);

    return (
        <div class="statistics-memberships-and-roles">
            <date.editor
                value={currentDate}
                onChange={setCurrentDate} />
            <Segmented
                selected={byFieldType}
                onSelect={setByFieldType}>
                {[
                    {
                        id: 'category',
                        label: locale.membershipsAndRoles.byCategory,
                    },
                    {
                        id: 'country',
                        label: locale.membershipsAndRoles.byCountry,
                    },
                ]}
            </Segmented>
            <div>
                <Checkbox
                    id={showTejoCheckboxId}
                    checked={showTejo}
                    onChange={setShowTejo} />
                {' '}
                <label for={showTejoCheckboxId}>
                    {locale.membershipsAndRoles.showTejo}
                </label>
            </div>
            {byFieldType === 'category' ? (
                <div>
                    <Select
                        outline
                        value={country}
                        onChange={setCountry}
                        items={Object.keys(currentData.data).map(id => ({
                            value: id,
                            label: id === 'total' ? (
                                locale.countries.total
                            ) : (
                                <CountryName id={id} />
                            ),
                        }))} />

                    <AgeDemographics
                        filter={ageDemoFilter} />

                    <MembersTable
                        currentDate={currentDate}
                        lastYearDate={lastYearDate}
                        aYearAgoDate={aYearAgoDate}
                        items={getDataByCategory({
                            country,
                            currentData,
                            lastYearData,
                            aYearAgoData,
                            thirtyDaysAgoData,
                            tejo: showTejo,
                        })} />
                </div>
            ) : byFieldType === 'country' ? (
                <div>
                    <Select
                        outline
                        value={category}
                        onChange={setCategory}
                        items={getAllCategoriesAndRolesAsSelectItems(currentData.data)} />

                    <AgeDemographics
                        filter={ageDemoFilter} />

                    <MembersTable
                        currentDate={currentDate}
                        lastYearDate={lastYearDate}
                        aYearAgoDate={aYearAgoDate}
                        items={getDataByCountry({
                            category,
                            countries,
                            currentData,
                            lastYearData,
                            aYearAgoData,
                            thirtyDaysAgoData,
                            tejo: showTejo,
                        })} />
                </div>
            ) : null}
        </div>
    );
}

function CountryName ({ id }) {
    const [,, countries] = useDataView('countries/countries', {});
    if (countries) {
        return countries[id]?.name_eo || id;
    }
    return id;
}

function AgeDemographics ({ filter }) {
    const core = useContext(coreContext);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [buckets, setBuckets] = useState([]);
    const [bucketsPrimo, setBucketsPrimo] = useState([]);

    const idRef = useRef(0);
    useEffect(() => {
        idRef.current += 1;
        const currentId = idRef.current;

        setLoading(true);
        (async () => {
            const items = [];
            let total = 1;
            while (items.length < total) {
                if (currentId !== idRef.current) return;
                const result = await core.createTask('codeholders/list', {}, {
                    fields: [{ id: 'age', sorting: 'none' }],
                    jsonFilter: { filter: { $and: [{ enabled: true }, filter] } },
                    offset: items.length,
                    limit: 100,
                }).runOnceAndDrop();

                total = result.total;
                for (const id of result.items) {
                    items.push(await core.viewData('codeholders/codeholder', {
                        id,
                        fields: ['age'],
                    }));
                }
            }

            const buckets = [];
            const bucketsPrimo = [];
            for (let i = 0; i <= 10; i++) {
                buckets.push({ label: (i * 10).toString(), count: 0 });
                bucketsPrimo.push({ label: (i * 10).toString(), count: 0 });
            }

            for (const item of items) {
                if (!item.age?.now || item.age?.now > 109) continue;
                buckets[Math.floor(item.age.now / 10)].count++;
                bucketsPrimo[Math.floor(item.age.atStartOfYear / 10)].count++;
            }

            if (currentId !== idRef.current) return;
            setLoading(false);
            setBuckets(buckets);
            setBucketsPrimo(bucketsPrimo);
        })().catch(err => {
            setLoading(false);
            setError(err);
        });
    }, [filter]);

    const max = buckets.map(b => b.count).reduce((a, b) => Math.max(a, b), 1);

    if (loading) return <CircularProgress indeterminate />;
    if (error) return <DisplayError error={error} />;

    return (
        <div class="statistics-demographics">
            <div class="bucket-bars" style={{ '--max': max }}>
                {buckets.map((bucket, i) => (
                    <div class="bucket-bar" key={i}>
                        <div class="bar-container">
                            <div class="bar-value" style={{ '--value': bucket.count }}></div>
                        </div>
                        <div class="bar-label">
                            {bucket.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getDataByCategory ({
    country,
    currentData,
    lastYearData,
    aYearAgoData,
    thirtyDaysAgoData,
    tejo,
}) {
    if (!currentData?.data || !currentData.data[country]) return [];
    const countField = tejo ? 'countTEJO' : 'count';

    const membershipItems = [];
    const roleItems = [];

    for (const categoryData of currentData.data[country].membershipCategories) {
        const catId = categoryData.membershipCategoryId;
        const lastYearCatData = (lastYearData?.data && lastYearData.data[country])
            ? lastYearData.data[country].membershipCategories.find(item => item.membershipCategoryId === catId)
            : null;
        const aYearAgoCatData = (aYearAgoData?.data && aYearAgoData.data[country])
            ? aYearAgoData.data[country].membershipCategories.find(item => item.membershipCategoryId === catId)
            : null;
        const thirtyDaysAgoCatData = (thirtyDaysAgoData?.data && thirtyDaysAgoData.data[country])
            ? thirtyDaysAgoData.data[country].membershipCategories.find(item => item.membershipCategoryId === catId)
            : null;

        const nowCount = categoryData[countField];
        const lastYearCount = lastYearCatData && lastYearCatData[countField];
        const aYearAgoCount = aYearAgoCatData && aYearAgoCatData[countField];
        const yearDifference = nowCount !== null && lastYearCount !== null
            ? nowCount - lastYearCount
            : null;
        const thirtyDayDifference = thirtyDaysAgoCatData !== null
            ? nowCount - thirtyDaysAgoCatData[countField]
            : null;

        membershipItems.push({
            nowCount,
            lastYearCount,
            aYearAgoCount,
            yearDifference,
            thirtyDayDifference,
            nameAbbrev: categoryData.membershipCategory[0].nameAbbrev || null,
            name: categoryData.membershipCategory[0].name,
        });
    }

    for (const roleData of currentData.data[country].roles) {
        const roleId = roleData.roleId;
        const lastYearRoleData = (lastYearData?.data && aYearAgoData.data[country])
            ? lastYearData.data[country].roles.find(item => item.roleId === roleId)
            : null;
        const aYearAgoRoleData = (aYearAgoData?.data && aYearAgoData.data[country])
            ? aYearAgoData.data[country].roles.find(item => item.roleId === roleId)
            : null;
        const thirtyDaysAgoRoleData = (thirtyDaysAgoData?.data && thirtyDaysAgoData.data[country])
            ? thirtyDaysAgoData.data[country].roles.find(item => item.roleId === roleId)
            : null;

        const nowCount = roleData[countField];
        const lastYearCount = lastYearRoleData && lastYearRoleData[countField];
        const aYearAgoCount = aYearAgoRoleData && aYearAgoRoleData[countField];
        const yearDifference = nowCount !== null && lastYearCount !== null
            ? nowCount - lastYearCount
            : null;
        const thirtyDayDifference = thirtyDaysAgoRoleData !== null
            ? nowCount - thirtyDaysAgoRoleData[countField]
            : null;

        roleItems.push({
            nowCount,
            lastYearCount,
            aYearAgoCount,
            yearDifference,
            yearRatio: nowCount / lastYearCount,
            thirtyDayDifference,
            nameAbbrev: null,
            name: roleData.role[0].name,
        });
    }

    return [
        membershipItems.length && {
            type: 'section',
            label: locale.membershipsAndRoles.sectionTitles.membershipCategories,
        },
        { type: 'items', items: membershipItems },
        roleItems.length && {
            type: 'section',
            label: locale.membershipsAndRoles.sectionTitles.roles,
        },
        { type: 'items', items: roleItems },
    ].filter(x => x);
}

function getDataByCountry ({
    category,
    currentData,
    lastYearData,
    aYearAgoData,
    thirtyDaysAgoData,
    tejo,
    countries,
}) {
    if (!currentData?.data) return [];
    const allCountries = Object.keys(currentData.data).filter(id => id.length === 2);

    const countField = tejo ? 'countTEJO' : 'count';

    const items = [];
    const [categoryField, idField] = category.startsWith(CATEGORY_TYPE_MEM)
        ? ['membershipCategories', 'membershipCategoryId']
        : ['roles', 'roleId'];
    const categoryId = +category.substring(1);

    for (const country of allCountries) {
        const categoryData = currentData.data[country][categoryField].find(i => i[idField] === categoryId);
        if (!categoryData) continue;

        const lastYearCatData = (lastYearData?.data && lastYearData?.data[country])
            ? lastYearData.data[country][categoryField].find(i => i[idField] === categoryId)
            : null;
        const aYearAgoCatData = (aYearAgoData?.data && aYearAgoData?.data[country])
            ? aYearAgoData.data[country][categoryField].find(i => i[idField] === categoryId)
            : null;
        const thirtyDaysAgoCatData = (thirtyDaysAgoData?.data && thirtyDaysAgoData?.data[country])
            ? thirtyDaysAgoData.data[country][categoryField].find(i => i[idField] === categoryId)
            : null;

        const nowCount = categoryData[countField];
        const lastYearCount = lastYearCatData && lastYearCatData[countField];
        const aYearAgoCount = aYearAgoCatData && aYearAgoCatData[countField];
        const yearDifference = nowCount !== null && lastYearCount !== null
            ? nowCount - lastYearCount
            : null;
        const thirtyDayDifference = thirtyDaysAgoCatData !== null
            ? nowCount - thirtyDaysAgoCatData[countField]
            : null;

        items.push({
            nowCount,
            lastYearCount,
            aYearAgoCount,
            yearDifference,
            yearRatio: nowCount / lastYearCount,
            thirtyDayDifference,
            name: countries[country].name_eo,
        });
    }

    return [
        { type: 'items', items },
    ];
}

function MembersTable ({ currentDate, lastYearDate, aYearAgoDate, items }) {
    if (!items) return null;

    const currentYear = currentDate.split('-')[0];
    const lastYear = lastYearDate.split('-')[0];

    const num = n => typeof n === 'number' ? n.toLocaleString('fr-FR') : '—';
    const diffNum = n => typeof n === 'number'
        ? (n > 0 ? '+' : n < 0 ? '-' : '±') + n.toLocaleString('fr-FR')
        : '—';

    return (
        <div class="statistics-memberships-and-roles-items">
            <table class="count-table">
                <thead>
                    <tr>
                        <th>{currentYear}</th>
                        <th>{lastYear}</th>
                        <th>{locale.membershipsAndRoles.yearDiffColumn}</th>
                        <th>{locale.membershipsAndRoles.thirtyDayGrowthColumn}</th>
                        <th><date.renderer value={aYearAgoDate} /></th>
                        <th>{locale.membershipsAndRoles.itemColumn}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => {
                        if (item.type === 'section') {
                            return (
                                <tr key={i}>
                                    <th colSpan={5} className="list-title">
                                        {item.label}
                                    </th>
                                </tr>
                            );
                        } else if (item.type === 'items') {
                            return item.items.map(({
                                nowCount, lastYearCount, aYearAgoCount,
                                yearDifference, yearRatio,
                                thirtyDayDifference,
                                nameAbbrev, name,
                            }, j) => (
                                <tr key={`${i} ${j}`}>
                                    <td class="is-count">{num(nowCount)}</td>
                                    <td class="is-count">{num(lastYearCount)}</td>
                                    <td class="is-count">
                                        {diffNum(yearDifference)}
                                        {yearDifference
                                            ? ' (' + diffNum(Math.round((yearRatio - 1) * 100)) + '%)'
                                            : ''}
                                    </td>
                                    <td className="is-count">{num(thirtyDayDifference)}</td>
                                    <td class="is-count">{num(aYearAgoCount)}</td>
                                    <th class="category-label">
                                        {nameAbbrev && <b>{nameAbbrev}</b>}
                                        {' '}
                                        {name}
                                    </th>
                                </tr>
                            ));
                        }
                    })}
                </tbody>
            </table>
        </div>
    );
}
