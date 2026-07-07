/**
 * 颜色输出决策，遵循社区惯例：
 * 1. `--no-color` 显式关闭
 * 2. NO_COLOR 环境变量存在即关闭（https://no-color.org/，任意值包括空串）
 * 3. stdout 不是 TTY（管道/重定向）时关闭，避免 ANSI 码污染下游
 */
export function shouldUseColor(
  noColorFlag: boolean,
  env: Record<string, string | undefined>,
  isTTY: boolean | undefined
): boolean {
  if (noColorFlag) return false;
  if (env.NO_COLOR !== undefined) return false;
  return isTTY === true;
}
