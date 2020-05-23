import moment from 'moment';

function TimespanRenderer ({ value }) {
    if (typeof value !== 'number') return null;
    return moment.duration(value * 1000).humanize();
}

export default {
    inlineRenderer: TimespanRenderer,
    renderer: TimespanRenderer,
};
