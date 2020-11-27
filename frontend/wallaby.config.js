module.exports = () => {
  return {
    // tell wallaby to use automatic configuration
    autoDetect: true,

    testFramework: {
      configFile: './jest.config.json'
    }
  }
};
