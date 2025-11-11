describe('05 - Visual Property Testing', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  it('should verify the CSS properties of the main submit button', () => {
    cy.log('--- Checking Button Style ---');
    
    // Find your submit button
    cy.get('[data-testid="submit-button"]')
      .should('be.visible')
      
      // --- FIX ---
      // Check that the text color is white
      .and('have.css', 'color', 'rgb(255, 255, 255)')
      
      // --- FIX ---
      // Check that the background color is the blue "primary" color
      // #007bff is computed as rgb(0, 123, 255)
      .and('have.css', 'background-color', 'rgb(0, 123, 255)');
  });

  it('should verify the CSS properties of the error message', () => {
    cy.log('--- Checking Error Style ---');

    // 1. Force the error to appear
    cy.get('[data-testid="submit-button"]').click();

    // 2. Find the error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      
      // --- FIX ---
      // Assert that it is red
      // #dc3545 is computed as rgb(220, 53, 69)
      .and('have.css', 'color', 'rgb(220, 53, 69)');

    cy.log('--- Visual testing complete! ---');
  });

});