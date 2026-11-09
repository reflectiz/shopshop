import React from 'react';

export interface AppRoute {
  /** Absolute for global routes; flavor-relative inside a flavor route tree ('' = home). */
  path: string;
  element: React.ReactElement;
  protected?: boolean;
  /** Default false; set true to wrap in Layout (Header + Footer). */
  layout?: boolean;
  title?: string;
}
