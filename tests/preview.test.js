import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const previewPackageUrl = new URL('../preview/package.json', import.meta.url)

test('normal website preview has a separate non-scene launcher', () => {
  assert.ok(existsSync(previewPackageUrl), 'normal website preview package is missing')
  const previewPackage = JSON.parse(readFileSync(previewPackageUrl, 'utf8'))
  assert.equal(previewPackage.edit3d, undefined, 'website preview must not use the embedded scene protocol')
  assert.equal(previewPackage.scripts.dev, 'npm --prefix .. run dev --')
})
