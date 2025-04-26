
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import jest-dom for additional matchers
import NotificationsDropdown from '../NotificationsDropdown';
import { AuthProvider } from '../../../contexts/auth';
import { supabase } from '../../../integrations/supabase/client';
import { mockNotifications } from './mockData';

// Mock Supabase and Auth context
jest.mock('../../../integrations/supabase/client', () => ({
  supabase: {
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    })
  }
}));

jest.mock('../../../contexts/auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    userId: 'test-user-id'
  })
}));

describe('NotificationsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders no notifications when empty', async () => {
    render(
      <AuthProvider>
        <NotificationsDropdown />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });
  });

  test('renders notifications correctly', async () => {
    // Simulate notifications fetch
    jest.spyOn(require('../useNotifications'), 'useNotifications').mockReturnValue({
      notifications: mockNotifications,
      isLoading: false
    });

    render(
      <AuthProvider>
        <NotificationsDropdown />
      </AuthProvider>
    );

    await waitFor(() => {
      mockNotifications.forEach(notification => {
        expect(screen.getByText(notification.title)).toBeInTheDocument();
      });
    });
  });

  test('marks notification as read when clicked', async () => {
    const mockMarkAsRead = jest.fn();
    jest.spyOn(require('../../integrations/supabase/notifications'), 'markNotificationAsRead')
      .mockImplementation(mockMarkAsRead);

    render(
      <AuthProvider>
        <NotificationsDropdown />
      </AuthProvider>
    );

    const firstNotification = screen.getAllByRole('menuitem')[0];
    fireEvent.click(firstNotification);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith(mockNotifications[0].id);
    });
  });
});
