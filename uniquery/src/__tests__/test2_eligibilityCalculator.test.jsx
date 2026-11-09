import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EligibilityCalculatorModal from '../components/EligibilityCalculatorModal';

describe('Test 2: Boundary Value & Equivalence Partitioning — Instant Eligibility Calculator', () => {
  test('TC_04: Upper valid partition (SSC 5.00 + HSC 5.00, Science, STEM 15.0) qualifies for all 5 tracks and merit waiver', () => {
    // Arrange
    render(
      <EligibilityCalculatorModal
        isOpen={true}
        onClose={vi.fn()}
        onExploreMatches={vi.fn()}
      />
    );
    const spinbuttons = screen.getAllByRole('spinbutton');
    const sscInput = spinbuttons[0];
    const hscInput = spinbuttons[1];

    // Act
    fireEvent.change(sscInput, { target: { value: '5.00' } });
    fireEvent.change(hscInput, { target: { value: '5.00' } });

    // Assert
    expect(screen.getByText('10.00')).toBeInTheDocument();
    expect(screen.getByText('Eligible for 5 of 5 Tracks')).toBeInTheDocument();
    expect(screen.getByText(/50–100% Merit Tuition Waiver/i)).toBeInTheDocument();
  });

  test('TC_05: Boundary Value Analysis at Dhaka University threshold (Combined GPA 8.00 vs 7.99)', () => {
    // Arrange
    render(
      <EligibilityCalculatorModal
        isOpen={true}
        onClose={vi.fn()}
        onExploreMatches={vi.fn()}
      />
    );
    const [sscInput, hscInput] = screen.getAllByRole('spinbutton');

    // Act (Exact Boundary = 8.00: SSC 4.00 + HSC 4.00)
    fireEvent.change(sscInput, { target: { value: '4.00' } });
    fireEvent.change(hscInput, { target: { value: '4.00' } });

    // Assert (8.00 meets DU >= 8.00, BUET >= 4.00 each, GST >= 7.50, Private >= 7.00; fails Medical >= 9.00)
    expect(screen.getByText('8.00')).toBeInTheDocument();
    expect(screen.getByText('Eligible for 4 of 5 Tracks')).toBeInTheDocument();
    expect(screen.getByText(/Fully eligible for Dhaka University Unit A/i)).toBeInTheDocument();

    // Act (Lower Math GP to 4.0 -> STEM sum = 14.0 < 14.5 BUET threshold)
    const mathInput = screen.getAllByRole('spinbutton')[2];
    fireEvent.change(mathInput, { target: { value: '4.0' } });
    expect(screen.getByText(/Requires near-perfect Grade Points in Math, Physics, and Chemistry/i)).toBeInTheDocument();

    // Act (Just Below DU Boundary = 7.99: SSC 3.99 + HSC 4.00)
    fireEvent.change(sscInput, { target: { value: '3.99' } });

    // Assert (7.99 fails DU < 8.00 and BUET SSC < 4.00; only GST >= 7.50 & Private >= 7.00 remain eligible)
    expect(screen.getByText('7.99')).toBeInTheDocument();
    expect(screen.getByText('Eligible for 2 of 5 Tracks')).toBeInTheDocument();
    expect(screen.getByText(/Combined GPA is 7.99, but DU requires min 8.00 total/i)).toBeInTheDocument();
  });

  test('TC_06: Equivalence Partitioning for non-Science discipline (Commerce) blocks Science-only tracks with accurate reason', () => {
    // Arrange
    render(
      <EligibilityCalculatorModal
        isOpen={true}
        onClose={vi.fn()}
        onExploreMatches={vi.fn()}
      />
    );
    const groupSelect = screen.getByRole('combobox');

    // Act
    fireEvent.change(groupSelect, { target: { value: 'Commerce' } });

    // Assert
    // Only GST and Top Private remain eligible (2 of 5 Tracks); BUET, DU Science Unit, and Medical are ineligible
    expect(screen.getByText('Eligible for 2 of 5 Tracks')).toBeInTheDocument();
    // Ineligible Science-only cards must NOT claim "Fully eligible" when student is from Commerce group
    expect(screen.queryByText(/Fully eligible to apply for preliminary screening/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fully eligible for Dhaka University Unit A/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Science group/i).length).toBeGreaterThan(0);
  });
});
