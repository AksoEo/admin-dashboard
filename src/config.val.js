//! This is a module that will be evaluated at build-time and contains build configuration.

const pkg = require('../package.json');

const data = {
    buildTime: new Date().toISOString(),
    // AKSO api base url, **may include a path**
    base: global.aksoConfig.base,
    version: pkg.version,
};

module.exports = () => {
    return {
        code: `module.exports = ${JSON.stringify(data)}`,
    };
};
