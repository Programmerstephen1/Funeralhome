import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CartPage from '../pages/CartPage';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockSendOtp = vi.fn();

vi.mock('../services/api', () => ({
  default: {
    login: (...args) => mockLogin(...args),
    register: (...args) => mockRegister(...args),
    sendOtp: (...args) => mockSendOtp(...args),
  },
}));

describe('auth and cart flows', () => {
  beforeEach(() => {
    localStorage.clear();
    mockLogin.mockReset();
    mockRegister.mockReset();
    mockSendOtp.mockReset();
    window.location.hash = '#home';
  });

  it('shows a helpful error state when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });

  it('routes to verification after successful registration', async () => {
    mockRegister.mockResolvedValue({});
    mockSendOtp.mockResolvedValue({});

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'secret123' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    await waitFor(() => expect(window.location.hash).toBe('#verify'));
  });

  it('shows an empty cart state and allows browsing the catalog', () => {
    render(<CartPage cart={[]} updateQuantity={() => {}} removeFromCart={() => {}} />);

    expect(screen.getByText(/your booking cart is ready/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to catalog/i })).toHaveAttribute('href', '#catalog');
  });
});
