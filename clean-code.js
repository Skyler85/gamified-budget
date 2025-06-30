import fs from 'fs'
import { glob } from 'glob'

const TARGET_DIR = './src'

function getAllTSFiles(dir) {
  return glob.sync(`${dir}/**/*.{ts,tsx}`, {
    ignore: ['**/*.d.ts', '**/node_modules/**'],
  })
}

function removeUnusedImports(code) {
  return code.replace(/import\s+[\s\S]+?;\n/g, match =>
    match.includes('// keep') ? match : ''
  )
}

function flagAnyTypes(code) {
  return code.replace(/\bany\b/g, "unknown /* TODO: replace 'any' */")
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf-8')
  let updated = removeUnusedImports(original)
  updated = flagAnyTypes(updated)
  fs.writeFileSync(filePath, updated, 'utf-8')
  console.log(`✅ Processed: ${filePath}`)
}

function run() {
  const files = getAllTSFiles(TARGET_DIR)
  console.log(`📁 Found ${files.length} files`)
  files.forEach(processFile)
}

run()
