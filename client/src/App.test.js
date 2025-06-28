import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the context providers to avoid authentication issues in tests
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

jest.mock('./context/UserPreferencesContext', () => ({
  UserPreferencesProvider: ({ children }) => <div data-testid="preferences-provider">{children}</div>,
  useUserPreferences: () => ({
    preferences: { currency: 'INR' },
    updatePreferences: jest.fn()
  })
}));

// Mock services to avoid API calls in tests
jest.mock('./services/api', () => ({
  authAPI: {
    getCurrentUser: jest.fn(() => Promise.resolve({ data: null }))
  }
}));

test('renders without crashing', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Just check that it renders without throwing an error
  expect(document.body).toBeInTheDocument();
});
