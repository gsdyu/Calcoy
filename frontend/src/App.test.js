import { render, screen } from '@testing-library/react';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

test('renders learn react link', () => {
  <Analytics />
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
