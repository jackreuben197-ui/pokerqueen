#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const COCOS_CREATOR = '/Applications/Cocos/Creator/2.4.15/CocosCreator.app/Contents/MacOS/CocosCreator';
const PROJECT_PATH = path.resolve(__dirname, '..');

const [,, command, params] = process.argv;

if (command === 'detect') {
    console.log('CocosCreator found at:', COCOS_CREATOR);
    process.exit(0);
}

if (command === 'build') {
    const buildOptions = {};
    if (params) {
        params.split(';').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value !== undefined) buildOptions[key.trim()] = value.trim();
        });
    }

    const buildConfig = {
        project: PROJECT_PATH,
        platform: buildOptions.platform || 'web-mobile',
        debug: buildOptions.debug !== 'false',
        md5Cache: buildOptions.md5Cache === 'true',
    };

    console.log('Building with config:', buildConfig);

    try {
        execFileSync(COCOS_CREATOR, [
            '--path', PROJECT_PATH,
            '--build', Object.entries(buildConfig)
                .map(([k, v]) => `${k}=${v}`)
                .join(';'),
        ], { stdio: 'inherit' });
    } catch (e) {
        process.exit(e.status || 1);
    }
} else {
    console.error('Unknown command:', command);
    process.exit(1);
}
