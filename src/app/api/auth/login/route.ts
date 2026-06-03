import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    
    if (!phone || !code) {
      return NextResponse.json({
        success: false,
        message: '请输入手机号和验证码',
      }, { status: 400 });
    }

    // 验证验证码
    const isValid = serverDb.verifyCode(phone, code);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: '验证码错误或已过期',
      }, { status: 400 });
    }

    // 查找或创建用户
    let user = serverDb.getUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      user = serverDb.createUser(phone);
      isNewUser = true;
    }

    // 获取用户完整数据
    const userData = serverDb.getUserData(user.id);

    return NextResponse.json({
      success: true,
      message: isNewUser ? '注册成功' : '登录成功',
      data: {
        user,
        userData,
        token: `${user.id}_${Date.now()}_${Math.random().toString(36)}`,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请稍后重试',
    }, { status: 500 });
  }
}
