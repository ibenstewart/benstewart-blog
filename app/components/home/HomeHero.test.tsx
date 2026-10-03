import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeHero } from './HomeHero';

describe('HomeHero', () => {
  it('renders the portrait with its alt text when a photo is given', () => {
    render(
      <HomeHero
        tagline="Engineer turned leader."
        place="Glasgow"
        photo={{ src: '/images/ben-stewart.jpg', alt: 'Ben on stage' }}
      >
        <p>Intro</p>
      </HomeHero>,
    );

    const img = screen.getByRole('img', { name: 'Ben on stage' });
    expect(img).toHaveAttribute('src', '/images/ben-stewart.jpg');
  });

  it('renders no image without a photo', () => {
    render(
      <HomeHero tagline="Engineer turned leader." place="Glasgow">
        <p>Intro</p>
      </HomeHero>,
    );

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Engineer turned leader.')).toBeInTheDocument();
  });
});
