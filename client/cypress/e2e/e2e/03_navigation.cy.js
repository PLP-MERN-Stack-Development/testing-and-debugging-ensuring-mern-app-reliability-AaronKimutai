describe('03 - Navigation and Routing', () => {

  it('should load the main application on the root route', () => {
    cy.visit('/');
    
    // Check that the main App.jsx component loaded
    cy.get('h1').contains('Bug Tracker').should('be.visible');
  });

  it('should still load the main application on a non-existent "deep" route', () => {
    // This simulates a user clicking a link or typing a URL directly
    cy.visit('/some/fake/url/that-does-not-exist');
    
    // The server should still serve the index.html file, 
    // and the React app should load.
    cy.get('h1').contains('Bug Tracker').should('be.visible');
    
    // We can also check that the bug list container is there,
    // proving the full app loaded.
    cy.get('[data-testid="bug-list-container"]').should('be.visible');
  });

});