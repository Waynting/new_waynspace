import { NextResponse } from 'next/server'
import buttondown from 'buttondown'

// 设置 API Key
if (process.env.BUTTONDOWN_API_KEY) {
  buttondown.setApiKey(process.env.BUTTONDOWN_API_KEY)
}

// 使用 Client 直接发送请求，绕过包的字段验证
const client = new buttondown.Client()
if (process.env.BUTTONDOWN_API_KEY) {
  client.setApiKey(process.env.BUTTONDOWN_API_KEY)
}

/**
 * Email 格式驗證
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // 驗證 email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email 是必填欄位' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email 格式不正確' },
        { status: 400 }
      )
    }

    // 檢查是否有設定 API Key
    if (!process.env.BUTTONDOWN_API_KEY) {
      console.error('BUTTONDOWN_API_KEY 未設定')
      return NextResponse.json(
        { error: '服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    // 添加訂閱者到 Buttondown
    try {
      // 直接使用 Client 发送请求，使用 API 要求的 'email_address' 字段
      await client.request('POST', 'subscribers', {
        payload: {
          email_address: email.trim().toLowerCase(),
          tags: ['blog-subscriber'],
        },
      })

      return NextResponse.json(
        { message: '訂閱成功！請檢查你的信箱確認訂閱。' },
        { status: 200 }
      )
    } catch (error: any) {
      // 處理 Buttondown API 錯誤
      const statusCode = error.response?.statusCode || error.response?.status || error.statusCode
      
      if (statusCode === 400 || statusCode === 422) {
        // 400: Bad Request, 422: Unprocessable Entity
        // 可能是 email 已存在、格式錯誤或其他驗證錯誤
        const errorMessage = error.response?.body?.error || 
                            error.response?.data?.error || 
                            error.message || 
                            '訂閱失敗，請稍後再試'
        console.error('Buttondown API 驗證錯誤:', {
          status: statusCode,
          error: errorMessage,
          payload: { email_address: email.trim().toLowerCase(), tags: ['blog-subscriber'] }
        })
        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode || 400 }
        )
      }

      console.error('Buttondown API 錯誤:', {
        status: statusCode,
        error: error.message,
        response: error.response?.body || error.response?.data
      })
      return NextResponse.json(
        { error: '訂閱失敗，請稍後再試' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('訂閱 API 錯誤:', error)
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
