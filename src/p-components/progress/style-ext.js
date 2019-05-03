/** The size of the small arc phase of the indeterminate circular progress indicator. */
const SMALL_ARC_SIZE = Math.PI / 12;

/** The size of the large arc phase of the indeterminate circular progress indicator. */
const LARGE_ARC_SIZE = Math.PI * 3 / 2;

/** The “speed” of the error function as used by the indeterminate circular progress indicator. */
const ERF_TIME_SCALE = 7.3;

/**
 * Approximation of the error function
 * from https://stackoverflow.com/questions/457408/#answer-457805
 */
const erf = x => {
    // save the sign of x
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    // constants
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    // A&S formula 7.1.26
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1)
        * t * Math.exp(-x * x);
    return sign * y;
};

/**
 * The following code is responsible the growing-and-shrinking spinning effect that the
 * indeterminate progress bar has, by using overcomplicated math:
 * To attain the “one side moves while the other stays still” behavior, the integral of a
 * gaussian function is taken, resulting in the error function. Then the plot of the two
 * ends looks something like this:
 *  ^ progress
 *  |
 *  1          .-'''''.-''''
 *  |         /      /
 *  0- - - - / - - -/- - - 1 -------> stageProgress
 *  |       /      /
 * -1 ....-'.....-'
 *  |
 * These values are then interpolated over stageProgress, resulting in a small arc phase
 * at the beginning angle, a large arc phase, and then a small arc phase now offset by
 * LARGE_ARC_SIZE.
 * Because the beginning and end angles aren’t the same, the offset is incremented above
 * and added as sweepOffset after.
 * And finally, rotation is added to the sweepOffset such that the whole thing moves the
 * entire time.
 */
function sweepAnglesForStageProgress (stageProgress) {
    const endProgress = erf((stageProgress - 0.25) * ERF_TIME_SCALE);
    const startProgress = erf((stageProgress - 0.75) * ERF_TIME_SCALE);

    const sweepStart = LARGE_ARC_SIZE / 2 * startProgress - SMALL_ARC_SIZE / 2;
    const sweepEnd = LARGE_ARC_SIZE / 2 * endProgress + SMALL_ARC_SIZE / 2;

    return [sweepStart, sweepEnd];
}

// The LESS AST format is not documented well; the following is the result of writing code until
// it kinda works
function styleForState (less, sweepStart, sweepEnd, radius) {
    const rotation = sweepStart;
    const length = (sweepEnd - sweepStart) * radius;

    return [
        // FIXME: adding .toFixed(2) makes the build fail for some reason
        new less.tree.Declaration('transform', `rotate(${rotation}rad)`),
        new less.tree.Declaration('stroke-dasharray', `${length} 1000`),
    ];
}

module.exports = {
    install (less, pluginManager, functions) {
        functions.add('indeterminate-progress-inner', function (name, radius) {
            name = name && name.value;
            radius = radius && radius.value;
            const keyframes = [];
            for (let i = 0; i <= 100; i += 1) {
                const sweepAngles = sweepAnglesForStageProgress(i / 100);
                const rules = styleForState(less, sweepAngles[0], sweepAngles[1], radius);
                keyframes.push(new less.tree.AtRule('', `${i}%`, rules));
            }
            return new less.tree.AtRule('@keyframes', name, keyframes);
        });
    },
};
