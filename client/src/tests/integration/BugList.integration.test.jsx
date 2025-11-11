import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import BugList from '../../components/BugList';

// Mock axios
jest.mock('axios');

// mock window.confirm
window.confirm = jest.fn(() => true);

describe('BugList Integration Tests', () => {
  const mockBugs = [
    {
      _id: '1',
      title: 'Bug One',
      description: 'Description for bug one',
      priority: 'High',
      status: 'Open',
    },
    {
      _id: '2',
      title: 'Bug Two',
      description: 'Description for bug two',
      priority: 'Low',
      status: 'In-Progress',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display bugs from API on mount', async () => {
    axios.get.mockResolvedValueOnce({ data: mockBugs });

    render(<BugList />);


    expect(screen.getByTestId('loading-message')).toBeInTheDocument();

    // wait for bugs to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/bugs');
    });

    // Verify bugs are displayed
    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
      expect(screen.getByText('Bug Two')).toBeInTheDocument();
      expect(screen.getByTestId('bug-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('bug-item-2')).toBeInTheDocument();
    });
  });

  it('should display error message when API fetch fails', async () => {
    const errorResponse = {
      response: {
        data: { error: 'Failed to fetch bugs' },
      },
    };

    axios.get.mockRejectedValueOnce(errorResponse);

    render(<BugList />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch bugs')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });
  });

  it('should display empty message when no bugs are found', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<BugList />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
      expect(screen.getByText(/No bugs found/i)).toBeInTheDocument();
    });
  });

  it('should delete a bug when delete button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: mockBugs });
    axios.delete.mockResolvedValueOnce({ data: { message: 'Bug deleted successfully' } });

    render(<BugList />);

 
    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
    });

 
    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    // Verify API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:3000/api/bugs/1');
    });

    // verify that the bug is removed from list
    await waitFor(() => {
      expect(screen.queryByText('Bug One')).not.toBeInTheDocument();
      expect(screen.getByText('Bug Two')).toBeInTheDocument();
    });
  });

  it('should update bug status when status select changes', async () => {
    const updatedBug = {
      ...mockBugs[0],
      status: 'Resolved',
    };

    axios.get.mockResolvedValueOnce({ data: mockBugs });
    axios.put.mockResolvedValueOnce({ data: updatedBug });

    render(<BugList />);

  
    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
    });

    // Change status select
    const statusSelect = screen.getByTestId('status-select-1');
    fireEvent.change(statusSelect, { target: { value: 'Resolved' } });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/bugs/1',
        { status: 'Resolved' }
      );
    });

    // Verify status is updated in the UI
    await waitFor(() => {
      expect(statusSelect.value).toBe('Resolved');
    });
  });

  it('should refresh bugs when refresh button is clicked', async () => {
    axios.get.mockResolvedValue({ data: mockBugs });

    render(<BugList />);

    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
    });

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    // Verify API is called again
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should call onBugDeleted callback when bug is deleted', async () => {
    const mockOnBugDeleted = jest.fn();
    axios.get.mockResolvedValueOnce({ data: mockBugs });
    axios.delete.mockResolvedValueOnce({ data: { message: 'Bug deleted successfully' } });

    render(<BugList onBugDeleted={mockOnBugDeleted} />);

    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
    });


    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);


    await waitFor(() => {
      expect(mockOnBugDeleted).toHaveBeenCalledWith('1');
    });
  });

  it('should use custom API URL when provided', async () => {
    const customApiUrl = 'http://custom-api.com/bugs';
    axios.get.mockResolvedValueOnce({ data: mockBugs });

    render(<BugList apiUrl={customApiUrl} />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(customApiUrl);
    });
  });

  it('should handle delete error gracefully', async () => {
    axios.get.mockResolvedValueOnce({ data: mockBugs });
    axios.delete.mockRejectedValueOnce({
      response: {
        data: { error: 'Failed to delete bug' },
      },
    });

    render(<BugList />);


    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
    });

  
    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to delete bug')).toBeInTheDocument();
    });

    // Bug should still be in the list
    expect(screen.getByText('Bug One')).toBeInTheDocument();
  });

  it('should not delete bug if user cancels confirmation', async () => {
    window.confirm.mockReturnValueOnce(false);
    
    axios.get.mockResolvedValueOnce({ data: mockBugs });

    render(<BugList />);

    await waitFor(() => {
      expect(screen.getByText('Bug One')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    expect(axios.delete).not.toHaveBeenCalled();
    expect(screen.getByText('Bug One')).toBeInTheDocument();
  });
});

