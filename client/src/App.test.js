import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the context providers to avoid authentication issues in tests
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

jest.mock('./context/PreferencesContext', () => ({
  PreferencesProvider: ({ children }) => <div>{children}</div>,
  usePreferences: () => ({
    currency: 'INR',
    updatePreferences: jest.fn()
  })
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
