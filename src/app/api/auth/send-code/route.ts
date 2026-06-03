import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        message: '请输入正确的手机号码',
      }, { status: 400 });
    }

    // 生成 6 位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 保存验证码
    serverDb.saveVerificationCode(phone, code);

    console.log(`[验证码] 手机号: ${phone}, 验证码: ${code}`);

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      data: { code }, // 生产环境不要返回验证码！
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json({
      success: false,
      message: '发送失败，请稍后重试',
    }, { status: 500 });
  }
}
