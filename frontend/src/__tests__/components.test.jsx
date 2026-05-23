import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../src/components/Login';
import Dashboard from '../src/pages/Dashboard';
import Settings from '../src/pages/Settings';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Login Component', () => {
  it('renders login form', () => {
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Login');
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('requires email and password fields', async () => {
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);
    
    const submitButton = screen.getByText('Login');
    await userEvent.click(submitButton);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.removeItem('token');
  });

  it('renders children when token exists', () => {
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when token missing', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});

describe('Settings Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  it('renders settings form with provider dropdown', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/AI Provider/)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/)).toBeInTheDocument();
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  it('renders dashboard with key metrics', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Command Center/)).toBeInTheDocument();
    expect(screen.getByText(/Active Campaigns/)).toBeInTheDocument();
    expect(screen.getByText(/Content Assets/)).toBeInTheDocument();
    expect(screen.getByText(/Referral Tracker/)).toBeInTheDocument();
  });
});
