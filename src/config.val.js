const data = {
    buildTime: new Date().toISOString(),
    host: global.aksoConfig.host,
};

module.exports = () => {
    return {
        code: `module.exports = ${JSON.stringify(data)}`,
    };
};
