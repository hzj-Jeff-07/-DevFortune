export interface CliArgs {
  date?: string;
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

    switch (arg) {
      case '-d':
      case '--date':
        result.date = argv[++i];
        break;
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
        const fmt = argv[++i];
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
