import { spec, reverseMap } from '../../../../permissions';

// implication graph for the spec
const reverseImplicationGraph = new Map();
{
    for (const perm in reverseMap) {
        const { node } = reverseMap[perm];
        const implied = [];

        if (node.implies) implied.push(...node.implies);
        if (perm.endsWith('.*')) {
            const prefix = perm.substr(0, perm.length - 1);
            for (const p of Object.keys(reverseMap).filter(x => x.startsWith(prefix))) {
                if (p === perm) continue; // don’t imply self
                implied.push(p);
            }
        }

        for (const perm of implied) {
            if (!reverseImplicationGraph.has(perm)) reverseImplicationGraph.set(perm, new Set());
            reverseImplicationGraph.get(perm).add(node.id);
        }
    }
}

export function read (permissions) {
    const permStates = new Map();

    // list of unknown permissions
    const unknown = [];
    for (const perm of permissions) {
        if (!reverseMap[perm]) {
            unknown.push(perm);

            permStates.set(perm, {
                active: true,
                virtuallyActive: true,
                isRoot: true,
                impliedBy: new Set(),
                isUnknown: true,
            });
        }
    }

    for (const perm in reverseMap) {
        const { node } = reverseMap[perm];

        // permission state--is it active? implied?
        let state = {
            // whether this permission is active server-side
            active: false,
            // whether this permission *should* be active server-side (e.g. because it’s implied)
            virtuallyActive: false,
            // whether this permission is a root node in the implication graph
            isRoot: false,
            // nodes that imply this permission
            impliedBy: new Set(),
            isUnknown: false,
        };

        if (permissions.includes(perm)) {
            // is in permissions itself
            state.active = state.virtuallyActive = state.isRoot = true;
        }

        // check active permissions for wildcards
        if (permissions.includes('*') && perm !== '*') {
            state.active = state.virtuallyActive = true;
            state.impliedBy.add('*');
        } else {
            const permParts = perm.split('.');
            for (let i = permParts.length - 1; i > 0; i--) {
                const wildcard = permParts.slice(0, i).join('.') + '.*';
                if (permissions.includes(wildcard) && wildcard !== perm) {
                    state.active = state.virtuallyActive = true;
                    state.impliedBy.add(wildcard);
                }
            }
        }

        permStates.set(perm, state);
    }

    // now traverse perms again and propagate implications until nothing changes
    let somethingChanged = true;
    while (somethingChanged) {
        somethingChanged = false;

        for (const perm in reverseMap) {
            const state = permStates.get(perm);
            for (const implier of (reverseImplicationGraph.get(perm) || [])) {
                if (state.impliedBy.has(implier)) continue;
                if (permStates.get(implier).active) {
                    somethingChanged = true;
                    state.impliedBy.add(implier);
                    state.virtuallyActive = true;
                }
            }
        }
    }

    // now add impliedBy to unknown permissions
    // (does not need to loop indefinitely because these are unknown and can hence not imply
    // anything)
    for (const perm of unknown) {
        const state = permStates.get(perm);
        for (const implier of (reverseImplicationGraph.get(perm) || [])) {
            if (permStates.get(implier).active) state.impliedBy.add(implier);
        }
    }

    return [permStates, unknown];
}

export function add (permissions, perm) {
    permissions = permissions.slice();
    const [permStates,] = read(permissions);

    // collect all implied perms
    const implications = new Set();
    const queue = [perm];
    while (queue.length) {
        const cursor = queue.shift();
        let implies = [];
        if (cursor.endsWith('.*')) {
            const prefix = perm.substr(0, perm.length - 1);
            for (const p of Object.keys(reverseMap).filter(x => x.startsWith(prefix))) {
                if (p === perm) continue; // don’t imply self
                implies.push(p);
            }
        }
        if (reverseMap[cursor]) {
            const { node } = reverseMap[cursor];
            if (node.implies) implies.push(...node.implies);
        }
        if (!implies.length) continue;

        for (const implied of implies) {
            if (implications.has(implied)) continue;
            implications.add(implied);
            queue.push(implied);
        }
    }
    for (const p of implications) {
        if (!permStates.has(p) || !permStates.get(p).active) permissions.push(p);
    }

    if (perm.endsWith('.*')) {
        // get rid of all the other ones that are now included in the wildcard
        const prefix = perm.substr(0, perm.length - 1);
        permissions = permissions.filter(x => !x.startsWith(prefix));
    }

    permissions.push(perm);

    return permissions;
}

export function remove (permissions, perm) {
    permissions = permissions.slice();
    // remove the permission itself if it exists
    if (permissions.includes(perm)) permissions.splice(permissions.indexOf(perm), 1);
    // remove any relevant wildcards
    if (permissions.includes('*')) permissions.splice(permissions.indexOf('*'), 1);
    const permParts = perm.split('.');
    for (let i = permParts.length - 1; i > 0; i--) {
        const wildcard = permParts.slice(0, i).join('.') + '.*';
        if (wildcard === perm) continue;
        permissions = remove(permissions, wildcard);
    }
    // remove impliers
    for (const implier of (reverseImplicationGraph.get(perm) || [])) {
        permissions = remove(permissions, implier);
    }
    return permissions;
}
