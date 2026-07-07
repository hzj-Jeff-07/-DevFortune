import { getDailyFortune, getHourPillar, DateOutOfRangeError } from '@devfortune/core';
import type { Locale } from '@devfortune/core';

export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

/**
 * GET /api/fortune?date=YYYY-MM-DD&time=HH:mm&locale=zh-CN|en-US
 *
 * - date 缺省为服务器当日（建议调用方显式传日期，避免时区歧义）
 * - time 提供时输出附加时柱
 * - locale 缺省 zh-CN
 */
export function GET(request: Request): Response {
  const params = new URL(request.url).searchParams;

  const localeParam = params.get('locale');
  if (localeParam !== null && localeParam !== 'zh-CN' && localeParam !== 'en-US') {
    return badRequest(`unsupported locale "${localeParam}", expected zh-CN or en-US`);
  }
  const locale: Locale = localeParam === 'en-US' ? 'en-US' : 'zh-CN';

  const dateParam = params.get('date');
  if (dateParam !== null && !DATE_RE.test(dateParam)) {
    return badRequest(`invalid date "${dateParam}", expected YYYY-MM-DD`);
  }
  const date = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();
  if (isNaN(date.getTime())) {
    return badRequest(`invalid date "${dateParam}"`);
  }

  const timeParam = params.get('time');
  if (timeParam !== null) {
    const m = TIME_RE.exec(timeParam);
    if (!m) {
      return badRequest(`invalid time "${timeParam}", expected HH:mm`);
    }
    date.setHours(Number(m[1]), Number(m[2]), 0, 0);
  }

  try {
    const fortune = getDailyFortune(date, { locale });
    if (timeParam) {
      fortune.ganzhi.hour = getHourPillar(date).display;
    }
    return Response.json(fortune, {
      headers: {
        // 指定了日期的结果永不变化，可长缓存；默认"今天"禁止缓存
        'Cache-Control': dateParam ? 'public, max-age=86400, immutable' : 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof DateOutOfRangeError) {
      return badRequest('date out of supported range (1900-01-01 ~ 2100-12-31)');
    }
    throw err;
  }
}
