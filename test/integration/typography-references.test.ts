import { expect } from '@esm-bundle/chai';
import StyleDictionary from 'style-dictionary';
import { promises } from 'fs';
import path from 'path';
import { registerTransforms } from '../../src/registerTransforms.js';

const outputDir = 'test/integration/tokens/';
const outputFileName = 'vars.css';
const outputFilePath = path.resolve(outputDir, outputFileName);

const cfg = {
  source: ['test/integration/tokens/typography.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      prefix: 'sd',
      buildPath: outputDir,
      files: [
        {
          destination: outputFileName,
          format: 'css/variables',
        },
      ],
    },
  },
};

let dict: StyleDictionary.Core | undefined;

describe('typography references', () => {
  function cleanup() {
    if (dict) {
      dict.cleanAllPlatforms();
    }
    delete StyleDictionary.transformGroup['tokens-studio'];
    Object.keys(StyleDictionary.transform).forEach(transform => {
      if (transform.startsWith('ts/')) {
        delete StyleDictionary.transform[transform];
      }
    });
  }

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('supports typography objects when referenced by another token', async () => {
    registerTransforms(StyleDictionary);
    dict = StyleDictionary.extend(cfg);
    dict.buildAllPlatforms();
    const file = await promises.readFile(outputFilePath, 'utf-8');
    expect(file).to.include(
      `:root {
  --sdBefore: 700 36/1 Aria Sans;
  --sdFontHeadingXxl: 700 36px/1 Aria Sans;
  --sdAfter: 700 36/1 Aria Sans;
}`,
    );
  });
});
