import { getDailyFortune } from '@devfortune/core';
import { parseArgs } from './commands/parser.js';
import { formatText } from './output/text.js';
import { formatMarkdown } from './output/markdown.js';
import type { Fortune } from '@devfortune/core';

const VERSION = '0.1.0';

const HELP = `devfortune - 程序员每日运势

用法：devfortune [选项]

选项：
  -d, --date <date>       指定日期 (YYYY-MM-DD)，默认今天
  -D, --detail            显示详细五行分析
  -b, --brief             简洁模式（单行输出）
  -f, --format <format>   输出格式: text (默认) | json | markdown
  -c, --no-color          禁用彩色输出
  -r, --raw               纯文本输出（无边框装饰）
  -v, --version           显示版本号
  -h, --help              显示帮助信息
`;

export function run(argv: string[]): void {
  const args = parseArgs(argv);

  if (args.help) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  if (args.version) {
    process.stdout.write(VERSION + '\n');
    process.exit(0);
  }

  let date: Date;
  if (args.date) {
    const parsed = new Date(args.date + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      process.stderr.write(`错误：无效的日期格式 "${args.date}"，请使用 YYYY-MM-DD\n`);
      process.exit(2);
    }
    date = parsed;
  } else {
    date = new Date();
  }

  // Validate date range
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    process.stderr.write(`错误：日期超出支持范围 (1900-01-01 ~ 2100-12-31)\n`);
    process.exit(3);
  }

  try {
    const fortune = getDailyFortune(date);
    const output = render(fortune, args);
    process.stdout.write(output + '\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`错误：${message}\n`);
    process.exit(1);
  }
}

function render(
  fortune: Fortune,
  args: ReturnType<typeof parseArgs>
): string {
  const format = args.format ?? 'text';

  if (format === 'json') {
    return JSON.stringify(fortune, null, 2);
  }

  if (format === 'markdown') {
    return formatMarkdown(fortune);
  }

  // text
  if (args.brief) {
    return formatBrief(fortune);
  }

  return formatText(fortune, {
    detail: args.detail,
    noColor: args.noColor,
    raw: args.raw,
  });
}

function formatBrief(fortune: Fortune): string {
  const score = fortune.fortune.score;
  const stars = score >= 85 ? '★★★★★' :
    score >= 70 ? '★★★★☆' :
    score >= 45 ? '★★★☆☆' :
    score >= 25 ? '★★☆☆☆' : '★☆☆☆☆';
  const yi = fortune.fortune.yi.slice(0, 2).join(',');
  const ji = fortune.fortune.ji.slice(0, 1).join(',');
  const dateStr = fortune.date;
  return `${dateStr} ${stars} 宜:${yi} 忌:${ji} | ${fortune.fortune.overview}`;
}
