import React from 'react';
import { Link } from 'react-router-dom';
import { CLEAN_FLAVOR_LIST, FLAVOR_LIST } from '../flavors/flavors';
import { FlavorConfig } from '../flavors/types';
import { CLEAN_PREFIX, DEFAULT_FLAVOR } from '../flavors/resolve';

/**
 * Launcher for the four industry sites. Retail keeps the site root, so this lives at
 * /flavors rather than /.
 */
const cardClass =
  'group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col';

const cardBody = (flavor: FlavorConfig) => (
  <>
    <div
      className="h-24 flex items-center justify-center text-4xl"
      style={{
        background: `linear-gradient(135deg, rgb(${flavor.theme.heroFrom}), rgb(${flavor.theme.heroTo}))`,
      }}
    >
      <span aria-hidden="true">{flavor.widget.glyph}</span>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h2 className="text-lg font-bold text-gray-900 mb-1">{flavor.brandName}</h2>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{flavor.tagline}</p>
      <dl className="text-xs text-gray-500 space-y-0.5 border-t border-gray-100 pt-3">
        <div className="flex justify-between gap-2">
          <dt>Email</dt>
          <dd className="font-mono text-gray-700 truncate">{flavor.demoCredentials.email}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Password</dt>
          <dd className="font-mono text-gray-700">{flavor.demoCredentials.password}</dd>
        </div>
      </dl>
    </div>
  </>
);

const FlavorPickerPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Choose a site</h1>
        <p className="text-lg text-gray-600">
          The same demo, in four industries. Each site has its own branding, catalog and flow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FLAVOR_LIST.map((flavor) => (
          <Link
            key={flavor.id}
            id={`flavor-picker-link-${flavor.id}`}
            to={flavor.id === DEFAULT_FLAVOR ? '/' : `/${flavor.id}`}
            className={cardClass}
          >
            {cardBody(flavor)}
          </Link>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-6 text-center">Clean</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CLEAN_FLAVOR_LIST.map((flavor) => (
          <a
            key={`clean-${flavor.id}`}
            id={`flavor-picker-link-clean-${flavor.id}`}
            href={`/${CLEAN_PREFIX}/${flavor.id}`}
            className={cardClass}
          >
            {cardBody(flavor)}
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default FlavorPickerPage;
