import { h } from 'preact';
import { Button, Checkbox, CircularProgress } from 'yamdl';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/compat';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Page from '../../../components/page';
import Meta from '../../meta';
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

function Statistics () {
    return (
        <div>
            <MembershipsAndRoles />
        </div>
    );
}

function useStatisticsHistory ({ _unmapped, beforeDate, afterDate, offset, limit }) {
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
        core.createTask('statistics/listStatistics', { _unmapped }, {
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
const CATEGORY_TOTAL_MEM_GIVING = '!memGiving';
const CATEGORY_TOTAL_MEM_NON_GIVING = '!memNonGiving';

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

    const navigate = ({ byFieldType, country, category }) => {
        setByFieldType(byFieldType);
        if (byFieldType === 'category') {
            setCountry(country);
        } else if (byFieldType === 'country') {
            setCategory(category);
        }
    };

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
                            class="category-selection"
                            outline
                            value={country}
                            onChange={setCountry}
                            items={Object.keys(currentData.data)
                                .sort((a, b) => {
                                    if (a === 'total') a = '';
                                    if (b === 'total') b = '';
                                    return a.localeCompare(b);
                                })
                                .map(id => ({
                                    value: id,
                                    label: id === 'total' ? (
                                        locale.countries.total
                                    ) : (
                                        (countries && countries[id]?.name_eo) || id
                                    ),
                                }))} />
                    </div>

                    <div class="view-demographics">
                        <div class="inner-card">
                            <div class="inner-title">{locale.membershipsAndRoles.demoAge}</div>
                            <AgeDemographics filter={ageDemoFilter} />
                        </div>
                    </div>

                    <MembersTable
                        navigate={navigate}
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
                            class="category-selection"
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
                        <div class="inner-card">
                            <div class="inner-title">{locale.membershipsAndRoles.demoAge}</div>
                            <AgeDemographics filter={ageDemoFilter} />
                        </div>
                    </div>

                    <MembersTable
                        navigate={navigate}
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

    const membershipGivingItems = [];
    const membershipNonGivingItems = [];
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

        const target = categoryData.membershipCategory[0].givesMembership
            ? membershipGivingItems
            : membershipNonGivingItems;
        target.push({
            nowCount,
            lastYearCount,
            aYearAgoCount,
            yearDifference,
            thirtyDayDifference,
            nameAbbrev: categoryData.membershipCategory[0].nameAbbrev || null,
            name: categoryData.membershipCategory[0].name,
            query: {
                country,
                category: CATEGORY_TYPE_MEM + catId,
                countField,
            },
            navigationTarget: { byFieldType: 'country', category: CATEGORY_TYPE_MEM + catId },
        });
    }

    const reduceSum = (a, b) => {
        const out = { ...a };
        for (const k of Object.keys(b)) {
            if (typeof b[k] === 'number') {
                out[k] = (out[k] || 0) + b[k];
            }
        }
        return out;
    };
    if (membershipGivingItems.length) {
        const membershipGivingTotal = membershipGivingItems.reduce(reduceSum, {});
        membershipGivingItems.push({
            ...membershipGivingTotal,
            name: locale.membershipsAndRoles.total,
            isTotal: true,
            query: { country, category: CATEGORY_TOTAL_MEM_GIVING, countField },
        });
    }
    if (membershipNonGivingItems.length) {
        const membershipNonGivingTotal = membershipNonGivingItems.reduce(reduceSum, {});
        membershipNonGivingItems.push({
            ...membershipNonGivingTotal,
            name: locale.membershipsAndRoles.total,
            isTotal: true,
            query: { country, category: CATEGORY_TOTAL_MEM_NON_GIVING, countField },
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
            query: {
                country,
                category: CATEGORY_TYPE_ROLE + roleId,
                countField,
            },
            navigationTarget: { byFieldType: 'country', category: CATEGORY_TYPE_ROLE + roleId },
        });
    }

    return [
        (membershipGivingItems.length + membershipNonGivingItems.length) && {
            type: 'section',
            label: locale.membershipsAndRoles.sectionTitles.membershipCategories,
        },
        membershipGivingItems.length && {
            type: 'section',
            label: locale.membershipsAndRoles.sectionTitles.membershipGivingCategories,
        },
        { type: 'items', items: membershipGivingItems },
        membershipNonGivingItems.length && {
            type: 'section',
            label: locale.membershipsAndRoles.sectionTitles.membershipNonGivingCategories,
        },
        { type: 'items', items: membershipNonGivingItems },
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
            query: {
                country,
                category,
                countField,
            },
            navigationTarget: { byFieldType: 'category', country },
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

function MembersTable ({ currentDate, lastYearDate, aYearAgoDate, items, navigate }) {
    if (!items) return null;

    const currentYear = currentDate.split('-')[0];
    const lastYear = lastYearDate.split('-')[0];

    const num = n => typeof n === 'number' ? n.toLocaleString('fr-FR') : '—';
    const diffNum = n => typeof n === 'number'
        ? (n > 0 ? '+' : n < 0 ? '-' : '±') + n.toLocaleString('fr-FR')
        : '—';

    const [sortByField, setSortByField] = useState(null);
    const [sortAsc, setSortAsc] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);

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
                                nameAbbrev, name, isTotal, query, navigationTarget,
                            }, j) => {
                                const itemKey = `${i} ${j}`;
                                const isExpanded = expandedItem === itemKey;
                                const onExpand = () => {
                                    if (isExpanded) setExpandedItem(null);
                                    else setExpandedItem(itemKey);
                                };

                                let expandedContents = null;
                                if (isExpanded) {
                                    expandedContents = (
                                        <tr key={itemKey + 'e'}>
                                            <td colSpan={6}>
                                                <ItemDetails
                                                    query={query}
                                                    currentDate={currentDate} />
                                            </td>
                                        </tr>
                                    );
                                }

                                const categoryLabel = (
                                    <span>
                                        {nameAbbrev && <b>{nameAbbrev}</b>}
                                        {' '}
                                        {name}
                                    </span>
                                );

                                return [
                                    <tr
                                        key={itemKey}
                                        class={'count-row' + (isTotal ? ' is-total' : '')}
                                        onClick={onExpand}>
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
                                            {navigationTarget ? (
                                                <a class="category-link" onClick={() => navigate(navigationTarget)}>
                                                    {categoryLabel}
                                                </a>
                                            ) : categoryLabel}
                                        </th>
                                    </tr>,
                                    expandedContents,
                                ];
                            });
                        }
                    })}
                </tbody>
            </table>
        </div>
    );
}

function doesItemMatchCategoryQuery (query, item) {
    if (query === 'total') return true;

    const itemId = 'membershipCategoryId' in item
        ? CATEGORY_TYPE_MEM + item.membershipCategoryId
        : CATEGORY_TYPE_ROLE + item.roleId;
    if (query === itemId) return true;

    if (item.membershipCategory) {
        const cat = item.membershipCategory[0];
        if (query === CATEGORY_TOTAL_MEM_GIVING && cat.givesMembership) return true;
        if (query === CATEGORY_TOTAL_MEM_NON_GIVING && !cat.givesMembership) return true;
    }
    return false;
}

function ItemDetails ({ query, currentDate }) {
    const [loadingHist, histError, histData] = useStatisticsHistory({
        _unmapped: true,
        beforeDate: currentDate,
        offset: 0,
        limit: 100,
    });

    if (loadingHist) return <div class="item-details"><CircularProgress indeterminate /></div>;
    if (histError) return <div class="item-details"><DisplayError error={histError} /></div>;

    const counts = [];
    for (const date of (histData?.items || [])) {
        const countryData = date.data[query.country];
        if (countryData) {
            let count = 0;

            for (const cat of countryData.membershipCategories) {
                if (doesItemMatchCategoryQuery(query.category, cat)) {
                    count += cat[query.countField];
                }
            }
            for (const role of countryData.roles) {
                if (doesItemMatchCategoryQuery(query.category, role)) {
                    count += role[query.countField];
                }
            }

            counts.push({ date: date.date, count });
        } else {
            counts.push({ date: date.date, count: 0 });
        }
    }
    counts.sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div class="item-details">
            <CountLineChart points={counts} />
        </div>
    );
}

function mapDateToMonotonic (date) {
    return date ? +new Date(date) : date;
}

function CountLineChart ({ points }) {
    const container = useRef(null);
    const [width, setWidth] = useState(100);
    const height = 270;
    const margin = 10;
    const marginLeft = 50;
    const marginBottom = 90;

    useEffect(() => {
        if (!container.current) return;
        setWidth(container.current.offsetWidth);
    }, [container.current]);

    const minX = mapDateToMonotonic(points[0]?.date) || 0;
    const maxX = mapDateToMonotonic(points[points.length - 1]?.date) || 0;
    let maxY = points.reduce((a, b) => Math.max(a, b.count), 1);
    let minY = points.reduce((a, b) => Math.min(a, b.count), maxY);

    const yRange = Math.max(maxY - minY, 1);
    maxY += yRange * 0.1;
    minY -= yRange * 0.1;

    const pixelsPerDay = (width - margin - marginLeft) / ((maxX - minX) / 86400000);
    const dateStride = Math.max(Math.floor(70 / pixelsPerDay), 1) * 86400000;
    const xAxis = [];
    for (let xDate = maxX; xDate > minX; xDate -= dateStride) {
        const normX = (xDate - minX) / (maxX - minX);
        const x = normX * (width - margin - marginLeft) + marginLeft;

        xAxis.push(
            <g
                key={xDate}
                class="date-label"
                transform={`translate(${x}, ${height - marginBottom + 10}) rotate(-45)`}>
                <text>
                    {date.stringify(xDate)}
                </text>
            </g>,
            <line
                key={xDate + 'line'}
                x1={x} x2={x} y1={margin} y2={height - marginBottom} class="grid-line" />
        );
    }
    xAxis.push(
        <line key="axis" class="axis-line" x1={marginLeft} x2={width - margin}
            y1={height - marginBottom} y2={height - marginBottom} />,
    );

    const pixelsPerY = (height - margin - marginBottom) / (maxY - minY);
    const yStride = Math.max(Math.floor(20 / pixelsPerY), 1);
    const yAxis = [];
    for (let y = Math.ceil(minY); y < maxY; y += yStride) {
        const normY = (y - minY) / (maxY - minY);
        const yPos = (1 - normY) * (height - margin - marginBottom) + margin;

        yAxis.push(
            <g
                key={y}
                class="count-label"
                transform={`translate(${marginLeft}, ${yPos})`}>
                <text x={-10}>
                    {y}
                </text>
                <line
                    key={y + 'line'}
                    x1={0} x2={width - margin - marginLeft} y1={0} y2={0} class="grid-line" />
            </g>
        );
    }
    yAxis.push(
        <line key="axis" class="axis-line" x1={marginLeft} x2={marginLeft}
            y1={margin} y2={height - marginBottom} />,
    );

    const pathD = [];
    for (const point of points) {
        const normX = (mapDateToMonotonic(point.date) - minX) / (maxX - minX);
        const normY = (point.count - minY) / (maxY - minY);
        pathD.push(pathD.length ? 'L' : 'M');
        pathD.push(
            normX * (width - margin - marginLeft) + marginLeft,
            (1 - normY) * (height - margin - marginBottom) + margin,
        );
    }

    return (
        <div ref={container}>
            <svg width={width} height={height} class="details-line-chart">
                <path d={pathD.join(' ')} class="chart-line" />
                {xAxis}
                {yAxis}
            </svg>
        </div>
    );
}
