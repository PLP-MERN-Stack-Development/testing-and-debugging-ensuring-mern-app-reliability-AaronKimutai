import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import BugForm from '../../components/BugForm';

// Mock axios
jest.mock('axios');

describe('BugForm Integration Tests', () => {
  const mockOnBugCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit form data to API and call onBugCreated callback', async () => {
    const mockBugResponse = {
      data: {
        _id: '123',
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'High',
        status: 'Open',
      },
    };

    axios.post.mockResolvedValueOnce(mockBugResponse);

    render(<BugForm onBugCreated={mockOnBugCreated} />);

    // fill in the form
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Bug' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test bug description' },
    });
    fireEvent.change(screen.getByTestId('priority-select'), {
      target: { value: 'High' },
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // wait for API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/bugs',
        expect.objectContaining({
          title: 'Test Bug',
          description: 'This is a test bug description',
          priority: 'High',
          status: 'Open',
        })
      );
    });

    await waitFor(() => {
      expect(mockOnBugCreated).toHaveBeenCalledWith(mockBugResponse.data);
    });


    expect(screen.getByTestId('success-message')).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    const errorResponse = {
      response: {
        data: { error: 'Failed to create bug' },
      },
    };

    axios.post.mockRejectedValueOnce(errorResponse);

    render(<BugForm />);

   
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Bug Title' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test bug description that meets requirements' },
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to create bug')).toBeInTheDocument();
    });
  });

  it('should validate form fields before submission', async () => {
    render(<BugForm />);

  
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test' }, 
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Short' }, 
    });

    fireEvent.click(screen.getByTestId('submit-button'));

   
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should reset form after successful submission', async () => {
    const mockBugResponse = {
      data: {
        _id: '123',
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'Medium',
        status: 'Open',
      },
    };

    axios.post.mockResolvedValueOnce(mockBugResponse);

    render(<BugForm />);

    const titleInput = screen.getByTestId('title-input');
    const descriptionInput = screen.getByTestId('description-input');

    
    fireEvent.change(titleInput, {
      target: { value: 'Test Bug' },
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'This is a test bug description' },
    });

    fireEvent.click(screen.getByTestId('submit-button'));

    // Wait for form reset
    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });
  });

  it('should disable submit button while loading', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    axios.post.mockReturnValueOnce(promise);

    render(<BugForm />);

    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Bug Title' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test bug description' },
    });

    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    // resolve the promise
    resolvePromise({
      data: {
        _id: '123',
        title: 'Test Bug Title',
        description: 'This is a test bug description',
        priority: 'Low',
        status: 'Open',
      },
    });

    // Wait for button to be enabled again
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should use custom API URL when provided', async () => {
    const customApiUrl = 'http://custom-api.com/bugs';
    const mockBugResponse = {
      data: {
        _id: '123',
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'Low',
        status: 'Open',
      },
    };

    axios.post.mockResolvedValueOnce(mockBugResponse);

    render(<BugForm apiUrl={customApiUrl} />);

    // fill in and submit form
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Bug Title' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'This is a test bug description' },
    });

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        customApiUrl,
        expect.any(Object)
      );
    });
  });
});

