import { memberFields as fieldsSpec, reverseMap } from '../../../../permissions';

// implication graph for the spec
const reverseImplicationGraph = new Map();
const reverseFieldsImplicationGraph = new Map();
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

        for (const field in (node.impliesFields || {})) {
            if (!reverseFieldsImplicationGraph.has(field)) reverseFieldsImplicationGraph.set(field, new Map());
            const fieldMap = reverseFieldsImplicationGraph.get(field);

            const flags = node.impliesFields[field].split('');
            for (const flag of flags) {
                if (!fieldMap.has(flag)) fieldMap.set(flag, new Set());
                fieldMap.get(flag).add(node.id);
            }
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
        // permission state--is it active? implied?
        const state = {
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

export function add (permissions, memberFields, perm) {
    permissions = permissions.slice();
    memberFields = memberFields ? { ...memberFields } : null;

    const [permStates] = read(permissions);

    // collect all implied perms and fields
    const implications = new Set();
    const impliedFields = new Map(); // map from perm to flags
    const queue = [perm];
    while (queue.length) {
        const cursor = queue.shift();
        // contains all implied perms for the cursor item
        const implies = [];
        if (cursor.endsWith('.*')) {
            // wildcard implies all sub-perms
            const prefix = perm.substr(0, perm.length - 1);
            for (const p of Object.keys(reverseMap).filter(x => x.startsWith(prefix))) {
                if (p === perm) continue; // don’t imply self
                implies.push(p);
            }
        }
        if (reverseMap[cursor]) {
            const { node } = reverseMap[cursor];
            if (node.implies) implies.push(...node.implies);

            // also add implied fields
            for (const impliedField in (node.impliesFields || {})) {
                const currentFlags = impliedFields.get(impliedField) || new Set();
                for (const flag of node.impliesFields[impliedField]) {
                    currentFlags.add(flag);
                }
                impliedFields.set(impliedField, currentFlags);
            }
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

    if (perm.endsWith('.*') || perm === '*') {
        // get rid of all the other ones that are now included in the wildcard
        const prefix = perm.substr(0, perm.length - 1);
        permissions = permissions.filter(x => !x.startsWith(prefix));
    }

    permissions.push(perm);

    if (memberFields !== null) {
        for (const [f, flags] of impliedFields) {
            const flagsString = [...flags].join('');
            [permissions, memberFields] = addField(permissions, memberFields, f, flagsString);
        }
    }

    return [permissions, memberFields];
}

export function remove (permissions, memberFields, perm) {
    permissions = permissions.slice();
    memberFields = memberFields ? { ...memberFields } : null;

    // remove the permission itself if it exists
    if (permissions.includes(perm)) permissions.splice(permissions.indexOf(perm), 1);
    // remove any relevant wildcards
    if (permissions.includes('*')) permissions.splice(permissions.indexOf('*'), 1);
    const permParts = perm.split('.');
    for (let i = permParts.length - 1; i > 0; i--) {
        const wildcard = permParts.slice(0, i).join('.') + '.*';
        if (wildcard === perm) continue;
        [permissions, memberFields] = remove(permissions, memberFields, wildcard);
    }
    // remove impliers
    for (const implier of (reverseImplicationGraph.get(perm) || [])) {
        [permissions, memberFields] = remove(permissions, memberFields, implier);
    }

    return [permissions, memberFields];
}

/// Returns if the given member field permissions are fully fulfilled
export function hasField (memberFields, field, perm) {
    if (memberFields === null) return true;
    const item = fieldsSpec[field] || { fields: [field] };

    const flags = new Set(['r', 'w']);
    for (const f of item.fields) {
        const g = memberFields[f] || '';
        if (!g.includes('r')) flags.delete('r');
        if (!g.includes('w')) flags.delete('w');
    }

    return perm.split('').map(f => flags.has(f)).reduce((a, b) => a && b, true);
}

/// Adds a member field
export function addField (permissions, memberFields, field, perm) {
    memberFields = memberFields ? { ...memberFields } : null;
    if (memberFields) {
        const item = fieldsSpec[field] || { fields: [field] };

        // get the min common set of flags
        const flags = new Set(['r', 'w']);
        for (const f of item.fields) {
            const g = memberFields[f] || '';
            if (!g.includes('r')) flags.delete('r');
            if (!g.includes('w')) flags.delete('w');
        }

        flags.add(perm);
        if (perm.includes('w')) flags.add('r');

        for (const f of item.fields) memberFields[f] = [...flags].join('');
    }
    return [permissions, memberFields];
}

/// Removes a member field
export function removeField (permissions, memberFields, field, perm) {
    memberFields = memberFields ? { ...memberFields } : null;
    if (memberFields) {
        const item = fieldsSpec[field] || { field: [field] };

        // get the max common set of flags
        const flags = new Set();
        for (const f of item.fields) {
            const g = memberFields[f] || '';
            if (g.includes('r')) flags.add('r');
            if (g.includes('w')) flags.add('w');
        }

        flags.delete(perm);
        if (perm.includes('r')) flags.delete('w');

        for (const f of item.fields) memberFields[f] = [...flags].join('');

        const removedPerms = new Set();
        if (perm.includes('r')) removedPerms.add('r');
        if (perm.includes('w')) removedPerms.add('w');

        const revImpls = reverseFieldsImplicationGraph.get(field);
        if (revImpls) {
            for (const p of removedPerms) {
                const perms = revImpls.get(p);
                if (!perms) continue;
                for (const perm of perms) {
                    [permissions, memberFields] = remove(permissions, memberFields, perm);
                }
            }
        }
    }
    return [permissions, memberFields];
}
