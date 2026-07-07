export interface CliArgs {
  date?: string;
  time?: string;
  lang?: string;
  detail: boolean;
  brief: boolean;
  format?: 'text' | 'json' | 'markdown';
  noColor: boolean;
  raw: boolean;
  version: boolean;
  help: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {
    detail: false,
    brief: false,
    noColor: false,
    raw: false,
    version: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    /** 取当前选项的参数值；缺失或紧跟另一个选项时告警并返回 undefined */
    const takeValue = (): string | undefined => {
      const next = argv[i + 1];
      if (next === undefined || (next.length > 1 && next.startsWith('-'))) {
        process.stderr.write(`警告：${arg} 缺少参数值\n`);
        return undefined;
      }
      i++;
      return next;
    };

    switch (arg) {
      case '-d':
      case '--date':
        result.date = takeValue();
        break;
      case '-t':
      case '--time':
        result.time = takeValue();
        break;
      case '-l':
      case '--lang': {
        const lang = takeValue();
        if (lang === undefined) break;
        if (lang === 'zh' || lang === 'zh-CN' || lang === 'en' || lang === 'en-US') {
          result.lang = lang;
        } else {
          process.stderr.write(`警告：未知语言 "${lang}"，使用默认语言\n`);
        }
        break;
      }
      case '-D':
      case '--detail':
        result.detail = true;
        break;
      case '-b':
      case '--brief':
        result.brief = true;
        break;
      case '-f':
      case '--format': {
        const fmt = takeValue();
        if (fmt === undefined) break;
        if (fmt === 'text' || fmt === 'json' || fmt === 'markdown') {
          result.format = fmt;
        } else {
          process.stderr.write(`警告：未知格式 "${fmt}"，使用默认 text\n`);
        }
        break;
      }
      case '-c':
      case '--no-color':
        result.noColor = true;
        break;
      case '-r':
      case '--raw':
        result.raw = true;
        break;
      case '-v':
      case '--version':
        result.version = true;
        break;
      case '-h':
      case '--help':
        result.help = true;
        break;
      default:
        if (arg.startsWith('-')) {
          process.stderr.write(`警告：未知参数 "${arg}"\n`);
        }
        break;
    }
  }

  return result;
}
