import { h } from 'preact';
import { CircularProgress } from '@cpsdqs/yamdl';
import Page from '../../../components/page';
import Meta from '../../meta';
import { connect } from '../../../core/connection';
import { votes as locale } from '../../../locale';
import './results.less';

export default connect(({ matches }) => ['votes/voteResults', {
    id: matches[matches.length - 2][1],
}])((data, core, error) => ({ data, core, error }))(connect(({ matches }) => ['votes/vote', {
    id: matches[matches.length - 2][1],
    fields: ['config'],
}])((data, core, error) => ({ vote: data, voteError: error }))(class VoteResultsPage extends Page {
    render ({ data, error, vote, voteError }) {
        if (!data || !vote) {
            if (error || voteError) {
                return (
                    <div class="vote-results has-error">
                        {'' + (error || voteError)}
                    </div>
                );
            }

            return (
                <div class="vote-results is-loading">
                    <CircularProgress indeterminate />
                </div>
            );
        }

        return (
            <div class="vote-results">
                <Meta
                    title={locale.results.title} />
                <ResultTitle data={data} />
                <Pie layers={[
                    [
                        {
                            value: data.numBallots / data.numVoters,
                            label: locale.results.voters,
                            class: 's-a',
                        },
                        {
                            value: 1 - data.numBallots / data.numVoters,
                            label: locale.results.nonVoters,
                            class: 's-b',
                        },
                    ],
                    [
                        {
                            value: (data.numBallots - data.numBlankBallots) / data.numVoters,
                            phantom: true,
                        },
                        ('numBlankBallots' in data) && ({
                            value: data.numBlankBallots / data.numVoters,
                            label: locale.results.votersBlank,
                            class: 's-a1',
                        }),
                    ].filter(x => x),
                ]} />
            </div>
        );
    }
}));

function ResultTitle ({ data }) {
    return (
        <h1 class="result-title">
            {locale.results.resultTypes[data.result]}
        </h1>
    );
}

function isInCenteredRange (x, center, size) {
    return x >= center - size / 2 && x < center - size / 2;
}

function collideOccupiedRegions (y, regions, spacing) {
    for (const region of regions) {
        if (Math.abs(region - y) < spacing / 2) return true;
    }
    return false;
}

function layoutVerticalPieLabels (labels, radius, spacing) {
    for (const label of labels) {
        label._layoutPriority = Math.sin(label.vAngle);
    }
    const labelsByPriority = [...labels];
    labelsByPriority.sort((a, b) => b._layoutPriority - a._layoutPriority);

    const occupiedRegions = [];
    for (const l of labelsByPriority) {
        const projectedY = -1.2 * radius * Math.cos(l.vAngle);
        const moveSign = l.vAngle < Math.PI / 2 ? -1 : 1;

        let y = projectedY;
        while (collideOccupiedRegions(y, occupiedRegions, spacing)) {
            y += moveSign * 4;
        }

        l.y = y;
        occupiedRegions.push(y);
    }
}

function getPathForArcAngles (x, y, radius, sweepStart, sweepEnd, circle) {
    const startX = x + Math.cos(sweepStart) * radius;
    const startY = y + Math.sin(sweepStart) * radius;
    const endX = x + Math.cos(sweepEnd) * radius;
    const endY = y + Math.sin(sweepEnd) * radius;

    const largeArcFlag = sweepEnd > sweepStart + Math.PI ? '1' : '0';

    if (circle && Math.abs(endX - startX) + Math.abs(endY - startY) < 0.001) {
        return [
            `M ${x - radius} ${y}`,
            `A ${radius} ${radius} 0 1 1 ${x + radius} ${y}`,
            `A ${radius} ${radius} 0 1 1 ${x - radius} ${y}`,
        ].join(' ');
    } else {
        return [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        ].join(' ');
    }
}

function makePieHLabelLine (label, centerX, centerY, radius) {
    const angledPartDY = label.y - (-radius * Math.cos(label.vAngle));
    const dir = -Math.sign(label.x);

    const totalWidth = Math.abs(label.x) - Math.abs(radius * Math.sin(label.vAngle));
    const cornerPointX = centerX + label.x + dir * 4 + (totalWidth - Math.abs(angledPartDY)) * dir;

    let d = `M${centerX + label.x + dir * 4} ${centerY + label.y}`;
    if (angledPartDY) {
        d += `L${cornerPointX} ${centerY + label.y}`;
    }
    d += `L${centerX + radius * Math.cos(label.angle + Math.PI / 2)} ${centerY + radius * Math.sin(label.angle + Math.PI / 2)}`;

    return (
        <path d={d} class="label-line" strokeWidth={2} />
    );
}

/// Draws a pie chart
///
/// # Props
/// - layers: Slice[][] where Slice is an object:
///
///   `Slice { phantom: bool, value: number, class: string, label: string }`
function Pie ({ layers }) {
    const labels = [];

    const scale = Math.PI * 2;
    for (const layer of layers) {
        let r = 0;
        for (const item of layer) {
            if (!item.value) continue;
            const labelAngle = r + scale * item.value / 2;
            if (!item.phantom) labels.push({ angle: labelAngle, label: item.label });
            r += scale * item.value;
        }
    }

    labels.sort((a, b) => a.angle - b.angle);

    const labelsTop = [];
    const labelsBot = [];
    const labelsLeft = [];
    const labelsRight = [];

    const centerX = 300;
    const centerY = 200;
    const radius = 100;
    const spacing = 30;
    const weight = 40;

    const enableTopBottom = false; // TODO: handle these and set this to true

    for (const l of labels) {
        const eligibleForTop = isInCenteredRange(l.angle, Math.PI, Math.PI / 2);
        const eligibleForLeft = Math.cos(l.angle + Math.PI / 2) < 0;
        const eligibleForBot = isInCenteredRange(l.angle, 0, Math.PI / 2)
            || isInCenteredRange(l.angle, Math.PI * 2, Math.PI / 2);

        if (eligibleForTop && !labelsTop.length && enableTopBottom) {
            labelsTop.push(l);
        } else if (eligibleForBot && !labelsBot.length && enableTopBottom) {
            labelsBot.push(l);
        } else if (eligibleForLeft) {
            l.vAngle = Math.PI - l.angle;
            l.x = -1.5 * radius;
            labelsLeft.unshift(l);
        } else {
            l.vAngle = l.angle - Math.PI;
            l.x = 1.5 * radius;
            labelsRight.push(l);
        }
    }

    layoutVerticalPieLabels(labelsLeft, radius, spacing);
    layoutVerticalPieLabels(labelsRight, radius, spacing);

    const svgLayers = [];
    for (const layer of layers) {
        const layerContents = [];
        let r = 0;
        for (const item of layer) {
            if (!item.phantom) {
                const startAngle = Math.PI / 2 + r;
                const endAngle = Math.PI / 2 + r + Math.PI * 2 * item.value;
                const circle = item.value >= 1;

                const d = getPathForArcAngles(centerX, centerY, radius - weight / 2, startAngle, endAngle, circle);
                layerContents.push(<path d={d} class={item.class} style={item.style} strokeWidth={weight} />);
            }
            r += Math.PI * 2 * item.value;
        }

        svgLayers.push(<g class="pie-chart-layer">{layerContents}</g>);
    }

    const textLabels = [];
    const labelLines = [];

    for (const l of labelsLeft) {
        labelLines.push(makePieHLabelLine(l, centerX, centerY, radius));

        textLabels.push(
            <text x={centerX + l.x} y={centerY + l.y} textAnchor="end">
                {l.label}
            </text>
        );
    }
    for (const l of labelsRight) {
        labelLines.push(makePieHLabelLine(l, centerX, centerY, radius));

        textLabels.push(
            <text x={centerX + l.x} y={centerY + l.y} textAnchor="start">
                {l.label}
            </text>
        );
    }

    return (
        <svg class="result-pie-chart" width={centerX * 2} height={centerY * 2}>
            {svgLayers}
            {labelLines}
            {textLabels}
        </svg>
    );
}
