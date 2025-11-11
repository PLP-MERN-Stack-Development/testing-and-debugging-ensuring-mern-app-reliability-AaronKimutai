const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'tcohzu',
  e2e: {
    baseUrl: 'http://localhost:3000',
    
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    
    chromeWebSecurity: false,
    
    setupNodeEvents(on, config) {
    },
  },
});