describe('02 - Full CRUD Lifecycle for Bug Tracker (User Code)', () => {
  
  it('should CREATE, READ, UPDATE, and DELETE a bug successfully', () => {
    
    const bugData = {
      title: `E2E Bug - ${Cypress._.random(0, 1e6)}`,
      description: 'This is a full end-to-end test of the user-provided code.',
      priority: 'Critical',
    };

    
    cy.visit('/'); 
    cy.log('--- A. Creating Bug ---');
    
    cy.intercept('POST', 'http://localhost:5000/api/bugs').as('createBug');

   
    cy.get('[data-testid="title-input"]').type(bugData.title);
    cy.get('[data-testid="description-input"]').type(bugData.description);
    cy.get('[data-testid="priority-select"]').select(bugData.priority);

  
    cy.get('[data-testid="submit-button"]').click();

    // Check for success message and that form cleared
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="title-input"]').should('have.value', '');

    
    cy.wait('@createBug').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      const createdBugId = response.body._id; // Get the ID
      cy.log(`Created Bug with ID: ${createdBugId}`);

      
      cy.log('--- B. Reading Bug List ---');
      
     
      cy.get(`[data-testid="bug-item-${createdBugId}"]`).should('be.visible');
      cy.contains(`[data-testid="bug-item-${createdBugId}"]`, bugData.title).should('exist');
      cy.contains(`[data-testid="bug-item-${createdBugId}"]`, 'Status: Open').should('exist');

      
      cy.log('--- C. Updating Bug Status ---');
      
      cy.intercept('PUT', `http://localhost:5000/api/bugs/${createdBugId}`).as('updateStatus');

      // Find the select dropdown and change its value
      cy.get(`[data-testid="status-select-${createdBugId}"]`).select('In-Progress');

      cy.wait('@updateStatus').its('response.statusCode').should('eq', 200);
      cy.contains(`[data-testid="bug-item-${createdBugId}"]`, 'Status: In-Progress').should('exist');

      
      cy.log('--- D. Deleting Bug ---');
      
      cy.intercept('DELETE', `http://localhost:5000/api/bugs/${createdBugId}`).as('deleteBug');

      // Find the delete button and click it
      cy.get(`[data-testid="delete-button-${createdBugId}"]`).click();

      
      cy.wait('@deleteBug').its('response.statusCode').should('eq', 200);
      
      cy.get(`[data-testid="bug-item-${createdBugId}"]`).should('not.exist');
      cy.log('--- E2E CRUD Cycle Complete! ---');
    });
  });
});