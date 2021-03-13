import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'zt-bottom-drawer',
  devServer: {
    /*https: {
      cert: readFileSync('C:\\dev\\bondit\\apps\\bondit-apps\\cert.pem', 'utf8'),
      key: readFileSync('C:\\dev\\bondit\\apps\\bondit-apps\\key.key', 'utf8')
    },*/
    reloadStrategy: "pageReload",
    openBrowser: true,
    //  root:"~/www-rider/index-rider.html"
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
};
