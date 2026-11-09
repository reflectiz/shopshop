import React from 'react';
import { Outlet } from 'react-router-dom';
import { FlavorProvider } from './FlavorContext';
import ScriptsLoader from '../components/ScriptsLoader/ScriptsLoader';
import { FlavorConfig, FlavorTheme } from './types';

type ThemeVars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Maps the industry's theme onto the CSS custom properties that tailwind.config.js reads.
 * Values must stay space-separated RGB triplets — see FlavorTheme's doc comment.
 */
const themeVars = (theme: FlavorTheme): ThemeVars => ({
  '--brand': theme.brand,
  '--brand-hover': theme.brandHover,
  '--brand-subtle': theme.brandSubtle,
  '--action': theme.action,
  '--action-hover': theme.actionHover,
  '--hero-from': theme.heroFrom,
  '--hero-via': theme.heroVia,
  '--hero-to': theme.heroTo,
});

/**
 * Layout route element for one industry site: provides the config and scopes the theme.
 *
 * Deliberately does NOT render <Layout>. Layout stays per-route via RouteWrapper, because
 * the login route has layout: false. The theme wrapper must sit outside Layout so Header
 * and Footer inherit the variables.
 */
const FlavorShell: React.FC<{ flavor: FlavorConfig }> = ({ flavor }) => (
  <FlavorProvider flavor={flavor}>
    <div
      id={`flavor-root-${flavor.id}`}
      data-flavor={flavor.id}
      style={themeVars(flavor.theme)}
      className="min-h-screen"
    >
      {/* Injects the vendor scripts on every page of this site, login included. */}
      {!flavor.clean && <ScriptsLoader />}
      <Outlet />
    </div>
  </FlavorProvider>
);

export default FlavorShell;
