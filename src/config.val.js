const data = {
    buildTime: new Date().toISOString(),
};

module.exports = () => {
    return {
        code: `module.exports = ${JSON.stringify(data)}`,
    };
};
