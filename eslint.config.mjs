import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [...coreWebVitals, ...nextTypescript];
export default config;
