import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

const ResizeObserverMock = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

vi.mock('zustand') // mock zustand so we can have it reset state between tests

// Mock scrollIntoView so we don't get errors
// https://github.com/jsdom/jsdom/issues/1695
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.HTMLElement.prototype.scrollIntoView = vi.fn()
