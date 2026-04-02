import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const mockSetTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

beforeEach(() => {
  mockSetTheme.mockClear();
});

it('renders a toggle button', () => {
  const { useTheme } = jest.requireMock('next-themes');
  (useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme });

  render(<ThemeToggle />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('calls setTheme with dark when currently light', () => {
  const { useTheme } = jest.requireMock('next-themes');
  (useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme });

  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockSetTheme).toHaveBeenCalledWith('dark');
});

it('calls setTheme with light when currently dark', () => {
  const { useTheme } = jest.requireMock('next-themes');
  (useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'dark', setTheme: mockSetTheme });

  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockSetTheme).toHaveBeenCalledWith('light');
});

it('renders nothing before mount', () => {
  jest.spyOn(React, 'useEffect').mockImplementationOnce(() => {});
  const { useTheme } = jest.requireMock('next-themes');
  (useTheme as jest.Mock).mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme });

  render(<ThemeToggle />);
  expect(screen.queryByRole('button')).toBeNull();
});
