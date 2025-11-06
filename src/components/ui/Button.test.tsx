import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply primary variant styles by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByText('Primary Button');

    expect(button).toHaveClass('bg-purple-600');
    expect(button).toHaveClass('hover:bg-purple-700');
  });

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');

    expect(button).toHaveClass('bg-teal-600');
  });

  it('should apply outline variant styles', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByText('Outline Button');

    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-purple-300');
  });

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByText('Ghost Button');

    expect(button).toHaveClass('text-gray-600');
  });

  it('should apply small size styles', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByText('Small Button');

    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
    expect(button).toHaveClass('text-sm');
  });

  it('should apply medium size styles by default', () => {
    render(<Button>Medium Button</Button>);
    const button = screen.getByText('Medium Button');

    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
    expect(button).toHaveClass('text-base');
  });

  it('should apply large size styles', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByText('Large Button');

    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
    expect(button).toHaveClass('text-lg');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should not call onClick when button is disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    await user.click(screen.getByText('Disabled Button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading spinner when loading is true', () => {
    render(<Button loading>Loading Button</Button>);

    // Check if Loader2 icon is rendered
    const button = screen.getByText('Loading Button');
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should be disabled when loading is true', () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByText('Loading Button');

    expect(button).toBeDisabled();
  });

  it('should not call onClick when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button loading onClick={handleClick}>
        Loading Button
      </Button>
    );

    await user.click(screen.getByText('Loading Button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByText('Custom Button');

    expect(button).toHaveClass('custom-class');
  });

  it('should forward additional HTML button attributes', () => {
    render(
      <Button type="submit" data-testid="submit-btn">
        Submit
      </Button>
    );

    const button = screen.getByTestId('submit-btn');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should have proper focus styles', () => {
    render(<Button>Focus Button</Button>);
    const button = screen.getByText('Focus Button');

    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
  });
});
