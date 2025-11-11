describe('01 - Initial Application Setup and Connectivity', () => {
  

  it('should successfully load the homepage and check for core elements', () => {
    cy.visit('/'); // Visits the baseUrl

    
    cy.title().should('include', 'Bug Tracker'); 
    
    cy.get('h1')
      .contains(/Bug Tracker/i)
      .should('be.visible');

    
    cy.get('[data-testid="bug-form-container"]').should('be.visible');

    
    cy.get('[data-testid="bug-list-container"]').should('be.visible');
  });


  it('should display the correct input field for bug title', () => {
    cy.visit('/');
    
  
    cy.get('[data-testid="title-input"]')
      .should('exist')
      .type('Testing Cypress input')
      .should('have.value', 'Testing Cypress input');
  });
});
