import { h } from 'preact';
import { Button, Checkbox, CircularProgress } from 'yamdl';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/compat';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
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
    const [category, setCategory] = useState('total');
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

    const [newestDate, setNewestDate] = useState(null);

    useEffect(() => {
        if (histData && !currentDate) {
            setCurrentDate(histData.items[0] || null);
        }

        if (histData) {
            const newestHistDate = new Date(histData.items[0]);
            if (!newestDate || newestHistDate > newestDate) {
                setNewestDate(newestHistDate);
            }
        }
    }, [histData, currentDate]);
    useEffect(() => {
        if (currentData && !category) {
            setCategory(getAllCategoriesAndRolesAsSelectItems(currentData.data)[0]?.value);
        }
    }, [currentData, category]);

    const showTejoCheckboxId = Math.random().toString(36);
    const ageDemoFilter = useMemo(() => {
        if (byFieldType === 'category') {
            if (country === 'total') return {};
            return {
                feeCountry: country,
            };
        } else if (byFieldType === 'country') {
            if (category === 'total') return {};
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

    let contents;
    if (histError) {
        contents = <DisplayError error={histError} />;
    } else if (dataError) {
        contents = <DisplayError error={dataError} />;
    } else if (loadingHist || loadingData) {
        contents = (
            <div class="inner-view is-loading">
                <CircularProgress indeterminate />
            </div>
        );
    } else if (!histData || !currentData) {
        contents = (
            <div class="inner-view is-empty">
                {locale.membershipsAndRoles.noDataAvailable}
            </div>
        );
    } else {
        contents = (
            byFieldType === 'category' ? (
                <div class="inner-view">
                    <div class="view-controls">
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
                    </div>

                    <div class="view-demographics">
                        <AgeDemographics filter={ageDemoFilter} />
                    </div>

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
                <div class="inner-view">
                    <div class="view-controls">
                        <Select
                            outline
                            value={category}
                            onChange={setCategory}
                            items={[
                                {
                                    value: 'total',
                                    label: locale.membershipsAndRoles.allCategories,
                                },
                            ].concat(getAllCategoriesAndRolesAsSelectItems(currentData.data))} />
                    </div>

                    <div class="view-demographics">
                        <AgeDemographics filter={ageDemoFilter} />
                    </div>

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
            ) : null
        );
    }

    const goToPrevDay = () => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1);
        setCurrentDate(date.toISOString().split('T')[0]);
    };
    const goToNextDay = () => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + 1);
        setCurrentDate(date.toISOString().split('T')[0]);
    };
    const canGoToNextDay = !newestDate
        || newestDate > new Date(currentDate);

    return (
        <div class="statistics-memberships-and-roles">
            <div class="hist-date-selector">
                <Button icon small onClick={goToPrevDay}>
                    <ChevronLeftIcon />
                </Button>
                <date.editor
                    outline
                    max={newestDate}
                    value={currentDate}
                    onChange={setCurrentDate} />
                <Button icon small onClick={goToNextDay} disabled={!canGoToNextDay}>
                    <ChevronRightIcon />
                </Button>
            </div>
            <div class="display-selector">
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
                <div class="tejo-selector">
                    <Checkbox
                        id={showTejoCheckboxId}
                        checked={showTejo}
                        onChange={setShowTejo}/>
                    {' '}
                    <label htmlFor={showTejoCheckboxId}>
                        {locale.membershipsAndRoles.showTejo}
                    </label>
                </div>
            </div>
            {contents}
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

    if (loading) {
        return (
            <div class="statistics-demographics is-loading">
                <CircularProgress indeterminate />
            </div>
        );
    }
    if (error) {
        return (
            <div class="statistics-demographics is-error">
                <DisplayError error={error} />
            </div>
        );
    }

    return (
        <div class="statistics-demographics">
            <div class="bucket-bars" style={{ '--max': max }}>
                {buckets.map((bucket, i) => (
                    <div class="bucket-bar" key={i} style={{ '--index': i }}>
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
    const all = category === 'total';

    const categoryFields = all ? [
        ['membershipCategories', 'membershipCategoryId'],
        ['roles', 'roleId'],
    ] : [[categoryField, idField]];

    for (const country of allCountries) {
        let nowCount = 0;
        let lastYearCount = null;
        let aYearAgoCount = null;
        let thirtyDaysAgoCount = null;
        for (const [categoryField, idField] of categoryFields) {
            const getCount = a => a
                .filter(i => all || i[idField] === categoryId)
                .map(i => i[countField])
                .reduce((a, b) => a + b, 0);

            const nowCatCount = (currentData?.data && currentData?.data[country])
                ? getCount(currentData.data[country][categoryField])
                : null;
            const lastYearCatCount = (lastYearData?.data && lastYearData?.data[country])
                ? getCount(lastYearData.data[country][categoryField])
                : null;
            const aYearAgoCatCount = (aYearAgoData?.data && aYearAgoData?.data[country])
                ? getCount(aYearAgoData.data[country][categoryField])
                : null;
            const thirtyDaysAgoCatCount = (thirtyDaysAgoData?.data && thirtyDaysAgoData?.data[country])
                ? getCount(thirtyDaysAgoData.data[country][categoryField])
                : null;

            if (Number.isFinite(nowCatCount)) {
                nowCount += nowCatCount;
            }
            if (Number.isFinite(lastYearCatCount)) {
                lastYearCount ||= 0;
                lastYearCount += lastYearCatCount;
            }
            if (Number.isFinite(aYearAgoCatCount)) {
                aYearAgoCount ||= 0;
                aYearAgoCount += aYearAgoCatCount;
            }
            if (Number.isFinite(thirtyDaysAgoCatCount)) {
                thirtyDaysAgoCount ||= 0;
                thirtyDaysAgoCount += thirtyDaysAgoCatCount;
            }
        }

        if (!nowCount) continue;

        const yearDifference = lastYearCount !== null
            ? nowCount - lastYearCount
            : null;
        const thirtyDayDifference = thirtyDaysAgoCount !== null
            ? nowCount - thirtyDaysAgoCount
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

function MembersTableHeader ({ onClick, sorting, children }) {
    return (
        <th class={'members-th-item' + (sorting ? ' is-sorted' : '')} onClick={onClick}>
            <div class="inner-contents">
                <span class="inner-label">
                    {children}
                </span>
                {sorting === 'asc' ? (
                    <span class="inner-sorting">
                        <KeyboardArrowUpIcon />
                    </span>
                ) : sorting === 'desc' ? (
                    <span class="inner-sorting">
                        <KeyboardArrowDownIcon />
                    </span>
                ) : <span class="inner-sorting"></span>}
            </div>
        </th>
    );
}

function MembersTable ({ currentDate, lastYearDate, aYearAgoDate, items }) {
    if (!items) return null;

    const currentYear = currentDate.split('-')[0];
    const lastYear = lastYearDate.split('-')[0];

    const num = n => typeof n === 'number' ? n.toLocaleString('fr-FR') : '—';
    const diffNum = n => typeof n === 'number'
        ? (n > 0 ? '+' : n < 0 ? '-' : '±') + n.toLocaleString('fr-FR')
        : '—';

    const [sortByField, setSortByField] = useState(null);
    const [sortAsc, setSortAsc] = useState(false);

    const setSorting = field => () => {
        if (sortByField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortByField(field);
            setSortAsc(false);
        }
    };
    const sortingProps = field => ({
        onClick: setSorting(field),
        sorting: sortByField === field ? (sortAsc ? 'asc' : 'desc') : null,
    });

    let sortedItems = items;
    if (sortByField) {
        sortedItems = items.filter(x => x.type === 'items').flatMap(x => x.items);
        sortedItems = sortedItems.sort((a, b) => {
            const aVal = a[sortByField];
            const bVal = b[sortByField];
            return sortAsc ? aVal - bVal : bVal - aVal;
        });
        sortedItems = [{ type: 'items', items: sortedItems }];
    }

    return (
        <div class="statistics-memberships-and-roles-items">
            <table class="count-table">
                <thead>
                    <tr>
                        <MembersTableHeader {...sortingProps('nowCount')}>
                            {currentYear}
                        </MembersTableHeader>
                        <MembersTableHeader {...sortingProps('lastYearCount')}>
                            {lastYear}
                        </MembersTableHeader>
                        <MembersTableHeader {...sortingProps('yearDifference')}>
                            {locale.membershipsAndRoles.yearDiffColumn}
                        </MembersTableHeader>
                        <MembersTableHeader {...sortingProps('thirtyDayDifference')}>
                            {locale.membershipsAndRoles.thirtyDayGrowthColumn}
                        </MembersTableHeader>
                        <MembersTableHeader {...sortingProps('aYearAgoCount')}>
                            <date.renderer value={aYearAgoDate} />
                        </MembersTableHeader>
                        <MembersTableHeader
                            sorting={!sortByField ? 'desc' : null}
                            onClick={() => {
                                setSortByField(null);
                            }}>
                            {locale.membershipsAndRoles.itemColumn}
                        </MembersTableHeader>
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.map((item, i) => {
                        if (item.type === 'section') {
                            return (
                                <tr key={i}>
                                    <th colSpan={6} className="list-title">
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
