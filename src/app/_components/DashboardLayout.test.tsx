import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardLayout, type DashboardNavItem } from './DashboardLayout';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return function Link(props: any) {
    const { href, children, ...rest } = props;
    return (
      <a href={typeof href === 'string' ? href : href?.pathname} {...rest}>
        {children}
      </a>
    );
  };
});

const nextNavigation = require('next/navigation');

function setPathname(pathname: string) {
  nextNavigation.usePathname.mockReturnValue(pathname);
}

describe('DashboardLayout (App Router)', () => {
  test('renders nav items and marks active route', () => {
    setPathname('/reports');

    render(
      <DashboardLayout user={{ name: 'RKT Travels', role: 'owner', notificationsCount: 3 }}>
        <div>Body</div>
      </DashboardLayout>
    );

    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports/Data' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  test('calls onLogout when provided', async () => {
    setPathname('/dashboard');

    const user = userEvent.setup();
    const onLogout = jest.fn();

    render(
      <DashboardLayout user={{ name: 'RKT Travels', role: 'supervisor' }} onLogout={onLogout}>
        <div />
      </DashboardLayout>
    );

    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test('hides logout when onLogout is not provided', () => {
    setPathname('/dashboard');

    render(
      <DashboardLayout user={{ name: 'RKT Travels', role: 'owner' }}>
        <div />
      </DashboardLayout>
    );

    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  test('renders notifications badge only when count > 0', () => {
    setPathname('/dashboard');

    const { rerender } = render(
      <DashboardLayout user={{ name: 'RKT Travels', role: 'owner', notificationsCount: 0 }}>
        <div />
      </DashboardLayout>
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();

    rerender(
      <DashboardLayout user={{ name: 'RKT Travels', role: 'owner', notificationsCount: 5 }}>
        <div />
      </DashboardLayout>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('allows custom navItems', () => {
    setPathname('/custom');

    const navItems: DashboardNavItem[] = [{ href: '/custom', label: 'Custom', icon: () => <span /> }];

    render(
      <DashboardLayout user={{ name: 'RKT Travels', role: 'owner' }} navItems={navItems}>
        <div />
      </DashboardLayout>
    );

    expect(screen.getByRole('link', { name: 'Custom' })).toHaveAttribute('aria-current', 'page');
  });
});
