import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// https://stenciljs.com/docs/config

export const config: Config = {
  // globalStyle: 'src/app.css',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      baseUrl: '/',
    },
  ],
  devServer: {
    // reloadStrategy: 'pageReload'
  },
  plugins: [
    sass()
  ]
};
