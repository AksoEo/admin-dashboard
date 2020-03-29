const configId = 'akso:config';
export default function configPlugin (config) {
    const fileContents = Object.entries(config)
        .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)};`)
        .join('\n');

    return {
        name: 'config-plugin',
        resolveId (id) {
            if (id === configId) return configId;
            return null;
        },
        load (id) {
            if (id === configId) return fileContents;
            return null;
        },
    };
}
