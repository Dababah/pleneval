import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { test, message, token: bodyToken, chatId: bodyChatId } = await req.json();

    let token = bodyToken;
    let chatId = bodyChatId;

    // If not provided in body, get from DB
    if (!token || !chatId) {
      const settings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
      });

      if (!settings || (!settings.telegramBotTokenEncrypted && !token) || (!settings.telegramChatId && !chatId)) {
        return NextResponse.json({ success: false, error: 'Telegram belum di-setup di Settings' }, { status: 400 });
      }

      if (!token && settings.telegramBotTokenEncrypted) {
        token = decrypt(settings.telegramBotTokenEncrypted);
      }
      if (!chatId && settings.telegramChatId) {
        chatId = settings.telegramChatId;
      }
    }

    if (!token || !chatId) {
      return NextResponse.json({ success: false, error: 'Bot Token atau Chat ID tidak valid' }, { status: 400 });
    }

    let text = message || "Halo! Bot Anda sudah terhubung dengan PLEN.";
    if (test) {
       text = "🚀 *Test Berhasil!*\n\nBot Telegram Anda sekarang terhubung dengan PLEN Personal Assistant.\n\nAnda akan menerima notifikasi otomatis sesuai pengaturan Anda.";
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      }),
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'Telegram API Error');

    return NextResponse.json({ success: true, data: data.result });
  } catch (error: any) {
    console.error('Telegram Send Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
