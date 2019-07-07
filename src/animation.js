import EventEmitter from 'events';

// ensure requestAnimationFrame exists
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAniationFrame
        || window.mozRequestAnimationFrame
        || (f => setTimeout(f, 16));
}

/**
 * An animator manages an animation loop and dispatches update events to its registered objects
 * every frame.
 */
class Animator {
    /** Update targets. */
    targets = new Set();

    /** The current loop ID. Used to prevent multiple animation loops running simultaneously. */
    currentLoopID = 0;

    /** True if the animation loop is running. */
    running = false;

    /**
     * The timestamp of the previous iteration of the animation loop. Used to calculate delta time.
     * Will be set when the animation loop starts.
     */
    prevTime = null;

    /** Global animation speed. */
    animationSpeed = 1;

    /**
     * Registers an object with the animator. This object must have a function member named
     * `update`. That function will then be called with the elapsed time in seconds.
     */
    register (target) {
        this.targets.add(target);
        this.start();
    }

    /** Deregisters an object. Does nothing if it was never registered. */
    deregister (target) {
        this.targets.delete(target);
    }

    /**
     * Starts the animation loop if it isn’t already running.
     * Calling this function directly should generally be unnecessary.
     */
    start () {
        if (this.running) return;
        this.running = true;
        this.currentLoopID++;
        this.prevTime = Date.now();
        this.animationLoop(this.currentLoopID);
    }

    /**
     * Stops the animation loop.
     * Calling this function directly should generally be unnecessary.
     */
    stop () {
        this.running = false;
    }

    /** The animation loop function; should not be called directly. */
    animationLoop (loopID) {
        // check if the loop should be running in the first place
        if (loopID != this.currentLoopID || !this.running) return;

        // if no targets are present, stop
        if (!this.targets.size) {
            this.stop();
            return;
        }

        // schedule the next loop iteration
        window.requestAnimationFrame(() => this.animationLoop(loopID));

        // dispatch
        const now = Date.now();
        const deltaTime = (now - this.prevTime) / 1000 * this.animationSpeed;
        this.prevTime = now;

        for (const target of this.targets) {
            target.update(deltaTime);
        }
    }
}

/** The global animator. */
export const globalAnimator = new Animator();

window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // suspend animations when the tab is no longer visible
        globalAnimator.stop();
    } else {
        globalAnimator.start();
    }
});

/**
 * Calculates spring position and velocity for any given condition.
 *
 * equations copied from
 * http://people.physics.tamu.edu/agnolet/Teaching/Phys_221/MathematicaWebPages/4_DampedHarmonicOsc
 * illator.pdf
 */
export class SpringSolver {
    target = 0;

    /** Creates a new spring with the given damping ratio and period. */
    constructor (dampingRatio, period) {
        this.dampingRatio = dampingRatio;
        this.friction = dampingRatio * (4 * Math.PI / period);
        this.hydrateParams(0, 0);
    }

    /** Sets internal parameters for the given initial velocity. */
    hydrateParams (initialValue, initialVelocity) {
        this.undampedAngularFrequency = this.dampingRatio === 0
            ? 0
            : this.friction / this.dampingRatio / 2;
        this.dampedAngularFrequency =
            this.undampedAngularFrequency * Math.sqrt(1 - this.dampingRatio ** 2),
        this.angularOffset = Math.atan2(
            2 * initialVelocity + this.friction * initialValue,
            2 * initialValue * this.dampedAngularFrequency,
        );
        this.amplitudeFactor = initialValue === 0
            ? Math.sign(initialVelocity) * initialVelocity / this.dampedAngularFrequency
            : initialValue / Math.cos(this.angularOffset);
        this.dampedFriction = Math.max(
            // approximate zero because lim is too expensive to compute
            1e-5,
            Math.sqrt((this.friction / 2) ** 2 - this.undampedAngularFrequency ** 2) * 2,
        );
        this.a1 = (-2 * initialVelocity + initialValue * (-this.friction + this.dampedFriction))
            / (2 * this.dampedFriction);
        this.a2 = (2 * initialVelocity + initialValue * (this.friction + this.dampedFriction))
            / (2 * this.dampedFriction);
    }

    /*
     * Retargets the spring; setting the start value to the current value and retaining velocity.
     * Time will be reset to zero.
     *
     * @param {number} t - the pivot time, at which the retargeting occurs
     * @param {number} newTarget - the new target position
     */
    retarget (t, newTarget) {
        const value = this.getValue(t);
        const velocity = this.getVelocity(t);
        this.target = newTarget;
        this.hydrateParams(value - this.target, velocity);
    }

    /*
     * Resets the velocity to a new value.
     * Time will be reset to zero.
     *
     * @param {number} t - the pivot time, at which the resetting occurs
     * @param {number} newVelocity - the new velocity
     */
    resetVelocity (t, newVelocity) {
        const value = this.getValue(t);
        this.hydrateParams(value - this.target, newVelocity);
    }

    resetDampingRatio (t, newDampingRatio) {
        const value = this.getValue(t);
        const velocity = this.getVelocity(t);
        this.dampingRatio = newDampingRatio;
        this.hydrateParams(value - this.target, velocity);
    }

    resetFriction (t, newFriction) {
        const value = this.getValue(t);
        const velocity = this.getVelocity(t);
        this.friction = newFriction;
        this.hydrateParams(value - this.target, velocity);
    }

    resetPeriod (t, newPeriod) {
        this.resetFriction(t, this.dampingRatio * (4 * Math.PI / newPeriod));
    }

    resetValue (t, newValue) {
        const velocity = this.getVelocity(t);
        this.hydrateParams(newValue - this.target, velocity);
    }

    getValue (t) {
        let value;
        if (this.dampingRatio < 1) {
            // underdamped
            value = this.amplitudeFactor * Math.exp(-t * this.friction / 2)
                * Math.cos(this.dampedAngularFrequency * t - this.angularOffset);
        } else {
            // critically damped or overdamped
            value = this.a1 * Math.exp(t * (-this.friction - this.dampedFriction) / 2)
                + this.a2 * Math.exp(t * (-this.friction + this.dampedFriction) / 2);
        }
        return value + this.target;
    }

    getVelocity (t) {
        if (this.dampingRatio < 1) {
            // underdamped
            return this.amplitudeFactor * (-this.friction / 2 * Math.exp(-t * this.friction / 2)
                * Math.cos(this.dampedAngularFrequency * t - this.angularOffset)
                - this.dampedAngularFrequency * Math.exp(-t * this.friction / 2)
                * Math.sin(this.dampedAngularFrequency * t - this.angularOffset));
        } else {
            // critically damped or overdamped
            return this.a1 * (-this.friction - this.dampedFriction) / 2
                * Math.exp(t * (-this.friction - this.dampedFriction) / 2)
                + this.a2 * (-this.friction + this.dampedFriction) / 2
                * Math.exp(t * (-this.friction + this.dampedFriction) / 2);
        }
    }
}

const timeKey = Symbol('time');

/**
 * Simulates spring physics.
 *
 * Will use the global animator.
 *
 * # Events
 * - `update`(value: number): Fired every time the spring is updated by the global animator
 */
export class Spring extends EventEmitter {
    /** Tolerance below which the spring will be considered stationary. */
    tolerance = 1 / 1000;

    /**
     * If true, the spring will stop animating automatically once it’s done (also see tolerance).
     */
    stopAutomatically = true;

    /**
     * If true, the spring won’t move but will still fire update events.
     * Useful e.g. when the user is dragging something controlled by a spring.
     */
    locked = false;

    [timeKey] = 0;

    /** Creates a new spring. */
    constructor (dampingRatio, period, initial) {
        super();

        this.inner = new SpringSolver(dampingRatio, period);

        if (initial) {
            this.inner.resetValue(0, initial);
            this.inner.retarget(0, initial);
        }
    }

    getTime () {
        return this[timeKey];
    }

    resetTime () {
        this[timeKey] = 0;
    }

    get value () {
        return this.inner.getValue(this.getTime());
    }

    set value (value) {
        this.inner.resetValue(this.getTime(), value);
        this.resetTime();
    }

    get velocity () {
        return this.inner.getVelocity(this.getTime());
    }

    set velocity (value) {
        this.inner.resetVelocity(this.getTime(), value);
        this.resetTime();
    }

    get target () {
        return this.inner.target;
    }

    set target (value) {
        if (this.inner.target === value) return;
        this.inner.retarget(this.getTime(), value);
        this.resetTime();
    }

    /**
     * Updates the spring.
     *
     * Will emit an 'update' event with the current value.
     */
    update (elapsed) {
        if (!this.locked) this[timeKey] += elapsed;

        if (this.stopAutomatically && !this.wantsUpdate()) {
            this.finish();
            this.stop();
        }

        this.emit('update', this.value);
    }

    /** Returns true if the spring should not be considered stopped. */
    wantsUpdate () {
        return Math.abs(this.value - this.target) + Math.abs(this.velocity) > this.tolerance;
    }

    /** Starts the spring by registering it in the global animator. */
    start () {
        globalAnimator.register(this);
    }

    /** Stops the spring by deregistering it in the global animator. */
    stop () {
        globalAnimator.deregister(this);
    }

    /** Will finish the animation by immediately jumping to the end and emitting an `update`. */
    finish () {
        if (this.target === null) return;
        this.velocity = 0;
        this.value = this.target;
        this.emit('update', this.value);
        this.stop();
    }

    setDampingRatioAndPeriod (dampingRatio, period) {
        this.inner.resetDampingRatio(this.getTime(), dampingRatio);
        this.inner.resetPeriod(0, period);
        this.resetTime();
    }

    get dampingRatio () {
        return this.inner.dampingRatio;
    }

    get period () {
        return this.inner.dampingRatio * 4 * Math.PI / this.inner.friction;
    }

    set period (period) {
        this.inner.resetPeriod(this.getTime(), period);
        this.resetTime();
    }

    set dampingRatio (dampingRatio) {
        this.inner.resetDampingRatio(this.getTime(), dampingRatio);
        this.resetTime();
    }

    /**
     * Generates keyframes starting at the current time.
     *
     * @param {Function} shouldStop - `(value, velocity, time)` should return true at some point
     * @param {number} [sampleScale] - pass a larger value to sample more points
     * @returns {[number, number][]} - array of keyframes and time offsets
     */
    genKeyframes (shouldStop, sampleScale = 60) {
        const startTime = this.getTime();
        let t = startTime;
        const values = [];
        while (t < 1e3) {
            const value = this.inner.getValue(t);
            const velocity = this.inner.getVelocity(t);
            values.push([value, t - startTime]);

            if (shouldStop(value, velocity, t - startTime)) break;

            t += Math.max(1e-2, Math.sqrt(velocity) / sampleScale);
        }
        return values;
    }
}

/** Linearly interpolates between a and b using t. */
export function lerp (a, b, t) {
    return t * (b - a) + a;
}

/** Clamps a value to the interval between l and h. */
export function clamp (x, l, h) {
    return Math.max(l, Math.min(x, h));
}
