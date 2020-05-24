import { data as locale } from '../../locale';

function TimespanRenderer ({ value }) {
    if (typeof value !== 'number') return null;

    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);

    const out = [];
    if (days) out.push(locale.timespanUnits.d(days));
    if (hours) out.push(locale.timespanUnits.h(hours));
    if (minutes) out.push(locale.timespanUnits.m(minutes));
    if (seconds || !out.length) out.push(locale.timespanUnits.s(seconds));

    return out.join(', ');
}

function TimespanEditor ({ value, onChange }) {
    return 'todo';
}

export default {
    inlineRenderer: TimespanRenderer,
    renderer: TimespanRenderer,
    editor: TimespanEditor,
};
