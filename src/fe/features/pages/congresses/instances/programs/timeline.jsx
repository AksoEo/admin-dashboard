import { h } from 'preact';
import { Fragment, PureComponent } from 'preact/compat';
import moment from 'moment';
import { CircularProgress } from 'yamdl';
import DynamicHeightDiv from '../../../../../components/layout/dynamic-height-div';
import TinyProgress from '../../../../../components/controls/tiny-progress';
import DisplayError from '../../../../../components/utils/error';
import OverviewListItem from '../../../../../components/lists/overview-list-item';
import { connect, coreContext } from '../../../../../core/connection';
import {
    congressPrograms as locale,
    congressLocations as locationsLocale,
} from '../../../../../locale';
import { OVERVIEW_FIELDS } from './fields';
import './timeline.less';

/**
 * Renders a timeline of program items.
 *
 * # Props
 * - congress/instance: ids
 * - dateFrom/dateTo: congress date bounds
 * - tz: time zone
 * - byRoom: bool
 */
export default class ProgramTimeline extends PureComponent {
    state = {
        date: null,
    };

    componentDidMount () {
        this.setState({
            date: this.props.dateFrom,
        });
    }

    render ({ congress, instance, tz }, { date }) {
        return (
            <div class="congress-program-timeline">
                <TimelineDatePicker
                    value={date}
                    onChange={date => this.setState({ date })}
                    dateFrom={this.props.dateFrom}
                    dateTo={this.props.dateTo}
                    tz={tz} />
                <TimelineDayView
                    byRoom={this.props.byRoom}
                    congress={congress}
                    instance={instance}
                    date={date}
                    tz={tz} />
            </div>
        );
    }
}

class TimelineDatePicker extends PureComponent {
    loadIfNull () {
        if (!this.props.value && this.props.dateFrom) {
            this.props.onChange(this.props.dateFrom);
        }
    }

    componentDidMount () {
        this.loadIfNull();
    }

    componentDidUpdate () {
        this.loadIfNull();
    }

    render ({ value, onChange, dateFrom, dateTo }) {
        const dates = [];
        const index = moment(dateFrom);
        const end = moment(dateTo);
        let lastMonth = null;
        while (index <= end) {
            const isToday = !moment().isSame(index, 'd');
            const isSelected = index.isSame(value, 'd');
            let month = index.format('MMM');
            if (month === lastMonth) month = null;
            else lastMonth = month;
            const date = index.format('D');
            const val = index.format('YYYY-MM-DD');

            dates.push(
                <button
                    disabled={isSelected}
                    onClick={() => onChange(val)}
                    class={'picker-date' + (isToday ? ' is-today' : '')}>
                    <div class="date-month">
                        {month}
                    </div>
                    <div class="date-date">
                        {date}
                    </div>
                </button>
            );

            index.add(1, 'd');
        }

        return (
            <div class="timeline-date-picker">
                {dates}
            </div>
        );
    }
}

class TimelineDayView extends PureComponent {
    state = {
        loading: false,
        error: null,
        items: null,
    };

    static contextType = coreContext;

    #updateView;

    createUpdateView () {
        if (this.#updateView) this.#updateView.drop();
        this.#updateView = this.context.createDataView('congresses/sigPrograms', {
            congress: this.props.congress,
            instance: this.props.instance,
        });
        this.#updateView.on('update', () => this.load());
    }

    load () {
        this.setState({ loading: true });
        const loadingDate = this.props.date;
        this.#doLoad().then(items => {
            if (loadingDate !== this.props.date) return;
            this.setState({ items, error: null });
        }).catch(error => {
            console.error(error); // eslint-disable-line no-console
            this.setState({ error });
        }).then(() => this.setState({ loading: false }));
    }

    #doLoad = async () => {
        const options = {
            congress: this.props.congress,
            instance: this.props.instance,
        };
        const { date, tz } = this.props;
        if (!date) return null;

        const lowerBound = moment.tz(date, tz);
        const upperBound = moment(lowerBound).add(1, 'd');

        const dayRange = [lowerBound.unix(), upperBound.unix()];

        let total = null;
        let count = 0;
        const items = [];

        while (count < total || total === null) {
            const res = await this.context.createTask('congresses/listPrograms', options, {
                jsonFilter: {
                    filter: {
                        $or: [
                            { timeFrom: { $range: dayRange } },
                            { timeTo: { $range: dayRange } },
                        ],
                    },
                },
                offset: count,
                limit: 100,
            }).runOnceAndDrop();

            total = res.total;
            count += res.items.length;
            if (count < total && res.items.length === 0) break;

            items.push(...res.items);
        }
        return items;
    };

    componentDidMount () {
        this.load();
        this.createUpdateView();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.date !== this.props.date) {
            this.load();
            this.createUpdateView();
        }
    }

    componentWillUnmount () {
        if (this.#updateView) this.#updateView.drop();
    }

    // item id -> item time bounds / location
    #itemInfo = new Map();

    getItemInfo (id) {
        return this.#itemInfo.get(id);
    }

    onLoadItemInfo (id, bounds) {
        this.#itemInfo.set(id, bounds);
        this.scheduleLayout();
    }

    scheduleLayout () {
        if (this.scheduledLayout) return;
        this.scheduledLayout = setTimeout(() => {
            this.scheduledLayout = null;
            this.forceUpdate();
        }, 50);
    }

    layoutTimeline () {
        const { items } = this.state;

        // const refDate = moment.tz(this.props.date, this.props.tz);

        // lay out items in columns, such that overlapping items are simply put beside existing
        // ones.
        // these columns are split into regions, such that items that don't have any overlap
        // can make use of the full width of the screen.

        // timestamps at which some event starts or ends
        const splits = [];
        const eventsStartingAtSplit = new Map();
        const eventsEndingAtSplit = new Map();

        const addSplit = time => {
            if (!splits.includes(time)) {
                splits.push(time);
                if (!eventsStartingAtSplit.has(time)) eventsStartingAtSplit.set(time, []);
                if (!eventsEndingAtSplit.has(time)) eventsEndingAtSplit.set(time, []);
            }
        };
        const missingItems = [];
        for (const id of items) {
            const bounds = this.getItemInfo(id);
            if (!bounds) {
                missingItems.push(id);
                continue;
            }
            addSplit(bounds.start);
            addSplit(bounds.end);
            eventsStartingAtSplit.get(bounds.start).push(id);
            eventsEndingAtSplit.get(bounds.end).push(id);
        }
        splits.sort((a, b) => a - b); // sort ascending

        const itemHeight = 96;
        const minHourHeight = 20;

        let y = 0;
        const splitsY = new Map(); // mapping from split to Y offset
        let lastT = null;
        for (const t of splits) {
            const deltaHours = (lastT !== null) ? (t - lastT) / 3600 : 0;
            lastT = t;
            const splitHasItem = (lastT !== null) ? !!eventsEndingAtSplit.get(t).length : false;
            if (splitHasItem) {
                y += Math.max(minHourHeight * deltaHours, itemHeight);
            } else {
                y += minHourHeight * deltaHours;
            }
            splitsY.set(t, y);
        }

        const regions = [[]];
        const occupiedColumns = [];
        for (const t of splits) {
            const ending = eventsEndingAtSplit.get(t);

            for (const id of ending) {
                // free the column occupied by this event
                const col = occupiedColumns.indexOf(id);
                if (col < 0) continue;
                occupiedColumns[col] = null;
            }

            // if all columns are free, then this is the end of a region
            const isEndOfRegion = occupiedColumns.reduce((a, b) => a === null && b === null, true);
            if (isEndOfRegion && regions[regions.length - 1].length) {
                regions.push([]);
                occupiedColumns.splice(0); // clear
            }

            const region = regions[regions.length - 1];
            const starting = eventsStartingAtSplit.get(t);

            for (const id of starting) {
                // find a free column and occupy it
                const freeCol = occupiedColumns.indexOf(null);
                const bounds = this.getItemInfo(id);

                const start = splitsY.get(bounds.start);
                const end = splitsY.get(bounds.end);

                const item = {
                    id,
                    start,
                    end,
                };

                const occupy = bounds.start < bounds.end;

                if (freeCol >= 0) {
                    if (occupy) occupiedColumns[freeCol] = id;
                    region[freeCol].push(item);
                } else {
                    // no free column; add one
                    if (occupy) occupiedColumns.push(id);
                    else occupiedColumns.push(null);
                    region.push([item]);
                }
            }
        }

        const outRegions = [];
        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (!region.length) continue;
            let start = Infinity;
            let end = -Infinity;
            for (const col of region) {
                for (const item of col) {
                    start = Math.min(start, item.start);
                    end = Math.max(end, item.end);
                }
            }

            outRegions.push({
                items: region,
                start,
                end,
            });
        }

        return { regions: outRegions, missingItems };
    }

    layoutByRoom () {
        const { items } = this.state;
        const missingItems = [];

        const locations = {};
        let minBound = Infinity;
        let maxBound = -Infinity;

        for (const id of items) {
            const info = this.getItemInfo(id);
            if (!info) {
                missingItems.push(id);
                continue;
            }

            if (!locations[info.location]) locations[info.location] = [];
            locations[info.location].push({ id, start: info.start, end: info.end });

            if (info.start < minBound) minBound = info.start;
            if (info.end > maxBound) maxBound = info.end;
        }

        for (const k in locations) {
            locations[k].sort((a, b) => a.start - b.start);
        }

        const hourHeight = 40;

        const region = {
            items: [],
            start: 0,
            end: hourHeight * (maxBound - minBound) / 3600,
            timeStart: minBound,
            timeEnd: maxBound,
            locs: Object.keys(locations),
        };

        for (const k in locations) {
            const events = locations[k];
            const col = [];
            for (const event of events) {
                col.push({
                    id: event.id,
                    start: hourHeight * (event.start - minBound) / 3600,
                    end: hourHeight * (event.end - minBound) / 3600,
                });
            }
            region.items.push(col);
        }

        const regions = [region];
        return { regions, missingItems, isByRoom: true, hourHeight };
    }

    layout () {
        if (this.props.byRoom) return this.layoutByRoom();
        return this.layoutTimeline();
    }

    renderContents () {
        if (!this.state.items.length) {
            return <div class="day-view-status">{locale.timeline.empty}</div>;
        }

        const { congress, instance, tz } = this.props;

        const contents = [];

        const { regions, missingItems, isByRoom, hourHeight } = this.layout();
        const ROOMS_MIN_COL_WIDTH = 40;
        const ROOMS_WEIGHT = 4;

        if (isByRoom) {
            const { locs } = regions[0];
            contents.push(
                <div class="day-view-header" style={{
                    minWidth: (locs.length * ROOMS_WEIGHT + 1) * ROOMS_MIN_COL_WIDTH,
                }}>
                    {locs.map((loc, i) => {
                        return (
                            <LocationHeader
                                key={i}
                                col={1 + i * 4}
                                cols={locs.length * ROOMS_WEIGHT + 1}
                                weight={4}
                                congress={congress}
                                instance={instance}
                                id={loc} />
                        );
                    })}
                </div>
            );
        }

        for (const region of regions) {
            const regionNodes = [];

            let cols = region.items.length;
            let colIndex = 0;
            let colWeight = 1;

            if (isByRoom) {
                colWeight = ROOMS_WEIGHT;
                colIndex++;
                cols = cols * colWeight + 1;

                regionNodes.push(
                    <HoursOfTheDay
                        tz={tz}
                        cols={cols}
                        start={region.timeStart}
                        end={region.timeEnd}
                        hourHeight={hourHeight} />
                );
            }

            for (const col of region.items) {
                let prevStart = null;
                let prevEnd = null;
                let overlap = 0;

                for (const item of col) {
                    const isOverlapping = item.start < prevEnd;
                    if (isOverlapping) overlap++;
                    else overlap = 0;
                    const start = Math.max(item.start, prevStart + 10);
                    prevStart = start;
                    prevEnd = item.end;

                    regionNodes.push(
                        <DayViewItem
                            short={this.props.byRoom}
                            col={colIndex}
                            cols={cols}
                            weight={colWeight}
                            start={start}
                            end={item.end}
                            overlap={overlap}
                            congress={congress}
                            instance={instance}
                            key={item.id}
                            id={item.id}
                            tz={tz}
                            onLoadInfo={info => this.onLoadItemInfo(item.id, info)}
                            onGetItemLink={(id) => {
                                return `/kongresoj/${congress}/okazigoj/${instance}/programeroj/${id}`;
                            }} />
                    );
                }
                colIndex += colWeight;
            }

            const minWidth = isByRoom ? cols * ROOMS_MIN_COL_WIDTH : null;
            const height = region.end - region.start;
            contents.push(
                <div class="day-view-region" style={{ minWidth, height }}>
                    {regionNodes}
                </div>
            );
        }

        for (const id of missingItems) {
            contents.push(
                <DayViewItem
                    congress={congress}
                    instance={instance}
                    key={id}
                    id={id}
                    onLoadInfo={info => this.onLoadItemInfo(id, info)} />
            );
        }

        return contents;
    }

    render (_, { loading, error, items }) {
        return (
            <DynamicHeightDiv class="timeline-day-view">
                {loading ? (
                    <div class="day-view-status">
                        <CircularProgress indeterminate />
                    </div>
                ) : error ? (
                    <div class="day-view-status">
                        <DisplayError error={error} />
                    </div>
                ) : items ? (
                    <div class={'day-view-contents' + (this.props.byRoom ? ' is-scrollable' : '')}>
                        {this.renderContents()}
                    </div>
                ) : null}
                <div class="day-view-bottom-padding" />
            </DynamicHeightDiv>
        );
    }
}

const DayViewItem = connect(({ congress, instance, id }) =>
    ['congresses/program', { congress, instance, id }])(data => ({
    data,
}))(class DayViewItem extends PureComponent {
    componentDidUpdate (prevProps) {
        const prevData = prevProps.data || {};
        const thisData = this.props.data || {};
        if (prevData.timeFrom !== thisData.timeFrom || prevData.timeTo !== thisData.timeTo) {
            this.props.onLoadInfo({
                start: thisData.timeFrom,
                end: thisData.timeTo,
                location: thisData.location,
            });
        }
    }

    render ({
        col, cols, weight, overlap,
        congress,
        instance,
        id, tz,
        start, end, data,
        onGetItemLink,
    }) {
        if (!data || !cols) return null;

        const height = end - start;

        let fields = SELECTED_FIELDS;
        if (this.props.short) {
            fields = SELECTED_FIELDS_SHORT;
            if (height > 40) {
                fields = SELECTED_FIELDS_LESS_SHORT;
            }
        }

        const dataCol = Math.floor(col / weight);

        return (
            <div class="timeline-item" style={{
                width: `calc(${100 / cols * weight}% - ${overlap * 20}px)`,
                left: `calc(${(col / cols) * 100}% + ${overlap * 20}px)`,
                top: start,
                height,
            }} data-col={dataCol}>
                <OverviewListItem
                    compact view="congresses/program"
                    skipAnimation
                    id={id}
                    options={{ congress, instance }}
                    selectedFields={fields}
                    fields={OVERVIEW_FIELDS}
                    index={0}
                    locale={locale.fields}
                    userData={{ congress, instance, tz }}
                    onGetItemLink={onGetItemLink} />
            </div>
        );
    }
});

const SELECTED_FIELDS = ['title', 'timeLoc', 'description'].map(x => ({ id: x, sorting: 'none' }));
const SELECTED_FIELDS_SHORT = ['title'].map(x => ({ id: x, sorting: 'none' }));
const SELECTED_FIELDS_LESS_SHORT = ['title', 'time'].map(x => ({ id: x, sorting: 'none' }));

function HoursOfTheDay ({ cols, start, end, hourHeight, tz }) {
    const hours = [];
    let current = Math.floor(start / 3600) * 3600;
    let y = (current - start) / 3600 * hourHeight;

    while (current <= end) {
        hours.push(
            <div class="hour-item" style={{
                top: y,
                height: hourHeight,
            }}>
                <div class="inner-label" style={{
                    width: `${100 / cols}%`,
                }}>
                    {moment(current * 1000).tz(tz || 'UTC').format('HH:mm')}
                </div>
            </div>
        );
        current += 3600;
        y += hourHeight;
    }

    return (
        <Fragment>
            {hours}
        </Fragment>
    );
}

function LocationHeader ({ congress, instance, id, col, cols, weight }) {
    if (id === 'null') {
        return (
            <div class="location-header is-nowhere" style={{
                left: `${(col / cols) * 100}%`,
                width: `${100 / cols * weight}%`,
            }}>
                {locationsLocale.locatedWithinNowhere}
            </div>
        );
    } else {
        return (
            <RealLocationHeader
                congress={congress}
                instance={instance}
                id={id}
                col={col}
                cols={cols}
                weight={weight} />
        );
    }
}

const RealLocationHeader = connect(({ congress, instance, id }) => [
    'congresses/location', { congress, instance, id },
])(data => ({ data }))(function LocationHeader ({ col, cols, weight, data }) {
    let contents = <TinyProgress />;
    if (data) {
        contents = data.name;
    }

    return (
        <div class="location-header" style={{
            left: `${(col / cols) * 100}%`,
            width: `${100 / cols * weight}%`,
        }}>
            {contents}
        </div>
    );
});
