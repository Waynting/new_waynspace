#!/usr/bin/env node
/**
 * 测试 R2 配置脚本
 * 用于验证 rclone 和 R2 配置是否正确
 */

import { execa } from 'execa'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ quiet: true })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取配置
const BUCKET = process.env.R2_BUCKET || 'your-bucket-name'
const BASEURL = process.env.R2_BASE_URL || 'https://your-cdn-domain.com'
const PREFIX = process.env.R2_PREFIX || 'blog'
const RCLONE_REMOTE = process.env.RCLONE_REMOTE || 'r2'

console.log('🧪 开始测试 R2 配置...\n')

// 测试 1: 检查 rclone 是否安装
console.log('📋 测试 1: 检查 rclone 是否安装')
try {
  const { stdout } = await execa('rclone', ['version'], { stdio: 'pipe' })
  const version = stdout.split('\n')[0]
  console.log(`✅ rclone 已安装: ${version}\n`)
} catch (error) {
  console.error('❌ rclone 未安装或不在 PATH 中')
  console.error('   请先安装: brew install rclone\n')
  process.exit(1)
}

// 测试 2: 检查 rclone 远程配置
console.log('📋 测试 2: 检查 rclone 远程配置')
try {
  const { stdout } = await execa('rclone', ['listremotes'], { stdio: 'pipe' })
  if (stdout.includes(RCLONE_REMOTE)) {
    console.log(`✅ 找到远程存储: ${RCLONE_REMOTE}\n`)
  } else {
    console.error(`❌ 未找到远程存储: ${RCLONE_REMOTE}`)
    console.error('   请运行: rclone config\n')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ 无法列出远程存储')
  process.exit(1)
}

// 测试 3: 检查能否访问 R2 bucket
console.log('📋 测试 3: 检查能否访问 R2 bucket')
try {
  const { stdout } = await execa('rclone', ['lsd', `${RCLONE_REMOTE}:${BUCKET}`], { 
    stdio: 'pipe',
    timeout: 10000 
  })
  console.log(`✅ 成功访问 bucket: ${BUCKET}`)
  if (stdout.trim()) {
    console.log('   现有目录:')
    console.log(stdout.split('\n').map(line => `   ${line}`).join('\n'))
  } else {
    console.log('   (bucket 为空)')
  }
  console.log('')
} catch (error) {
  console.error(`❌ 无法访问 bucket: ${BUCKET}`)
  console.error('   错误信息:', error.message)
  console.error('\n   可能的原因:')
  console.error('   1. bucket 名称不正确')
  console.error('   2. rclone 配置的凭据不正确')
  console.error('   3. R2 API Token 权限不足')
  console.error('\n   请检查:')
  console.error('   - .env 文件中的 R2_BUCKET 是否正确')
  console.error('   - rclone config 中的 access_key_id 和 secret_access_key')
  console.error('   - R2 API Token 是否有 S3:Edit 权限\n')
  process.exit(1)
}

// 测试 4: 检查环境变量配置
console.log('📋 测试 4: 检查环境变量配置')
const requiredVars = {
  'R2_BUCKET': BUCKET,
  'R2_BASE_URL': BASEURL,
  'R2_PREFIX': PREFIX,
  'RCLONE_REMOTE': RCLONE_REMOTE
}

let allConfigured = true
for (const [key, value] of Object.entries(requiredVars)) {
  const envValue = process.env[key]
  if (!envValue || envValue.includes('your-') || envValue.includes('example')) {
    console.log(`⚠️  ${key}: 未设置或使用默认值 (当前值: ${value})`)
    allConfigured = false
  } else {
    console.log(`✅ ${key}: ${value}`)
  }
}
console.log('')

// 测试 5: 检查 source/_posts 目录
console.log('📋 测试 5: 检查文章目录')
const POSTS_DIR = path.resolve(__dirname, '../source/_posts')
try {
  await fs.access(POSTS_DIR)
  const stats = await fs.stat(POSTS_DIR)
  if (stats.isDirectory()) {
    console.log(`✅ 文章目录存在: ${POSTS_DIR}\n`)
  }
} catch (error) {
  console.error(`❌ 文章目录不存在: ${POSTS_DIR}`)
  console.error('   请创建目录或检查路径配置\n')
}

// 测试 6: 测试上传功能（创建一个测试文件）
console.log('📋 测试 6: 测试上传功能')
const testPrefix = `${PREFIX}/test/$(date +%Y%m%d)`
const testFile = path.join(__dirname, '../test-upload.txt')
try {
  // 创建临时测试文件
  await fs.writeFile(testFile, `测试上传 - ${new Date().toISOString()}`, 'utf8')
  
  console.log(`   上传测试文件到: ${RCLONE_REMOTE}:${BUCKET}/${testPrefix}/`)
  
  await execa('rclone', [
    'copy',
    testFile,
    `${RCLONE_REMOTE}:${BUCKET}/${testPrefix}/`,
    '--progress'
  ], { stdio: 'inherit', timeout: 30000 })
  
  console.log('✅ 上传测试成功！')
  
  // 清理测试文件
  await fs.unlink(testFile)
  console.log('✅ 已清理本地测试文件\n')
  
  console.log('💡 提示: 上传的测试文件在 R2 中的路径:')
  console.log(`   ${RCLONE_REMOTE}:${BUCKET}/${testPrefix}/test-upload.txt\n`)
  
} catch (error) {
  console.error('❌ 上传测试失败:', error.message)
  // 清理测试文件（如果存在）
  try {
    await fs.unlink(testFile)
  } catch {}
  console.error('\n   可能的原因:')
  console.error('   1. R2 API Token 权限不足（需要 S3:Edit）')
  console.error('   2. rclone 配置不正确')
  console.error('   3. 网络连接问题\n')
}

// 总结
console.log('📊 测试总结:')
console.log('─'.repeat(50))
console.log(`✅ R2 Bucket: ${BUCKET}`)
console.log(`✅ 图片访问 URL: ${BASEURL}`)
console.log(`✅ 路径前缀: ${PREFIX}`)
console.log(`✅ Rclone 远程: ${RCLONE_REMOTE}`)
console.log('─'.repeat(50))
console.log('\n🎉 配置测试完成！')
console.log('   现在可以运行: npm run publish:images\n')

