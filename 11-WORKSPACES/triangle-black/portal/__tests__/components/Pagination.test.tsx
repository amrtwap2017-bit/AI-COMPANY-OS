import { render, screen } from '@testing-library/react';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPage={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders prev and next buttons', () => {
    render(<Pagination page={2} totalPages={5} onPage={jest.fn()} />);
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('disables prev button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPage={jest.fn()} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPage={jest.fn()} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });
});
