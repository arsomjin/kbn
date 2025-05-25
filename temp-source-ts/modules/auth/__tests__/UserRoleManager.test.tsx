import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import UserRoleManager from '../UserRoleManager';
import { usePermissions } from 'hooks/usePermissions';
import { useModal } from 'contexts/ModalContext';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../services/firebase';
import { ROLES } from '../../../constants/roles';
import { PERMISSIONS } from '../../../constants/Permissions';
import { notificationController } from '../../../controllers/notificationController';

// Mock the hooks and Firebase
jest.mock('hooks/usePermissions');
jest.mock('contexts/ModalContext');
jest.mock('firebase/firestore');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {})
    }
  })
}));
jest.mock('../../../controllers/notificationController');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/user-role-manager',
    search: '',
    hash: '',
    state: null
  }),
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock PageDoc component
jest.mock('../../../components/PageDoc', () => ({
  __esModule: true,
  default: () => null
}));

// Mock data
const mockUsers = [
  {
    uid: '1',
    email: 'test1@example.com',
    displayName: 'Test User 1',
    role: ROLES.USER,
    permissions: [],
    accessibleProvinceIds: ['province1'],
    province: 'province1',
    status: 'active',
    firstName: 'Test',
    lastName: 'User 1',
    photoURL: 'https://example.com/photo1.jpg'
  },
  {
    uid: '2',
    email: 'test2@example.com',
    displayName: 'Test User 2',
    role: ROLES.PROVINCE_MANAGER,
    permissions: [PERMISSIONS.USER_VIEW],
    accessibleProvinceIds: ['province2'],
    province: 'province2',
    status: 'active',
    firstName: 'Test',
    lastName: 'User 2',
    photoURL: 'https://example.com/photo2.jpg'
  },
  {
    uid: '3',
    email: 'test3@example.com',
    displayName: 'Test User 3',
    role: ROLES.DEVELOPER,
    permissions: [],
    accessibleProvinceIds: ['province1'],
    province: 'province1',
    status: 'active'
  }
];

const mockProvinces = [
  {
    id: 'province1',
    name: 'Province 1',
    code: 'P1',
    status: 'active'
  },
  {
    id: 'province2',
    name: 'Province 2',
    code: 'P2',
    status: 'active'
  }
];

describe('UserRoleManager', () => {
  const mockHasPermission = jest.fn();
  const mockHasProvinceAccess = jest.fn();
  const mockShowWarning = jest.fn();
  const mockShowSuccess = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: mockHasPermission,
      hasProvinceAccess: mockHasProvinceAccess
    });

    (useModal as jest.Mock).mockReturnValue({
      showWarning: mockShowWarning,
      showSuccess: mockShowSuccess
    });

    // Mock Firestore queries
    (getDocs as jest.Mock).mockImplementation(query => {
      if (query.path === 'users') {
        return Promise.resolve({
          forEach: (callback: any) => mockUsers.forEach(callback)
        });
      }
      if (query.path === 'data/company/provinces') {
        return Promise.resolve({
          forEach: (callback: any) => mockProvinces.forEach(callback)
        });
      }
      return Promise.resolve({ forEach: () => {} });
    });

    // Mock collection and query
    (collection as jest.Mock).mockImplementation((db, path) => ({ path }));
    (query as jest.Mock).mockImplementation((ref, ...conditions) => ref);
    (where as jest.Mock).mockImplementation(() => ({}));
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('fetches and displays users', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });
  });

  it('filters users by search text', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('filters.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Test User 1' } });

    // Check if only Test User 1 is displayed
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.queryByText('Test User 2')).not.toBeInTheDocument();
  });

  it('filters users by role', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Select role filter
    const roleSelect = screen.getByPlaceholderText('filters.filterByRole');
    fireEvent.change(roleSelect, { target: { value: ROLES.USER } });

    // Check if only users with USER role are displayed
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.queryByText('Test User 2')).not.toBeInTheDocument();
  });

  it('shows warning when user lacks permission to view users', async () => {
    mockHasPermission.mockReturnValue(false);

    await act(async () => {
      render(<UserRoleManager />);
    });

    expect(mockShowWarning).toHaveBeenCalledWith('permissions.insufficientPermissions');
  });

  it('handles edit user action', async () => {
    mockHasPermission.mockReturnValue(true);

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getAllByText('actions.edit')[0];
    fireEvent.click(editButton);

    // Check if edit modal is opened
    expect(screen.getByText('editModal.title')).toBeInTheDocument();
  });

  it('handles province access check', async () => {
    mockHasPermission.mockReturnValue(true);
    mockHasProvinceAccess.mockImplementation(provinceId => provinceId === 'province1');

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.queryByText('Test User 2')).not.toBeInTheDocument();
    });
  });

  it('displays loading state while fetching data', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('displays empty state when no users match filters', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Type in search box with non-matching text
    const searchInput = screen.getByPlaceholderText('filters.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });

    // Check if empty state is displayed
    expect(screen.getByText('noMatchingUsers')).toBeInTheDocument();
  });

  it('resets filters when reset button is clicked', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Apply filters
    const searchInput = screen.getByPlaceholderText('filters.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Test User 1' } });

    // Click reset button
    const resetButton = screen.getByText('filters.resetFilters');
    fireEvent.click(resetButton);

    // Check if all users are displayed again
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.getByText('Test User 2')).toBeInTheDocument();
  });

  it('handles user role update successfully', async () => {
    mockHasPermission.mockReturnValue(true);
    const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
    (updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getAllByText('actions.edit')[0];
    fireEvent.click(editButton);

    // Simulate role change in modal
    const roleSelect = screen.getByText('editModal.roleTitle');
    fireEvent.change(roleSelect, { target: { value: ROLES.PROVINCE_MANAGER } });

    // Click save button
    const saveButton = screen.getByText('buttons.save');
    fireEvent.click(saveButton);

    // Verify update was called
    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalled();
    });
  });

  it('handles error during user role update', async () => {
    mockHasPermission.mockReturnValue(true);
    const mockError = new Error('Update failed');
    (updateDoc as jest.Mock).mockRejectedValue(mockError);

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getAllByText('actions.edit')[0];
    fireEvent.click(editButton);

    // Simulate role change in modal
    const roleSelect = screen.getByText('editModal.roleTitle');
    fireEvent.change(roleSelect, { target: { value: ROLES.PROVINCE_MANAGER } });

    // Click save button
    const saveButton = screen.getByText('buttons.save');
    fireEvent.click(saveButton);

    // Verify error handling
    await waitFor(() => {
      expect(mockShowWarning).toHaveBeenCalledWith(mockError.message);
    });
  });

  it('filters users by province', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Select province filter
    const provinceSelect = screen.getByPlaceholderText('filters.filterByProvince');
    fireEvent.change(provinceSelect, { target: { value: 'province1' } });

    // Check if only users from province1 are displayed
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.queryByText('Test User 2')).not.toBeInTheDocument();
  });

  it('excludes developer role users from display', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
      expect(screen.queryByText('Test User 3')).not.toBeInTheDocument();
    });
  });

  it('handles user with missing display name', async () => {
    const userWithoutDisplayName = {
      ...mockUsers[0],
      displayName: undefined,
      firstName: 'Test',
      lastName: 'User'
    };

    (getDocs as jest.Mock).mockImplementation(query => {
      if (query.path === 'users') {
        return Promise.resolve({
          forEach: (callback: any) => callback(userWithoutDisplayName)
        });
      }
      return Promise.resolve({ forEach: () => {} });
    });

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for user to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('handles user with missing photo URL', async () => {
    const userWithoutPhoto = {
      ...mockUsers[0],
      photoURL: undefined
    };

    (getDocs as jest.Mock).mockImplementation(query => {
      if (query.path === 'users') {
        return Promise.resolve({
          forEach: (callback: any) => callback(userWithoutPhoto)
        });
      }
      return Promise.resolve({ forEach: () => {} });
    });

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for user to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      // Check if default avatar is displayed
      expect(screen.getByTestId('user-avatar')).toHaveAttribute('icon', 'user');
    });
  });

  it('sends notification when user role is updated', async () => {
    mockHasPermission.mockReturnValue(true);
    const mockSendNotification = jest.fn();
    (notificationController.sendNotification as jest.Mock).mockImplementation(mockSendNotification);

    await act(async () => {
      render(<UserRoleManager />);
    });

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getAllByText('actions.edit')[0];
    fireEvent.click(editButton);

    // Simulate role change in modal
    const roleSelect = screen.getByText('editModal.roleTitle');
    fireEvent.change(roleSelect, { target: { value: ROLES.PROVINCE_MANAGER } });

    // Click save button
    const saveButton = screen.getByText('buttons.save');
    fireEvent.click(saveButton);

    // Verify notification was sent
    await waitFor(() => {
      expect(mockSendNotification).toHaveBeenCalled();
    });
  });

  it('handles window resize for responsive design', async () => {
    await act(async () => {
      render(<UserRoleManager />);
    });

    // Simulate window resize
    global.innerWidth = 500;
    fireEvent(window, new Event('resize'));

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    // Check if mobile view is applied
    const editButton = screen.getAllByText('actions.edit')[0];
    expect(editButton).toHaveClass('ant-btn-sm');
  });
});
