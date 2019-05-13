import { Spring, lerp, clamp } from '../animation';

/**
 * Clones a node and its children, including styles.
 * @param {Node} node - a DOM node
 * @returns {Node} - the node’s clone
 */
export function deepCloneNode (node) {
    const newNode = node.cloneNode(false);
    if (newNode.nodeType === 1) {
        const computedStyle = getComputedStyle(node);
        for (const key in computedStyle) {
            if (!key.match(/^\d+|length|parentRule$/)) {
                newNode.style[key] = computedStyle[key];
            }
        }
    }

    for (const child of node.childNodes) {
        newNode.appendChild(deepCloneNode(child));
    }

    return newNode;
}

/**
 * Clones a node (see [deepCloneNode]) and adds `position: fixed` and a transform such that
 * appending the result to `document.body` will make it seem like the node hasn’t moved at all.
 *
 * This will override the following style properties: `position`, `zIndex`, `top`, `left`, `width`,
 * `height`, `transform`.
 *
 * @param {Node} node - a DOM node to clone
 * @param {?number} zIndex - the new node’s z index
 * @returns {Object} an object with fields `node`, `left`, `top`, `width`, `height`
 */
export function cloneNodeInScreenSpace (node, zIndex = 100) {
    const { left, top, width, height } = node.getBoundingClientRect();
    const clone = deepCloneNode(node);
    Object.assign(clone.style, {
        position: 'fixed',
        zIndex,
        top: 0,
        left: 0,
        width: Math.ceil(width) + 'px',
        height: height + 'px',
        transform: `translate(${left}px, ${top}px)`,
    });
    return { node: clone, left, top, width, height };
}

/** Largest allowed vertical movement in the title transition. */
const MAX_DELTA_Y = 200;

/**
 * Transitions between two title elements, such as from a list item to a page header.
 *
 * @param {Node} a - start node, which will disappear
 * @param {Node} b - end node, which will appear
 * @param {?DOMRect} startRect - startRect override
 * @param {?DOMRect} endRect - endRect override
 * @returns {Promise} a promise that resolves when the animation finishes
 */
export function transitionTitles (a, b, startRect, endRect) {
    return new Promise(resolve => {
        startRect = startRect || a.getBoundingClientRect();
        endRect = endRect || b.getBoundingClientRect();

        b = cloneNodeInScreenSpace(b).node;
        document.body.appendChild(b);

        a.style.transformOrigin = b.style.transformOrigin = '0 0';
        b.style.opacity = 0;

        const reduceMotion = Math.abs(endRect.top - startRect.top) > MAX_DELTA_Y;
        const yDir = Math.sign(endRect.top - startRect.top);

        const spring = new Spring(1.3, 0.4);
        spring.on('update', p => {
            const xp = Math.pow(p, 0.8);
            const yp = Math.pow(p, 2);

            const tEndY = reduceMotion ? startRect.top + yDir * MAX_DELTA_Y / 2 : endRect.top;
            const tsp = reduceMotion ? p / 2 : p;

            const tx = lerp(startRect.left, endRect.left, xp);
            const ty = lerp(startRect.top, tEndY, reduceMotion ? p * 1.5 : yp);
            const tsx = lerp(1, endRect.width / startRect.width, tsp);
            const tsy = lerp(1, endRect.height / startRect.height, tsp);

            a.style.transform = `translate(${tx}px, ${ty}px) scale(${tsx}, ${tsy})`;
            a.style.opacity = reduceMotion ? clamp(1 - p * 2, 0, 1) : 1 - p;

            const uStartY = reduceMotion ? -yDir * MAX_DELTA_Y / 2 : startRect.top - endRect.top;
            const usp = reduceMotion ? 0.5 + p / 2 : p;

            const ux = lerp(startRect.left, endRect.left, reduceMotion ? usp : xp);
            const uy = lerp(uStartY, 0, reduceMotion ? p * 1.5 - 0.5 : yp) + endRect.top;
            const usx = lerp(startRect.width / endRect.width, 1, usp);
            const usy = lerp(startRect.height / endRect.height, 1, usp);

            b.style.transform = `translate(${ux}px, ${uy}px) scale(${usx}, ${usy})`;
            b.style.opacity = reduceMotion ? clamp(p * 2 - 1, 0, 1) : p;

            if (p === 1) {
                a.style.transformOrigin = '';
                if (b.parentNode) document.body.removeChild(b);
                resolve();
            }
        });
        spring.target = 1;
        spring.start();
    });
}
