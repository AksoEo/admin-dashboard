//! This file is secret and contains vfx à la video games.

import { globalAnimator, lerp, clamp } from '../animation';
import client from '../client';
import locale from '../locale';

function shakeScreen () {
    globalAnimator.register({
        shake: 1,
        time: 0,
        update (dt) {
            this.shake -= dt;
            this.time += dt;
            const roots = document.querySelectorAll('.root-container');

            const t = this.time * 20;
            const shake = this.shake ** 2;
            const dx = (perlin(t, 0, 0) * 10 - 5) * shake;
            const dy = (perlin(0, t, 0) * 10 - 5) * shake;

            for (const root of roots) {
                root.style.transform = `translate(${dx}px, ${dy}px)`;
            }

            if (this.shake <= 0) {
                globalAnimator.deregister(this);
                for (const root of roots) root.style.transform = '';
            }
        },
    });
}

class TrailingParticle {
    constructor (x, y) {
        this.node = document.createElement('div');
        this.x = x;
        this.y = y;
        this.trail = [];
        this.makeTrailNode(x, y);
    }

    makeTrailNode (x, y) {
        x += perlin(x, 0, 0) * 4 - 2;
        y += perlin(0, y, 0) * 4 - 2;
        const part = document.createElement('div');
        part.particleData = {
            x: x,
            y: y,
            age: 0,
        };
        Object.assign(part.style, {
            position: 'fixed',
            background: '#fff',
            width: '14px',
            height: '14px',
            top: '-7px',
            left: '-7px',
            borderRadius: '50%',
            transform: `translate(${x}px, ${y}px)`,
        });
        this.node.appendChild(part);
        this.trail.splice(0, 0, part);
        return part;
    }

    update (x, y, dt, noParticles = false) {
        const distance = Math.hypot(x - this.x, y - this.y);
        const dx = (distance / 2) * dt;

        const partsToRemove = [];
        for (const part of this.trail) {
            const { x, y, age } = part.particleData;
            const s = 1 - (age + dx);
            part.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
            part.particleData.age += dx;
            if (s <= 0) partsToRemove.push(part);
        }
        for (const part of partsToRemove) {
            this.trail.splice(this.trail.indexOf(part), 1);
            this.node.removeChild(part);
        }

        let remaining = distance;
        const angle = Math.atan2(y - this.y, x - this.x);
        while (remaining > 0 && !noParticles) {
            const d = Math.min(remaining, 4);
            remaining -= d;
            this.x += Math.cos(angle) * d;
            this.y += Math.sin(angle) * d;
            this.makeTrailNode(this.x, this.y);
        }
        this.x = x;
        this.y = y;
    }
}

const easeInCubic = t => t * t * t;
const easeInOutCubic = t => t < 0.5 ? (4 * t * t * t) : ((t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
const easeOutExpo = t => 1 - Math.pow(2, -10 * t);

function particleVortex (logo) {
    const cornerPositions = [...logo.querySelectorAll('.corner')].map(corner => {
        const rect = corner.getBoundingClientRect();
        return [rect.left + rect.width / 2, rect.top + rect.height / 2];
    });
    logo.querySelector('.logo').style.opacity = '0';

    const root = document.createElement('div');
    root.className = 'root-container';
    root.style.zIndex = 100 + 2019 - 7 - 18;
    document.body.appendChild(root);

    const backdrop = document.createElement('div');
    const flash = document.createElement('div');
    const backdropStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.5)',
    };
    Object.assign(backdrop.style, backdropStyle);
    Object.assign(flash.style, backdropStyle);
    flash.style.background = '#fff';
    root.appendChild(backdrop);
    root.appendChild(flash);

    const message = document.createElement('div');
    message.textContent = '→ window.akso';
    Object.assign(message.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0)',
        fontSize: '24px',
        color: '#fff',
    });
    root.appendChild(message);

    const particles = cornerPositions.map(([x, y]) => {
        const part = new TrailingParticle(x, y);
        root.appendChild(part.node);
        return part;
    });

    const initialCenter = cornerPositions
        .reduce((a, b) => ([a[0] + b[0], a[1] + b[1]]))
        .map(x => x / cornerPositions.length);
    const adjustedPositions = cornerPositions
        .map(([x, y]) => ([x - initialCenter[0], y - initialCenter[1]]));
    const targetCenter = [window.innerWidth / 2, window.innerHeight / 2];

    globalAnimator.register({
        time: 0,
        update (dt) {
            this.time += dt;

            flash.style.opacity = clamp(1 - this.time, 0, 1) ** 2;
            backdrop.style.opacity = message.style.opacity = clamp(4 - this.time, 0, 1) ** 2;
            logo.querySelector('.logo').style.opacity = 1 - backdrop.style.opacity;

            const msgScale = easeOutExpo(clamp(this.time - 2, 0, 1));
            message.style.transform = `translate(-50%, -50%) scale(${msgScale})`;

            const ct = easeInOutCubic(clamp(this.time / 2, 0, 1));
            const center = [
                lerp(initialCenter[0], targetCenter[0], ct),
                lerp(initialCenter[1], targetCenter[1], ct),
            ];
            const rotation = 2 ** (clamp(this.time - 0.2, 0, Infinity) * 3) - 1;
            const radius = this.time < 2
                ? 1 - easeInCubic(clamp(this.time / 2, 0, 1))
                : easeOutExpo(this.time - 2);

            for (let i = 0; i < particles.length; i++) {
                const [px, py] = adjustedPositions[i];
                const angle = Math.atan2(py, px) + rotation;
                const length = Math.hypot(px, py);

                const x = center[0] + Math.cos(angle) * Math.max(1, length * radius);
                const y = center[1] + Math.sin(angle) * Math.max(1, length * radius);

                particles[i].update(x, y, dt, this.time > 2);
            }

            if (this.time > 2 && !this.exposed) {
                this.exposed = true;
                exposeAKSO();
            }

            if (this.time >= 4) {
                globalAnimator.deregister(this);
                document.body.removeChild(root);
                logo.querySelector('.logo').style.opacity = '';
            }
        },
    });
}

function exposeAKSO () {
    window.akso = {
        client,
        globalAnimator,
        locale,
    };
}

export default function trigger (logo) {
    shakeScreen();
    particleVortex(logo);
}

// perlin noise, adapted from https://cs.nyu.edu/%7Eperlin/noise/
const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
function grad (hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h == 12 || h == 14) ? x : z;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}
function perlin (x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
        lerp(
            lerp(
                grad(p[AA], x, y, z),
                grad(p[BA], x - 1, y, z),
                u,
            ),
            lerp(
                grad(p[AB], x, y - 1, z),
                grad(p[BB], x - 1, y - 1, z),
                u,
            ),
            v,
        ),
        lerp(
            lerp(
                grad(p[AA + 1], x, y, z - 1),
                grad(p[BA + 1], x - 1, y, z - 1),
                u,
            ),
            lerp(
                grad(p[AB + 1], x, y - 1, z - 1),
                grad(p[BB + 1], x - 1, y - 1, z - 1),
                u,
            ),
            v,
        ),
        w,
    );
}
const p = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
    142, 8, 99, 37, 240, 21, 10, 23, 190,  6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
    203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168,  68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
    220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,  65, 25, 63, 161,  1, 216, 80, 73, 209,
    76, 132, 187, 208,  89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173,
    186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
    59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152,  2, 44, 154, 163,
    70, 221, 153, 101, 155, 167,  43, 172, 9, 129, 22, 39, 253,  19, 98, 108, 110, 79, 113, 224,
    232, 178, 185,  112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179,
    162, 241,  81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214,  31, 181, 199, 106, 157, 184,
    84, 204, 176, 115, 121, 50, 45, 127,  4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72,
    243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
];
p.push(...p);
