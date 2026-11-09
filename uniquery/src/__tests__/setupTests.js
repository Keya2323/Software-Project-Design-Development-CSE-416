import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock browser scrollTo for jsdom environment
window.scrollTo = vi.fn();
