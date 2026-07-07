/**
 * 终端显示宽度计算。
 *
 * String.length 把汉字/全角符号算作 1 列，导致边框对不齐；
 * 终端里 CJK 与 emoji 实际占 2 列。此处按 Unicode East Asian Width
 * 的宽字符区段做近似判定，覆盖中日韩、全角标点与常见 emoji。
 */

function charWidth(cp: number): number {
  // 零宽字符：组合符、变体选择符、零宽连接符
  if (
    (cp >= 0x0300 && cp <= 0x036f) ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    cp === 0x200d ||
    cp === 0xfeff
  ) {
    return 0;
  }

  if (
    (cp >= 0x1100 && cp <= 0x115f) || // 韩文字母
    (cp >= 0x2e80 && cp <= 0x303e) || // CJK 部首、康熙部首、CJK 标点
    (cp >= 0x3041 && cp <= 0x33ff) || // 平/片假名、注音、CJK 兼容
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK 扩展 A
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK 统一表意文字
    (cp >= 0xa000 && cp <= 0xa4cf) || // 彝文
    (cp >= 0xac00 && cp <= 0xd7a3) || // 韩文音节
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK 兼容表意文字
    (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK 兼容形式
    (cp >= 0xff00 && cp <= 0xff60) || // 全角 ASCII、全角标点
    (cp >= 0xffe0 && cp <= 0xffe6) || // 全角符号
    (cp >= 0x1f300 && cp <= 0x1faff) || // emoji 主要区段
    (cp >= 0x20000 && cp <= 0x3fffd) // CJK 扩展 B+
  ) {
    return 2;
  }

  return 1;
}

/** 字符串在终端中占用的列数 */
export function displayWidth(str: string): number {
  let width = 0;
  for (const ch of str) {
    width += charWidth(ch.codePointAt(0) ?? 0);
  }
  return width;
}
