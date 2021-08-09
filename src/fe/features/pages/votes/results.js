import { h, Component } from 'preact';
import dagre from 'dagre';
import { useState } from 'preact/compat';
import { Button, CircularProgress } from 'yamdl';
import CheckIcon from '@material-ui/icons/Check';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Page from '../../../components/page';
import Meta from '../../meta';
import { connect, coreContext } from '../../../core/connection';
import { IdUEACode } from '../../../components/data/uea-code';
import { votes as locale } from '../../../locale';
import './results.less';

export default connect(({ matches }) => ['votes/voteResults', {
    id: matches.vote[1],
}])((data, core, error) => ({ data, core, error }))(connect(({ matches }) => ['votes/vote', {
    id: matches.vote[1],
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

        const stats = [];
        if ('electionQuota' in data) {
            stats.push(locale.results.electionQuota(data.electionQuota));
        }
        if ('majorityBallotsOkay' in data) {
            stats.push(locale.results.majorityBallotsOkay(data.majorityBallotsOkay));
            stats.push(locale.results.majorityVotersOkay(data.majorityVotersOkay));
            stats.push(locale.results.majorityOkay(data.majorityOkay));
        }

        const turnout = (
            <Pie layers={[
                [
                    {
                        value: data.numBallots / data.numVoters,
                        label: locale.results.voters(data.numBallots),
                        class: 's-a',
                    },
                    {
                        value: 1 - data.numBallots / data.numVoters,
                        label: locale.results.nonVoters(data.numVoters - data.numBallots),
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
                        label: locale.results.votersBlank(data.numBlankBallots),
                        class: 's-a1',
                    }),
                ].filter(x => x),
            ]} />
        );

        let voteOptions = vote.type === 'yn' || vote.type === 'ynb'
            ? [
                { type: 'simple', name: locale.results.optionYes, description: null },
                { type: 'simple', name: locale.results.optionNo, description: null },
                vote.type === 'ynb' && { type: 'simple', name: locale.results.optionBlank, description: null },
            ].filter(x => x)
            : vote.config.options || [];

        if (data.optsOrdered) {
            voteOptions = data.optsOrdered.map(({ opt }) => voteOptions[opt]);
        }

        const tally = (
            <Bar
                ymax={data.numBallots}
                items={voteOptions.map((option, i) => ({
                    name: <VoteOptionName option={option} />,
                    value: data.tally ? data.tally[i] : null,
                    chosen: (data.optsChosen || []).includes(i),
                    description: [
                        (data.optsExcludedByMentionThreshold || []).includes(i)
                            ? locale.results.excludedByMentionThreshold
                            : '',
                        (data.optsEqual || []).includes(i)
                            ? locale.results.isEqualOpt
                            : '',
                    ].filter(x => x).join(' · '),
                }))}
                showPercentage={!!data.tally} />
        );

        const rounds = data.rounds
            ? <Rounds type={vote.type} ballots={data.numBallots} rounds={data.rounds} options={voteOptions} />
            : null;

        return (
            <div class="vote-results">
                <Meta
                    title={locale.results.title} />
                <ResultTitle data={data} />
                {stats.map((stat, i) => (<div key={i} class="stat-line">{stat}</div>))}
                {turnout ? <h3>{locale.results.turnout}</h3> : null}
                {turnout}
                {tally ? <h3>{locale.results.tally}</h3> : null}
                {tally}
                {rounds ? <h3>{locale.results.rounds}</h3> : null}
                {rounds}
            </div>
        );
    }
}));

function ResultTitle ({ data }) {
    return (
        <h1 class="result-title">
            {('result' in data)
                ? locale.results.resultTypes[data.result]
                : locale.results.resultTypes.success}
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
        <svg class="result-pie-chart" viewBox={`0 0 ${centerX * 2} ${centerY * 2}`}>
            {svgLayers}
            {labelLines}
            {textLabels}
        </svg>
    );
}

/// Draws a bar chart.
///
/// # Props
/// - ymax: max y
/// - items: Item[] where `Item { name: Node, value: number, chosen: bool, description: Node }`
/// - showPercentage: if true, will show percentage
function Bar ({ ymax, items, showPercentage }) {
    const contents = [];

    for (const item of items) {
        const percentage = item.value !== null
            ? (ymax !== 0 ? item.value / ymax : 0)
            : 1;

        contents.push(
            <div class={'bar-chart-item ' + (item.chosen ? 'was-chosen' : '')}>
                <div class="item-name">{item.name}</div>
                <div class="item-value">
                    {item.value}
                    {showPercentage ? ` (${+percentage.toFixed(2) * 100}%)` : ''}
                </div>
                <div class="item-description">{item.description}</div>
                {item.chosen ? <div class="item-chosen-check"><CheckIcon /></div> : null}
                <div class="item-bar" style={{ width: `${percentage * 100}%` }} />
            </div>
        );
    }

    return (
        <div class="result-bar-chart">
            {contents}
        </div>
    );
}

/// Renders the name of a vote option.
function VoteOptionName ({ option }) {
    if (option.type === 'codeholder') {
        return <IdUEACode id={option.codeholderId} />;
    }
    return option.name;
}

/// Renders rounds.
///
/// # Props
/// - type: vote type
/// - ballots: ballot count
/// - rounds: rounds data
/// - options: vote options
function Rounds ({ type, ballots, rounds, options }) {
    const [round, setRound] = useState(0);

    const prevRound = () => round > 0 && setRound(round - 1);
    const nextRound = () => round < rounds.length - 1 && setRound(round + 1);

    let roundView = null;

    if (type === 'rp') {
        const rankedPairs = new Map();
        for (const round of rounds) {
            for (const pair of round.rankedPairs) {
                const key = pair.pair.join('~');
                if (!rankedPairs.has(key)) {
                    rankedPairs.set(key, pair);
                }
            }
        }
        roundView = (
            <RPRound
                round={rounds[round]}
                options={options}
                rankedPairs={[...rankedPairs.values()]} />
        );
    } else if (type === 'stv') {
        roundView = <STVRound ballots={ballots} round={rounds[round]} options={options} />;
    }

    return (
        <div class="result-rounds">
            <div class="round-picker">
                <Button icon small onClick={prevRound}>
                    <ChevronLeftIcon style={{ verticalAlign: 'middle' }} />
                </Button>
                <span class="round-picker-label">
                    {locale.results.roundsPagination(round + 1, rounds.length)}
                </span>
                <Button icon small onClick={nextRound}>
                    <ChevronRightIcon style={{ verticalAlign: 'middle' }} />
                </Button>
            </div>
            {roundView}
        </div>
    );
}

/// Renders a single stv round.
function STVRound ({ ballots, round, options }) {
    const items = [];

    for (const i of round.optsChosen) {
        items.push({
            name: <VoteOptionName option={options[i]} />,
            value: round.votes[i],
            chosen: true,
        });
    }

    for (const i of round.optsEliminated) {
        items.push({
            name: <VoteOptionName option={options[i]} />,
            value: round.votes[i],
            chosen: false,
        });
    }

    return (
        <div class="result-round">
            <Bar ymax={ballots} items={items} />
        </div>
    );
}

/// Renders a single ranked-pairs round.
function RPRound ({ round, options, rankedPairs }) {
    return (
        <div class="result-round">
            <LockGraph
                graph={round.graph}
                rankedPairs={rankedPairs}
                options={options}
                chosen={round.optChosen} />
            <div class="round-chosen">
                {locale.results.roundsChosen}
                <span class="round-chosen-name">
                    <VoteOptionName option={options[round.optChosen]} />
                </span>
            </div>
            <ul class="round-options">
                {Object.entries(round.optStats).map(([i, { won, lost, mentions }]) => {
                    const option = options[+i];
                    return (
                        <li class="round-option" key={i}>
                            <span class="round-option-name">
                                <VoteOptionName option={option} />
                            </span>
                            <span class="round-option-stats">
                                {locale.results.roundsOptionStats(won, lost, mentions)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/// Renders the lock graph and ranked pairs info for a round.
class LockGraph extends Component {
    state = {
        nodes: [],
        edges: [],
        selectedEdge: null,
    };

    static contextType = coreContext;

    layoutLock = 0;

    /// Performs graph layout.
    async layout (lock) {
        const core = this.context;

        const g = new dagre.graphlib.Graph();
        g.setGraph({});
        g.setDefaultEdgeLabel(() => ({}));

        const optionLabels = {};
        for (const node in this.props.graph) {
            const option = this.props.options[+node];
            if (option.type === 'simple') {
                optionLabels[node] = option.name;
            } else if (option.type === 'codeholder') {
                optionLabels[node] = new Promise((resolve, reject) => {
                    const view = core.createDataView('codeholders/codeholder', {
                        id: option.codeholderId,
                        fields: ['code'],
                        lazyFetch: true,
                    });
                    view.on('update', data => {
                        resolve(data.code.new);
                        view.drop();
                    });
                    view.on('error', err => {
                        reject(err);
                        view.drop();
                    });
                });
            }
        }

        for (const node in this.props.graph) {
            let label;
            if (typeof optionLabels[node] === 'string') label = optionLabels[node];
            else label = await optionLabels[node];

            g.setNode('' + node, {
                id: +node,
                label,
                width: Math.max(30, label.length * 12), // heuristic approximation of node width
                height: 30,
            });
            for (const target of this.props.graph[node]) {
                g.setEdge('' + node, '' + target, {
                    fromNode: +node,
                    toNode: +target,
                });
            }
        }

        dagre.layout(g);

        const nodes = g.nodes().map(v => g.node(v));
        const edges = g.edges().map(e => g.edge(e));

        const xs = nodes.flatMap(node => [node.x - node.width / 2, node.x + node.width / 2])
            .concat(edges.flatMap(edge => edge.points).map(p => p.x));
        const ys = nodes.flatMap(node => [node.y - node.height / 2, node.y + node.height / 2])
            .concat(edges.flatMap(edge => edge.points).map(p => p.y));
        const minX = xs.reduce((a, b) => a < b ? a : b, Infinity);
        const minY = ys.reduce((a, b) => a < b ? a : b, Infinity);
        const maxX = xs.reduce((a, b) => a > b ? a : b, -Infinity);
        const maxY = ys.reduce((a, b) => a > b ? a : b, -Infinity);

        if (lock !== this.layoutLock) return;
        this.setState({ nodes, edges, minX, minY, maxX, maxY });
    }

    componentDidMount () {
        this.layout(++this.layoutLock);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.graph !== this.props.graph) this.layout(++this.layoutLock);
    }

    render ({ options, rankedPairs }, { nodes, edges, minX, minY, maxX, maxY, selectedEdge }) {
        if (!nodes.length) return null;

        const margin = 20;
        const viewX = minX - margin;
        const viewY = minY - margin;
        const viewW = maxX - minX + 2 * margin;
        const viewH = maxY - minY + 2 * margin;

        const svgNodes = [];
        const svgEdges = [];

        for (const edge of edges) {
            let d = '';
            for (const point of edge.points) {
                if (!d) d += `M ${point.x} ${point.y}`;
                else d += `L ${point.x} ${point.y}`;
            }

            // add arrow
            if (edge.points.length >= 2) {
                const a = edge.points[edge.points.length - 2];
                const b = edge.points[edge.points.length - 1];
                const angle = Math.atan2(b.y - a.y, b.x - a.x);
                const arrowAngleOffset = Math.PI / 7;
                const arrowSize = 10;
                const arrowAngleA = angle + Math.PI + arrowAngleOffset;
                const arrowAngleB = angle + Math.PI - arrowAngleOffset;
                d += `M ${b.x + Math.cos(arrowAngleA) * arrowSize} ${b.y + Math.sin(arrowAngleA) * arrowSize}`;
                d += `L ${b.x} ${b.y}`;
                d += `L ${b.x + Math.cos(arrowAngleB) * arrowSize} ${b.y + Math.sin(arrowAngleB) * arrowSize}`;
            }

            const edgeName = `${edge.fromNode}-${edge.toNode}`;
            const isSelected = edgeName === selectedEdge;
            const select = () => this.setState({ selectedEdge: edgeName });

            const className = isSelected ? ' is-selected' : '';

            svgEdges.push(<path class="lock-graph-edge-hitbox" d={d} onClick={select} />);
            svgEdges.push(<path class={'lock-graph-edge ' + className} d={d} />);
        }

        for (const node of nodes) {
            const isChosen = this.props.chosen === node.id;

            svgNodes.push(
                <rect
                    class={'lock-graph-node-background' + (isChosen ? ' is-the-chosen-one' : '')}
                    x={node.x - node.width / 2}
                    y={node.y - node.height / 2}
                    width={node.width}
                    height={node.height}
                    rx={4} />,
                <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    class="lock-graph-node-label">
                    {node.label}
                </text>
            );
        }

        return (
            <div class="result-lock-graph-container">
                <RankedPairs options={options} rankedPairs={rankedPairs} selectedEdge={selectedEdge} />
                <h4 class="lock-graph-title">{locale.results.lockGraph}</h4>
                <svg class="result-lock-graph" width={viewW} viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}>
                    {svgEdges}
                    {svgNodes}
                </svg>
            </div>
        );
    }
}

function RankedPairs ({ options, rankedPairs, selectedEdge }) {
    if (!rankedPairs) return;
    const edge = (selectedEdge || '').split('-').map(x => +x);

    const tableRows = [];
    for (const pair of rankedPairs) {
        const selected = edge[0] === pair.pair[0] && edge[1] === pair.pair[1]
            || edge[0] === pair.pair[1] && edge[1] === pair.pair[0];

        tableRows.push({
            cells: [
                <span key="a">
                    <VoteOptionName option={options[pair.pair[0]]} />
                    {` (${pair.opt0}) `}
                    {locale.results.rankedPairs.vs}
                    {' '}
                    <VoteOptionName option={options[pair.pair[1]]} />
                    {` (${pair.opt1}) `}
                </span>,
                <VoteOptionName key="b" option={options[pair.winner]} />,
                '' + Math.abs(pair.diff),
            ],
            selected,
        });
    }

    return (
        <div class="ranked-pairs">
            <table class="ranked-pairs-table">
                <thead>
                    <tr>
                        <th>{locale.results.rankedPairs.pair}</th>
                        <th>{locale.results.rankedPairs.winner}</th>
                        <th>{locale.results.rankedPairs.diff}</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows.map(({ cells, selected }, i) => (
                        <tr key={i} class={selected ? 'is-selected' : ''}>
                            {cells.map((d, i) => <td key={i}>{d}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
