import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.js',workers:1,use:{baseURL:process.env.TEST_URL||'http://127.0.0.1:49387',browserName:'chromium'},webServer:process.env.TEST_URL?undefined:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:49387',reuseExistingServer:false}});

