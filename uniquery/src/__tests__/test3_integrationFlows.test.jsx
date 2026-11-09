import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('Test 3: Integration & End-to-End User Flows — Compare, Explore Wizard & Notices', () => {
  test('TC_07: Enforces maximum 4 universities in Comparison Matrix and shows warning toast on 5th selection', () => {
    // Arrange
    render(<App />);

    // Navigate to Explore Results (3 universities pre-selected: BUET, DU, RU)
    fireEvent.click(screen.getByRole('button', { name: /View All 50\+ Universities/i }));

    // Act — Add a 4th university (CU) to comparison dock, then attempt to add a 5th (KUET)
    const addToCompareButtons = screen.getAllByRole('button', { name: /Add to Compare/i });
    fireEvent.click(addToCompareButtons[0]); // Adds 4th university
    const remainingAddButtons = screen.getAllByRole('button', { name: /Add to Compare/i });
    fireEvent.click(remainingAddButtons[0]); // Attempts 5th university

    // Assert — Warning toast appears and comparison count stays capped at 4
    expect(screen.getByText(/Maximum 4 universities can be compared at once/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Side-by-Side Comparison Matrix/i }));
    expect(screen.getByText('4 of 4 selected')).toBeInTheDocument();

    // Toggle "Highlight Differences" in Compare Matrix
    fireEvent.click(screen.getByRole('button', { name: /Highlight Differences/i }));
    expect(screen.getByRole('button', { name: /Differences Highlighted/i })).toBeInTheDocument();
  });

  test('TC_08: Completes Explore Results -> Recalculate Wizard -> Check Eligibility profile update flow', () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /View All 50\+ Universities/i }));

    // Act — Open Wizard via "Recalculate Wizard", change HSC GPA to 4.50, and submit "Check Eligibility"
    fireEvent.click(screen.getByRole('button', { name: /Recalculate Wizard/i }));
    expect(screen.getByText(/Find universities you’re eligible for/i)).toBeInTheDocument();

    const mainArea = screen.getByRole('main');
    const selects = within(mainArea).getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '4.50' } });
    fireEvent.click(within(mainArea).getByRole('button', { name: /Check Eligibility/i }));

    // Assert — Returns to Explore Results with updated HSC GPA 4.50 and toast confirmation
    expect(screen.getByText(/Eligible Universities & Programs/i)).toBeInTheDocument();
    expect(screen.getByText('4.50')).toBeInTheDocument();
  });

  test('TC_09: Filters Admission Notices by "Closing Soon" status and opens Notice Details modal without error', () => {
    // Arrange
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Official Circulars & Deadlines/i }));
    expect(screen.getByText(/Admission Notices & Deadlines/i)).toBeInTheDocument();

    // Act — Filter by Status = "Closing Soon" and click "View Notice" on the first matching notice
    const statusSelect = screen.getByDisplayValue('All statuses');
    fireEvent.change(statusSelect, { target: { value: 'Closing Soon' } });

    const viewNoticeButtons = screen.getAllByRole('button', { name: /View Notice/i });
    expect(viewNoticeButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewNoticeButtons[0]);

    // Assert — Official Notice Details Modal opens with circular title and portal link
    expect(screen.getByText(/NOTICE DETAILS · OFFICIAL/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Official Notice/i })).toBeInTheDocument();

    // Close modal and reset filters
    fireEvent.click(screen.getByRole('button', { name: /^Close$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Clear$/i }));
    expect(screen.getByDisplayValue('All statuses')).toBeInTheDocument();
  });
});
