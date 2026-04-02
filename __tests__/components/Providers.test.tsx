import { render, screen } from '@testing-library/react';
import Providers from '@/components/Providers';

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

it('renders its children', () => {
  render(<Providers><div>hello</div></Providers>);
  expect(screen.getByText('hello')).toBeInTheDocument();
});
