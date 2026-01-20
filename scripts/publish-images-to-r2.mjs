import { globby } from 'globby'
import { execa } from 'execa'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// 加载 .env 文件（如果存在）
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// R2 配置：优先使用环境变量，如果没有则使用默认值
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const ENDPOINT = ACCOUNT_ID ? `https://${ACCOUNT_ID}.r2.cloudflarestorage.com` : ''
const BUCKET = process.env.R2_BUCKET || 'your-bucket-name'
// R2_BASE_URL 是图片的公开访问 URL（可以是自定义域名或 R2 的公共访问端点）
// 不是 S3 API endpoint，而是用来替换 Markdown 中相对路径的完整 URL
const BASEURL = process.env.R2_BASE_URL || 'https://your-cdn-domain.com'
const PREFIX = process.env.R2_PREFIX || 'blog'
// rclone 远程名称（需要在 rclone 中配置，或使用环境变量指定）
const RCLONE_REMOTE = process.env.RCLONE_REMOTE || 'r2'

const POSTS_DIR = path.resolve(__dirname, '../source/_posts')

console.log('📋 R2 配置：')
console.log(`   Account ID: ${ACCOUNT_ID || '未设置（将跳过上传）'}`)
console.log(`   S3 API Endpoint: ${ENDPOINT || '未设置（使用 rclone 配置）'}`)
console.log(`   Bucket: ${BUCKET}`)
console.log(`   Base URL (图片访问地址): ${BASEURL}`)
console.log(`   Prefix: ${PREFIX}`)
console.log(`   Rclone Remote: ${RCLONE_REMOTE}`)
console.log('')

const posts = await globby(['**/*.md'], { cwd: POSTS_DIR, dot: true })

console.log(`📝 找到 ${posts.length} 篇文章，开始处理图片上传...`)

// 检查 rclone 是否已安装（只在开始时检查一次）
try {
  await execa('rclone', ['version'], { stdio: 'pipe' })
} catch (error) {
  console.error(`❌ rclone 未安装或不在 PATH 中`)
  console.error(`   请先安装 rclone: https://rclone.org/install/`)
  console.error(`   然后运行 'rclone config' 配置 R2 远程存储`)
  process.exit(1)
}

/**
 * 检查 R2 上是否已存在文件
 */
async function checkR2FileExists(rcloneRemote, bucket, r2Path) {
  try {
    await execa('rclone', [
      'lsf',
      `${rcloneRemote}:${bucket}/${r2Path}`,
    ], { stdio: 'pipe', timeout: 5000 })
    return true
  } catch (error) {
    // 文件不存在或路径不存在
    return false
  }
}

/**
 * 检查目录中的所有文件是否都已存在于 R2
 */
async function checkAllFilesExist(localDir, rcloneRemote, bucket, r2Prefix) {
  try {
    // 获取本地目录中的所有文件
    const files = await fs.readdir(localDir, { withFileTypes: true })
    const imageFiles = files
      .filter(file => file.isFile() && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name))
      .map(file => file.name)

    if (imageFiles.length === 0) {
      return { allExist: false, existingFiles: 0, totalFiles: 0 }
    }

    // 检查每个文件是否已存在
    let existingCount = 0
    for (const fileName of imageFiles) {
      const r2Path = `${r2Prefix}/${fileName}`
      if (await checkR2FileExists(rcloneRemote, bucket, r2Path)) {
        existingCount++
      }
    }

    return {
      allExist: existingCount === imageFiles.length,
      existingFiles: existingCount,
      totalFiles: imageFiles.length,
    }
  } catch (error) {
    // 如果检查失败，返回 false 继续上传
    return { allExist: false, existingFiles: 0, totalFiles: 0 }
  }
}

let uploaded = 0
let skipped = 0
let skippedDuplicates = 0

for (const md of posts) {
  const mdPath = path.join(POSTS_DIR, md)
  const dir = mdPath.replace(/\.mdx?$/, '')
  
  try {
    await fs.access(dir) // 检查是否有同名资产文件夹
    
    // 从路径提取年份月份和文章标题
    // 例如: 2025/06/文章标题.md -> 2025/06/文章标题
    const pathParts = md.split(path.sep)
    const year = pathParts[0]
    const month = pathParts[1]
    const articleSlug = path.basename(dir) // 文章标题
    
    const r2Prefix = `${PREFIX}/${year}/${month}/${articleSlug}` // blog/2025/06/文章标题

    console.log(`📤 检查 ${articleSlug}...`)

    // 检查是否所有文件都已存在
    const checkResult = await checkAllFilesExist(dir, RCLONE_REMOTE, BUCKET, r2Prefix)
    
    if (checkResult.allExist && checkResult.totalFiles > 0) {
      console.log(`  ⚡ 所有文件已存在，跳过上传 (${checkResult.existingFiles}/${checkResult.totalFiles})`)
      skippedDuplicates++
      skipped++
      continue
    } else if (checkResult.existingFiles > 0) {
      console.log(`  ℹ️  部分文件已存在 (${checkResult.existingFiles}/${checkResult.totalFiles})，只上传新文件`)
    }
    
    // 使用 rclone copy 上传文件（保持目录结构）
    // rclone copy 会将本地目录内容复制到远程，保持相对路径结构
    // 使用 --ignore-existing 参数跳过已存在的文件（但 rclone copy 默认会检查，所以这里用 sync 或 copy 都可以）
    await execa('rclone', [
      'copy',
      dir,
      `${RCLONE_REMOTE}:${BUCKET}/${r2Prefix}`,
      '--progress',
      '--transfers', '10',
      '--checkers', '20',
      '--ignore-existing', // 跳过已存在的文件
    ], { stdio: 'inherit' })

    // 读取 markdown 文件并替换图片链接
    let txt = await fs.readFile(mdPath, 'utf8')
    
    // 将文内相对路径 "images/" 改为图床绝对路径
    txt = txt.replaceAll(`images/`, `${BASEURL}/${r2Prefix}/`)
    // 处理同名文件夹路径（如果有）
    txt = txt.replaceAll(`${articleSlug}/images/`, `${BASEURL}/${r2Prefix}/`)
    
    await fs.writeFile(mdPath, txt, 'utf8')
    
    console.log(`✅ ${articleSlug} → ${BASEURL}/${r2Prefix}/`)
    uploaded++
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 无资产文件夹，跳过
      skipped++
    } else {
      console.error(`❌ 处理 ${md} 时出错:`, error.message)
      skipped++
    }
  }
}

console.log(`\n✨ 处理完成！`)
console.log(`   - 已上传: ${uploaded} 个文件夹`)
console.log(`   - 已跳过（重复）: ${skippedDuplicates} 个文件夹`)
console.log(`   - 已跳过（无图片）: ${skipped} 篇文章`)
