import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders with emerald classes for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('renders with red classes for error status', () => {
    const { container } = render(<StatusBadge status="overdue" />);
    expect(container.firstChild).toHaveClass('bg-red-50');
  });

  it('renders dot when dot prop is true', () => {
    const { container } = render(<StatusBadge status="active" dot />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('replaces underscores with spaces in label', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });
});
