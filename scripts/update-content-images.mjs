#!/usr/bin/env node
/**
 * 更新 content/ 目录下文章的图片路径
 * 将相对路径 images/xxx-1024x768.jpg 改为 R2 的绝对路径
 * 并使用原图名 + .webp 格式
 */

import { globby } from 'globby'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取配置
const BASEURL = process.env.R2_BASE_URL || 'https://your-cdn-domain.com'
const PREFIX = process.env.R2_PREFIX || 'blog'
const CONTENT_DIR = path.resolve(__dirname, '../content')

console.log('🖼️  开始更新 content/ 目录下的图片路径...\n')
console.log('📋 配置：')
console.log(`   Base URL: ${BASEURL}`)
console.log(`   Prefix: ${PREFIX}`)
console.log(`   Content 目录: ${CONTENT_DIR}\n`)

// 查找所有 .md 和 .mdx 文件
const files = await globby(['**/*.{md,mdx}'], { cwd: CONTENT_DIR })

console.log(`📝 找到 ${files.length} 篇文章，开始处理...\n`)

let updated = 0
let totalReplaced = 0

for (const file of files) {
  const filePath = path.join(CONTENT_DIR, file)
  let content = await fs.readFile(filePath, 'utf8')
  let replaced = 0
  let hasChanges = false
  
  // 从文件路径提取年份和月份
  // 例如: 2025/05/2025-im-week.md -> 2025, 05, 2025-im-week
  const pathParts = file.replace(/\.(md|mdx)$/, '').split(path.sep)
  const year = pathParts[0]
  const month = pathParts[1]
  const articleSlug = path.basename(file, path.extname(file))
  
  if (!year || !month) {
    console.log(`⚠️  跳过无效路径: ${file}`)
    continue
  }
  
  // 匹配图片路径的模式：
  // ![](images/xxx-1024x768.jpg) 或 ![alt](images/xxx-1024x768.jpg)
  // ![](images/xxx-768x1024.jpg)
  // ![](images/xxx.jpg) (没有尺寸的也要处理)
  const imagePatterns = [
    // 带尺寸后缀的图片: IMG_2133-1024x768.jpg -> IMG_2133.webp
    /!\[([^\]]*)\]\(images\/([^-\s]+)-(\d+)x(\d+)\.(jpg|jpeg|png)\)/gi,
    // 没有尺寸后缀的图片: 1745998468705.jpg -> 1745998468705.webp
    /!\[([^\]]*)\]\(images\/([^\s]+)\.(jpg|jpeg|png)\)/gi,
    // 已经部分处理过的路径（如果已经是绝对路径但格式不对）
    // 暂时不考虑这种情况，专注于处理 images/ 开头的相对路径
  ]
  
  // 处理已经是绝对路径但扩展名不是 .webp 的图片
  // 匹配格式 1: ![](https://your-cdn-domain.com/blog/2024/02/文章标题/xxx.jpg)
  // 匹配格式 2: ![](https://your-cdn-domain.com/文章标题/xxx.jpg) - 缺少年月和前缀
  content = content.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+\/)([^/]+)\/(\d{4})\/(\d{2})\/([^/)]+)\/([^/)]+)\.(jpg|jpeg|png)\)/gi, (match, alt, baseUrl, prefix, fileYear, fileMonth, articleTitle, fileName, ext) => {
    // 只处理配置的 CDN 域名
    if (!baseUrl.includes(BASEURL.replace('https://', '').replace('http://', ''))) {
      return match
    }
    
    // URL 解码文件名（处理 %E5%87%BA 这样的编码）
    try {
      fileName = decodeURIComponent(fileName)
      articleTitle = decodeURIComponent(articleTitle)
    } catch (e) {
      // 如果解码失败，使用原文件名
    }
    
    // 去掉尺寸后缀（例如：-1024x768, -768x1024, -240203_3）
    fileName = fileName.replace(/-\d+x\d+$/, '').replace(/-\d+$/, '')
    
    // 构建 R2 URL（使用文件中的年月，如果与当前文章不匹配，使用当前文章的年月）
    const finalYear = fileYear || year
    const finalMonth = fileMonth || month
    const finalArticle = articleTitle || articleSlug
    const r2Url = `${BASEURL}/${PREFIX}/${finalYear}/${finalMonth}/${finalArticle}/${fileName}.webp`
    hasChanges = true
    replaced++
    return `![${alt}](${r2Url})`
  })
  
  // 处理缺少年月和前缀的绝对路径: ![](https://your-cdn-domain.com/文章标题/xxx.webp) - 已经是.webp但路径不对
  const cdnDomain = BASEURL.replace('https://', '').replace('http://', '')
  content = content.replace(new RegExp(`!\\[([^\\]]*)\\]\\((https?:\\/\\/${cdnDomain.replace(/\./g, '\\.')}\\/)([^/)]+)\\/([^/)]+)\\.webp\\)`, 'gi'), (match, alt, baseUrl, articleTitle, fileName) => {
    // URL 解码文件名
    try {
      fileName = decodeURIComponent(fileName)
      articleTitle = decodeURIComponent(articleTitle)
    } catch (e) {
      // 如果解码失败，使用原文件名
    }
    
    // 去掉尺寸后缀
    fileName = fileName.replace(/-\d+x\d+$/, '').replace(/-\d+$/, '')
    
    // 使用当前文章的年月和slug构建 R2 URL
    const r2Url = `${BASEURL}/${PREFIX}/${year}/${month}/${articleSlug}/${fileName}.webp`
    hasChanges = true
    replaced++
    return `![${alt}](${r2Url})`
  })
  
  // 处理缺少年月和前缀的绝对路径: ![](https://your-cdn-domain.com/文章标题/xxx.jpg)
  content = content.replace(new RegExp(`!\\[([^\\]]*)\\]\\((https?:\\/\\/${cdnDomain.replace(/\./g, '\\.')}\\/)([^/)]+)\\/([^/)]+)\\.(jpg|jpeg|png)\\)`, 'gi'), (match, alt, baseUrl, articleTitle, fileName, ext) => {
    // URL 解码文件名
    try {
      fileName = decodeURIComponent(fileName)
      articleTitle = decodeURIComponent(articleTitle)
    } catch (e) {
      // 如果解码失败，使用原文件名
    }
    
    // 去掉尺寸后缀
    fileName = fileName.replace(/-\d+x\d+$/, '').replace(/-\d+$/, '')
    
    // 使用当前文章的年月和slug构建 R2 URL
    const r2Url = `${BASEURL}/${PREFIX}/${year}/${month}/${articleSlug}/${fileName}.webp`
    hasChanges = true
    replaced++
    return `![${alt}](${r2Url})`
  })
  
  // 处理所有 images/ 开头的相对路径图片
  // 匹配格式: ![](images/xxx-1024x768.jpg) 或 ![](images/xxx.jpg)
  // 更宽泛的正则，匹配任何 images/ 后面的路径
  content = content.replace(/!\[([^\]]*)\]\(images\/([^)]+)\)/gi, (match, alt, imagePath) => {
    // 如果已经是绝对路径（包含 http），跳过
    if (imagePath.includes('http://') || imagePath.includes('https://')) {
      return match
    }
    
    // 提取文件名（去掉路径和扩展名）
    let fileName = path.basename(imagePath, path.extname(imagePath))
    
    // 去掉尺寸后缀（例如：-1024x768, -768x1024）
    fileName = fileName.replace(/-\d+x\d+$/, '')
    
    // 构建 R2 URL
    const r2Url = `${BASEURL}/${PREFIX}/${year}/${month}/${articleSlug}/${fileName}.webp`
    hasChanges = true
    replaced++
    return `![${alt}](${r2Url})`
  })
  
  // 处理带链接的图片格式: [![](images/xxx.jpg)](url) 或 [![](url/images/xxx.jpg)](url)
  content = content.replace(/\[!\[([^\]]*)\]\((https?:\/\/[^)]+)\/([^/)]+\/)images\/([^)]+)\)\]\([^)]+\)/gi, (match, alt, baseUrl, pathPart, imagePath) => {
    // 提取文件名（去掉路径和扩展名）
    let fileName = path.basename(imagePath, path.extname(imagePath))
    
    // URL 解码文件名（处理 %E5%87%BA 这样的编码）
    try {
      fileName = decodeURIComponent(fileName)
    } catch (e) {
      // 如果解码失败，使用原文件名
    }
    
    // 去掉尺寸后缀（例如：-1024x768, -768x1024）
    fileName = fileName.replace(/-\d+x\d+$/, '').replace(/-\d+$/, '')
    
    // 构建 R2 URL
    const r2Url = `${BASEURL}/${PREFIX}/${year}/${month}/${articleSlug}/${fileName}.webp`
    hasChanges = true
    replaced++
    return `![${alt}](${r2Url})`
  })
  
  // 处理带链接的图片格式: [![](images/xxx.jpg)](url) - 不带完整 URL
  content = content.replace(/\[!\[([^\]]*)\]\(images\/([^)]+)\)\]\([^)]+\)/gi, (match, alt, imagePath) => {
    // 如果已经是绝对路径（包含 http），跳过
    if (imagePath.includes('http://') || imagePath.includes('https://')) {
      return match
    }
    
    // 提取文件名（去掉路径和扩展名）
    let fileName = path.basename(imagePath, path.extname(imagePath))
    
    // 去掉尺寸后缀（例如：-1024x768, -768x1024）
    fileName = fileName.replace(/-\d+x\d+$/, '').replace(/-\d+$/, '')
    
    // 构建 R2 URL
    const r2Url = `${BASEURL}/${PREFIX}/${year}/${month}/${articleSlug}/${fileName}.webp`
    hasChanges = true
    replaced++
    return `![${alt}](${r2Url})`
  })
  
  // 处理 front matter 中的 coverImage
  content = content.replace(/^(coverImage:\s*["']?)(images\/)?([^"')\s]+\.(jpg|jpeg|png))(["']?)/gim, (match, prefix, imagesPrefix, fileName, ext, suffix) => {
    // 提取文件名（去掉路径和扩展名）
    let name = path.basename(fileName, path.extname(fileName))
    
    // 去掉尺寸后缀（例如：-1024x768, -768x1024, -scaled）
    name = name.replace(/-\d+x\d+$/, '').replace(/-scaled$/, '')
    
    // 构建 R2 URL（coverImage 使用 .webp）
    const r2Url = `${BASEURL}/${PREFIX}/${year}/${month}/${articleSlug}/${name}.webp`
    hasChanges = true
    replaced++
    return `${prefix}${r2Url}${suffix}`
  })
  
  if (hasChanges) {
    await fs.writeFile(filePath, content, 'utf8')
    console.log(`✅ ${file}`)
    console.log(`   替换了 ${replaced} 个图片路径`)
    updated++
    totalReplaced += replaced
  }
}

console.log(`\n✨ 处理完成！`)
console.log(`   - 更新了 ${updated} 篇文章`)
console.log(`   - 总共替换了 ${totalReplaced} 个图片路径`)
console.log(`\n💡 提示：`)
console.log(`   图片路径已更新为: ${BASEURL}/${PREFIX}/YYYY/MM/文章标题/原图名.webp`)
console.log(`   例如: ${BASEURL}/${PREFIX}/2025/05/2025-im-week/IMG_2133.webp`)

