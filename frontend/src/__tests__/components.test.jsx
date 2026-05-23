import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Login from '../components/Login';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import AIHub from '../pages/AIHub';
import AIAgentsHub from '../pages/AIAgentsHub';
import ProtectedRoute from '../components/ProtectedRoute';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

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
    axios.get.mockResolvedValue({ data: { ai_provider: 'openai', ai_api_key: 'test-key' } });
    axios.post.mockResolvedValue({ data: { ai_provider: 'openai', ai_api_key: 'saved-key' } });
  });

  it('renders settings form with provider dropdown', async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/AI Provider/)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/)).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/OpenAI/i)).toBeInTheDocument();
  });

  it('saves the settings when form is submitted', async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    const saveButton = await screen.findByRole('button', { name: /Save Settings/i });
    await userEvent.click(saveButton);

    expect(axios.post).toHaveBeenCalledWith(
      '/settings',
      { ai_provider: 'openai', ai_api_key: 'test-key' },
      { headers: { Authorization: 'Bearer test-token' } }
    );
    expect(await screen.findByText(/Settings saved successfully!/i)).toBeInTheDocument();
  });
});

describe('AIHub Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValue({ data: { ai_provider: 'claude', ai_api_key: 'test-key' } });
  });

  it('loads configured provider and executes AI prompt', async () => {
    axios.post.mockResolvedValue({ data: { provider: 'claude', model: 'default', output: 'AI response' } });

    render(
      <BrowserRouter>
        <AIHub />
      </BrowserRouter>
    );

    expect(await screen.findByDisplayValue('claude')).toBeInTheDocument();

    const promptInput = screen.getByPlaceholderText(/Ask the AI to generate a campaign idea/i);
    await userEvent.type(promptInput, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: /Run AI Prompt/i });
    await userEvent.click(submitButton);

    expect(axios.post).toHaveBeenCalledWith(
      '/ai/execute',
      expect.objectContaining({ prompt: 'Test prompt', temperature: 0.7 }),
      { headers: { Authorization: 'Bearer test-token' } }
    );
    expect(await screen.findByText(/AI Output/i)).toBeInTheDocument();
    expect(screen.getByText(/AI response/i)).toBeInTheDocument();
  });
});

describe('AIAgentsHub Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValue({ data: { ai_provider: 'claude', ai_api_key: 'test-key' } });
  });

  it('renders agents and executes agent request', async () => {
    axios.post.mockResolvedValue({ data: { provider: 'claude', model: 'default', output: 'Agent result' } });

    render(
      <BrowserRouter>
        <AIAgentsHub />
      </BrowserRouter>
    );

    const agentButton = await screen.findByText('Content Analyzer');
    await userEvent.click(agentButton);

    const inputArea = screen.getByPlaceholderText(/Describe your request for Content Analyzer/i);
    await userEvent.type(inputArea, 'Analyze our latest campaign');

    const executeButton = screen.getByRole('button', { name: /Execute Agent/i });
    await userEvent.click(executeButton);

    expect(axios.post).toHaveBeenCalledWith(
      '/ai/execute',
      expect.objectContaining({ prompt: expect.stringContaining('Analyze our latest campaign'), temperature: 0.6 }),
      { headers: { Authorization: 'Bearer test-token' } }
    );
    expect(await screen.findByText(/Agent Response:/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent result/i)).toBeInTheDocument();
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockImplementation((url) => {
      if (url === '/campaigns') return Promise.resolve({ data: [{ id: 1 }] });
      if (url === '/content') return Promise.resolve({ data: [{ id: 1 }, { id: 2 }] });
      if (url === '/referrals') return Promise.resolve({ data: [{ clicks: 5 }, { clicks: 7 }] });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders dashboard with key metrics', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Command Center/i)).toBeInTheDocument();
    expect(await screen.findByText(/Active Campaigns/i)).toBeInTheDocument();
    expect(await screen.findByText(/Content Assets/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total Referral Clicks/i)).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('12')).toBeInTheDocument();
  });
});
