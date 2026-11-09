import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Situation, Theme, Tool } from '@/lib/manual';
import { Chapters } from './Chapters';
import { Situations } from './Situations';
import { Toolkit } from './Toolkit';
import type { HomeEntry } from './types';

const entries: HomeEntry[] = [
  { slug: 'a', title: 'Alpha', number: '1.1', minutes: 3, draft: false },
  { slug: 'b', title: 'Bravo', number: '1.2', minutes: 6, draft: false },
  { slug: 'c', title: 'Charlie', number: '2.1', minutes: 9, draft: false },
  { slug: 'd', title: 'Delta', number: '2.2', minutes: 2, draft: true },
];
const situations: Situation[] = [
  { id: 'start', label: "I'm new here", path: [['a', 'Why A'], ['b', 'Why B'], ['c', 'Why C']] },
  { id: 'fire', label: "Something's on fire", path: [['c', 'Fire C'], ['a', 'Fire A'], ['b', 'Fire B']] },
];
const tools: Tool[] = [
  { id: 'waist', name: 'W.A.I.S.T.', slug: 'a', line: 'Be the last to speak.' },
  { id: 'boss', name: 'The boss formula', slug: 'b', line: 'A quarter boss.' },
];
const theme = (id: Theme['id'], name: string): Theme => ({ id, name, colour: '#000' });

afterEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('Situations', () => {
  it('shows the first reading order, then swaps and announces another', () => {
    render(<Situations situations={situations} entries={entries} count={3} />);
    const panel = document.getElementById('reading-order')!;
    const steps = () => within(panel).getAllByRole('link').filter((l) => l.getAttribute('href')?.includes('?via='));
    expect(steps().map((l) => l.textContent)).toEqual([
      expect.stringContaining('Alpha'),
      expect.stringContaining('Bravo'),
      expect.stringContaining('Charlie'),
    ]);

    const fire = screen.getByRole('button', { name: /Something's on fire/ });
    fireEvent.click(fire);
    expect(fire).toHaveAttribute('aria-pressed', 'true');
    expect(steps()[0]).toHaveTextContent('Charlie');
    expect(steps()[0]).toHaveAttribute('href', '/posts/c?via=fire');
    expect(panel.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Reading order for Something's on fire: Charlie, then Alpha, then Bravo."
    );
  });

  it('preselects ?situation=', async () => {
    window.history.replaceState(null, '', '/?situation=fire');
    render(<Situations situations={situations} entries={entries} count={3} />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Something's on fire/ })).toHaveAttribute('aria-pressed', 'true'));
  });

  it('only offers published entries that fit the minutes', () => {
    render(<Situations situations={situations} entries={entries} count={3} />);
    fireEvent.change(screen.getByLabelText(/I've got/), { target: { value: '6' } });
    const picks = screen.getAllByRole('link').filter((l) => !l.getAttribute('href')?.includes('?via='));
    expect(picks.map((l) => l.textContent)).toEqual([expect.stringContaining('Bravo'), expect.stringContaining('Alpha')]);
  });
});

describe('Toolkit', () => {
  it('flips a card, hides the face you can no longer see, and moves focus', async () => {
    render(<Toolkit tools={tools} titles={{ a: 'Alpha', b: 'Bravo' }} />);
    const front = screen.getByRole('button', { name: /W\.A\.I\.S\.T\./ });
    expect(front).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Be the last to speak.').closest('[inert]')).not.toBeNull();

    fireEvent.click(front);
    expect(front).toHaveAttribute('aria-expanded', 'true');
    expect(front).toHaveAttribute('inert');
    expect(screen.getByText('Be the last to speak.').closest('[inert]')).toBeNull();
    const back = screen.getByRole('link', { name: /Read “Alpha”/ });
    await waitFor(() => expect(back).toHaveFocus());

    fireEvent.click(within(back.parentElement!).getByRole('button', { name: /Back/ }));
    await waitFor(() => expect(front).toHaveFocus());
    expect(front).not.toHaveAttribute('inert');
  });
});

describe('Chapters', () => {
  const chapters = [
    { theme: theme('people', 'Leading people'), number: 1, entries: entries.slice(0, 2) },
    { theme: theme('words', 'Saying it well'), number: 2, entries: entries.slice(2, 3) },
  ];

  it('ticks an entry, counts it and remembers it', async () => {
    const { unmount } = render(<Chapters chapters={chapters} total={3} />);
    const tick = screen.getByRole('button', { name: 'Read: Bravo' });
    await act(async () => fireEvent.click(tick));
    expect(tick).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(JSON.parse(localStorage.getItem('fm-read')!)).toEqual(['b']);

    unmount();
    render(<Chapters chapters={chapters} total={3} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Read: Bravo' })).toHaveAttribute('aria-pressed', 'true'));
  });

  it('still ticks for this page view when storage is blocked', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<Chapters chapters={chapters} total={3} />);
    const tick = screen.getByRole('button', { name: 'Read: Alpha' });
    await act(async () => fireEvent.click(tick));
    expect(tick).toHaveAttribute('aria-pressed', 'true');
    get.mockRestore();
    set.mockRestore();
  });
});
