import test from 'node:test';
import assert from 'node:assert/strict';
import {isSupportedImage} from '../src/lib/image-magic.mjs';
const png=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
const jpeg=new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,0]);
const webp=new Uint8Array([82,73,70,70,10,0,0,0,87,69,66,80]);
test('accepts matching image signatures',()=>{assert.ok(isSupportedImage(png,'image/png'));assert.ok(isSupportedImage(jpeg,'image/jpeg'));assert.ok(isSupportedImage(webp,'image/webp'));});
test('rejects spoofed and unknown image types',()=>{assert.equal(isSupportedImage(jpeg,'image/png'),false);assert.equal(isSupportedImage(png,'image/jpeg'),false);assert.equal(isSupportedImage(webp,'image/svg+xml'),false);assert.equal(isSupportedImage(new Uint8Array([60,115,99,114,105,112,116,62,0,0,0,0]),'image/png'),false);});
test('rejects files shorter than the required signature',()=>{assert.equal(isSupportedImage(new Uint8Array([255,216,255]),'image/jpeg'),false);});
