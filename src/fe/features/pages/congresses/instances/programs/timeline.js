import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import moment from 'moment';
import { CircularProgress } from '@cpsdqs/yamdl';
import DynamicHeightDiv from '../../../../../components/dynamic-height-div';
import DisplayError from '../../../../../components/error';
import OverviewListItem from '../../../../../components/overview-list-item';
import { connect, coreContext } from '../../../../../core/connection';
import { congressPrograms as locale } from '../../../../../locale';
import { OVERVIEW_FIELDS } from './fields';
import './timeline.less';

/// Renders a timeline of program items.
///
/// # Props
/// - congress/instance: ids
/// - dateFrom/dateTo: congress date bounds
/// - tz: time zone
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
    }

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

    // item id -> item time bounds
    #itemBounds = new Map();

    getItemBounds (id) {
        return this.#itemBounds.get(id);
    }

    onLoadItemBounds (id, bounds) {
        this.#itemBounds.set(id, bounds);
        this.scheduleLayout();
    }

    scheduleLayout () {
        if (this.scheduledLayout) return;
        this.scheduledLayout = setTimeout(() => {
            this.scheduledLayout = null;
            this.forceUpdate();
        }, 50);
    }

    layout () {
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
            const bounds = this.getItemBounds(id);
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
                const bounds = this.getItemBounds(id);
                // const startTime = moment(bounds.start * 1000);
                // const endTime = moment(bounds.end * 1000);

                // const startHour = startTime.diff(refDate) / 3600000;
                // const endHour = endTime.diff(refDate) / 3600000;

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

    renderContents () {
        if (!this.state.items.length) {
            return <div class="day-view-status">{locale.timeline.empty}</div>;
        }

        const { congress, instance, tz } = this.props;

        const contents = [];

        const { regions, missingItems } = this.layout();
        for (const region of regions) {
            const regionNodes = [];

            const cols = region.items.length;
            let colIndex = 0;
            for (const col of region.items) {
                for (const item of col) {
                    regionNodes.push(
                        <DayViewItem
                            col={colIndex}
                            cols={cols}
                            start={item.start}
                            end={item.end}
                            congress={congress}
                            instance={instance}
                            key={item.id}
                            id={item.id}
                            tz={tz}
                            onLoadBounds={bounds => this.onLoadItemBounds(item.id, bounds)}
                            onGetItemLink={(id) => {
                                return `/kongresoj/${congress}/okazigoj/${instance}/programeroj/${id}`;
                            }} />
                    );
                }
                colIndex++;
            }

            const height = region.end - region.start;
            contents.push(
                <div class="day-view-region" style={{ height }}>
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
                    onLoadBounds={bounds => this.onLoadItemBounds(id, bounds)} />
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
                    <div class="day-view-contents">
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
            this.props.onLoadBounds({
                start: thisData.timeFrom,
                end: thisData.timeTo,
            });
        }
    }

    render ({ congress, instance, id, tz, col, cols, start, end, data, onGetItemLink }) {
        if (!data || !cols) return null;

        return (
            <div class="timeline-item" style={{
                width: `${100 / cols}%`,
                left: `${(col / cols) * 100}%`,
                top: start,
                height: end - start,
            }}>
                <OverviewListItem
                    compact view="congresses/program"
                    skipAnimation
                    id={id}
                    options={{ congress, instance }}
                    selectedFields={SELECTED_FIELDS}
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
