describe('Bug Tracker E2E Flow', () => {
  it('should allow a user to create a new bug and see it in the list', () => {
    cy.visit('/');

    // define the new bug details
    const bugTitle = `Fix the login button - ${Date.now()}`;
    const bugDescription = 'The login button is not working on the main page.';

    // intercept the API call to ensure it's made
    cy.intercept('POST', '/api/bugs').as('createBug');

    cy.get('[data-testid="title-input"]').type(bugTitle);
    cy.get('[data-testid="description-input"]').type(bugDescription);
    cy.get('[data-testid="submit-button"]').click();

    cy.wait('@createBug').its('response.statusCode').should('eq', 201);

    cy.contains('li', bugTitle).should('be.visible');
  });
});
