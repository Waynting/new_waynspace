#!/usr/bin/env node
/**
 * 刪除 R2 上包含空格的文件（舊的圖片）
 * 用於清理因為文件名或路徑中包含空格而導致無法正確讀取的圖片
 */

import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const R2_BUCKET = process.env.R2_BUCKET || 'your-bucket-name'
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

// 驗證環境變數
if (!CF_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ 缺少必要的環境變數！')
  console.error('請確保 .env 檔案中包含：')
  console.error('  - CF_ACCOUNT_ID')
  console.error('  - R2_ACCESS_KEY_ID')
  console.error('  - R2_SECRET_ACCESS_KEY')
  process.exit(1)
}

// S3 Client 配置
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

/**
 * 列出所有包含空格的文件
 */
async function listFilesWithSpaces(prefix = '') {
  const filesWithSpaces = []
  let continuationToken = undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.Key.includes(' ')) {
          filesWithSpaces.push(object.Key)
        }
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return filesWithSpaces
}

/**
 * 刪除指定的文件
 */
async function deleteFile(key) {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }))
    return true
  } catch (error) {
    console.error(`  ❌ 刪除失敗: ${error.message}`)
    return false
  }
}

/**
 * 主要處理流程
 */
async function main() {
  console.log('🔍 搜尋包含空格的文件...\n')
  console.log('📋 配置：')
  console.log(`   R2 Bucket: ${R2_BUCKET}`)
  console.log(`   Prefix: 全部\n`)

  // 列出所有包含空格的文件
  const filesWithSpaces = await listFilesWithSpaces()

  if (filesWithSpaces.length === 0) {
    console.log('✅ 沒有找到包含空格的文件')
    return
  }

  console.log(`找到 ${filesWithSpaces.length} 個包含空格的文件：\n`)

  // 顯示文件列表
  for (const file of filesWithSpaces) {
    console.log(`  - ${file}`)
  }

  console.log(`\n🗑️  開始刪除...\n`)

  // 刪除文件
  let deleted = 0
  let failed = 0

  for (const file of filesWithSpaces) {
    console.log(`刪除: ${file}`)
    const success = await deleteFile(file)
    if (success) {
      console.log(`  ✅ 已刪除\n`)
      deleted++
    } else {
      failed++
    }
  }

  // 顯示統計資訊
  console.log('\n' + '='.repeat(60))
  console.log('✨ 處理完成！\n')
  console.log('📊 統計資訊：')
  console.log(`   找到文件: ${filesWithSpaces.length} 個`)
  console.log(`   成功刪除: ${deleted} 個`)
  console.log(`   刪除失敗: ${failed} 個`)
  console.log('\n' + '='.repeat(60))

  if (failed > 0) {
    console.log(`\n⚠️  有 ${failed} 個文件刪除失敗，請檢查上面的錯誤訊息`)
    process.exit(1)
  }
}

// 執行
main().catch(error => {
  console.error('\n❌ 發生嚴重錯誤：', error)
  process.exit(1)
})

