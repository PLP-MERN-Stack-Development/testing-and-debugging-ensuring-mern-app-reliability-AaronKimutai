import React from 'react';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import axios from 'axios';
import BugForm from '../../components/BugForm';
import { useBugForm } from '../../hooks/useForm';

// Mock axios
jest.mock('axios');

describe('Form Submission and Validation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('BugForm Component Validation', () => {
    it('should validate title minimum length', async () => {
      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(titleInput, { target: { value: 'Test' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a valid description that meets requirements' },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument();
      });

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should validate description minimum length', async () => {
      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Short' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
      const mockResponse = {
        data: {
          _id: '123',
          title: 'Valid Bug Title',
          description: 'This is a valid description that meets requirements',
          priority: 'High',
          status: 'Open',
        },
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const prioritySelect = screen.getByTestId('priority-select');
      const submitButton = screen.getByTestId('submit-button');

      // fill form with valid data
      fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a valid description that meets requirements' },
      });
      fireEvent.change(prioritySelect, { target: { value: 'High' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/bugs',
          expect.objectContaining({
            title: 'Valid Bug Title',
            description: 'This is a valid description that meets requirements',
            priority: 'High',
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user starts typing', async () => {
      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-button');

      await act(async () => {
        fireEvent.change(titleInput, { target: { value: 'Test' } });
        fireEvent.change(descriptionInput, {
          target: { value: 'This is a valid description that meets requirements' },
        });
        fireEvent.click(submitButton);
      });

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle form submission with all priority levels', async () => {
      const priorities = ['Low', 'Medium', 'High', 'Critical'];
      axios.post.mockResolvedValue({ data: { _id: '123', title: 'Test', description: 'Test description' } });

      for (const priority of priorities) {
        const { unmount } = render(<BugForm />);

        const titleInput = screen.getByTestId('title-input');
        const descriptionInput = screen.getByTestId('description-input');
        const prioritySelect = screen.getByTestId('priority-select');
        const submitButton = screen.getByTestId('submit-button');

        fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
        fireEvent.change(descriptionInput, {
          target: { value: 'This is a valid description that meets requirements' },
        });
        fireEvent.change(prioritySelect, { target: { value: priority } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ priority })
          );
        });

        unmount();
        jest.clearAllMocks();
      }
    });

    it('should handle form submission with all status levels', async () => {
      const statuses = ['Open', 'In-Progress', 'Resolved', 'Closed'];
      axios.post.mockResolvedValue({ data: { _id: '123', title: 'Test', description: 'Test description' } });

      for (const status of statuses) {
        const { unmount } = render(<BugForm />);

        const titleInput = screen.getByTestId('title-input');
        const descriptionInput = screen.getByTestId('description-input');
        const statusSelect = screen.getByTestId('status-select');
        const submitButton = screen.getByTestId('submit-button');

        fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
        fireEvent.change(descriptionInput, {
          target: { value: 'This is a valid description that meets requirements' },
        });
        fireEvent.change(statusSelect, { target: { value: status } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ status })
          );
        });

        unmount();
        jest.clearAllMocks();
      }
    });
  });

  describe('useBugForm Hook Validation', () => {
    it('should validate form data using hook - fails when fields are empty', () => {
      const { result } = renderHook(() => useBugForm());

      let isValid;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe('All fields are required');
    });

    it('should pass validation when fields are filled (hook only checks for existence)', () => {
      const { result } = renderHook(() => useBugForm());

      act(() => {
        result.current.handleChange({
          target: { name: 'title', value: 'Test' },
        });
        result.current.handleChange({
          target: { name: 'description', value: 'Short' },
        });
      });

      let isValid;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBe('');
    });

    it('should pass validation with valid data', () => {
      const { result } = renderHook(() =>
        useBugForm({ title: 'Valid Title', description: 'Valid Description' })
      );

      let isValid;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBe('');
    });

    it('should reset form to initial values', () => {
      const initialValues = { title: 'Initial', description: 'Initial Desc', status: 'open' };
      const { result } = renderHook(() => useBugForm(initialValues));

      act(() => {
        result.current.handleChange({
          target: { name: 'title', value: 'Changed' },
        });
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual(initialValues);
    });
  });

  describe('Error Handling in Form Submission', () => {
    it('should display server validation errors', async () => {
      const serverError = {
        response: {
          data: { error: 'Title must be at least 5 characters' },
        },
      };

      axios.post.mockRejectedValueOnce(serverError);

      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-button');

      // Submit with client-side valid data 
      fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a valid description that meets requirements' },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a valid description that meets requirements' },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/failed to create bug/i)).toBeInTheDocument();
      });
    });

    it('should prevent multiple submissions while loading', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      axios.post.mockReturnValueOnce(promise);

      render(<BugForm />);

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(titleInput, { target: { value: 'Valid Bug Title' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'This is a valid description that meets requirements' },
      });

      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      expect(axios.post).toHaveBeenCalledTimes(1);

      resolvePromise({
        data: { _id: '123', title: 'Valid Bug Title', description: 'Test' },
      });
    });
  });
});
