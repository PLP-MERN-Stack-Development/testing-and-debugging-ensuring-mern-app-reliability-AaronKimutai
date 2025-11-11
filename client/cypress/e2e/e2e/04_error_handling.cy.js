describe('04 - E2E Error Handling and Edge Cases', () => {

  it('should display a friendly error message if the API fails to fetch bugs', () => {
    
    // --- ARRANGE ---
    // Intercept the GET request to the bugs API
    // and force it to fail with a 500 Internal Server Error.
    cy.intercept(
      'GET', // Method
      'http://localhost:5000/api/bugs', // URL to catch
      { 
        force: true, // Force the response, even if the server is working
        statusCode: 500, // The error code to send back
        body: { message: 'Internal Server Error' } // The error body
      }
    ).as('getBugsFail'); // Give it a name

    // --- ACT ---
    // Visit the page. The app will try to fetch bugs and will
    // receive our fake 500 error.
    cy.visit('/');

    // --- ASSERT ---
    // 1. Check that the "Loading..." message appears and then disappears
    cy.get('[data-testid="loading-message"]').should('be.visible');
    cy.get('[data-testid="loading-message"]').should('not.exist');

    // 2. Check that your app is now showing the error message
    // This <p> is in your App.jsx file
    cy.get('[data-testid="error-state"]').should('be.visible');
    
    // 3. Check that the error message contains the correct text
    // (This matches the error we created in your App.jsx)
    cy.get('[data-testid="error-state"]').should('contain', 'HTTP error! status: 500');

    // 4. Check that no bug list is shown
    cy.get('[data-testid="bug-list-items"]').should('not.exist');

    cy.log('--- Error handling test complete! ---');
  });

  it('should show an error if the user submits a form with invalid data', () => {
    // This tests the client-side validation in your BugForm.jsx
    cy.visit('/');

    // Intercept the POST request, but it should never be called
    cy.intercept('POST', 'http://localhost:5000/api/bugs').as('createBug');
    
    // Try to submit the form with no data
    cy.get('[data-testid="submit-button"]').click();

    // --- THIS IS THE FIX ---
    // We tell Cypress to find the 'bug-form' first, and *then*
    // find the 'error-message' *inside* it.
    // This waits for the React re-render to complete.
    cy.get('[data-testid="bug-form"]')
      .find('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Title must be at least 5 characters');

    // Assert that no network request was even made
    cy.get('@createBug.all').should('have.length', 0);
  });

});