//! This is a module that will be evaluated at build-time and contains build configuration.

const data = {
    buildTime: new Date().toISOString(),
    // AKSO api base url, **may include a path**
    base: global.aksoConfig.base,
};

module.exports = () => {
    return {
        code: `module.exports = ${JSON.stringify(data)}`,
    };
};
