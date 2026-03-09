const fs = require('fs')
const path = require('path')

const textExtensions = ['.ts', '.js', '.vue', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.jsx', '.tsx', '.html', '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.txt']

function isTextFile(filename){
  return textExtensions.some(ext => filename.endsWith(ext))
}

const todoPatterns = [
  /\/\/\s*TODO/i,
  /\/\*\s*TODO/i,
  /#\s*TODO/i,
  /<!--\s*TODO/i,
  /\/\/\s*FIXME/i,
  /\/\*\s*FIXME/i,
  /#\s*FIXME/i,
  /<!--\s*FIXME/i,
  /\/\/\s*BUG/i,
  /\/\*\s*BUG/i,
  /#\s*BUG/i,
  /<!--\s*BUG/i,
  /^\s*\*\s*(?:TODO|FIXME|BUG)/i
]

function extractType(line){
  if(/FIXME/i.test(line)) return 'FIXME'
  if(/BUG/i.test(line)) return 'BUG'
  return 'TODO'
}

function extractContent(line){
  const m = line.match(/(?:TODO|FIXME|BUG)[:\s]*(.*)$/i)
  return (m && m[1]) ? m[1].trim() : line.trim()
}

function scanFile(filePath){
  try{
    const content = fs.readFileSync(filePath,'utf8')
    const lines = content.split(/\r?\n/)
    const found = []
    lines.forEach((l, idx)=>{
      const trimmed = (l||'').trim()
      if(todoPatterns.some(p=>p.test(trimmed))){
        found.push({file: filePath, line: idx+1, type: extractType(trimmed), content: extractContent(trimmed)})
      }
    })
    return found
  }catch(e){
    return []
  }
}

function scanFolder(folder){
  const results = []
  const items = fs.readdirSync(folder, { withFileTypes: true })
  for(const item of items){
    const full = path.join(folder, item.name)
    if(item.isDirectory()){
      if(['node_modules','.git','dist','out','.vscode'].includes(item.name)) continue
      results.push(...scanFolder(full))
    }else if(item.isFile()){
      if(isTextFile(item.name)){
        results.push(...scanFile(full))
      }
    }
  }
  return results
}

const root = path.resolve(__dirname, '..')
const todos = scanFolder(root)
console.log('Found', todos.length, 'items')
const grouped = todos.reduce((acc,t)=>{ acc[t.type]=(acc[t.type]||[]); acc[t.type].push(t); return acc }, {})
Object.keys(grouped).forEach(k=>{
  console.log(`\n=== ${k} (${grouped[k].length}) ===`)
  grouped[k].slice(0,20).forEach(t=>{
    console.log(`${t.file}:${t.line} -> ${t.content}`)
  })
})
