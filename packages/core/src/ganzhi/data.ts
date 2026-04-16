import { TianGan, DiZhi, WuXing, YinYang } from '../types.js';
import type { TianGanInfo, DiZhiInfo } from '../types.js';

/** 天干数据表 */
export const TIANGAN_DATA: TianGanInfo[] = [
  { index: 0, name: '甲', pinyin: 'jiǎ',  wuxing: WuXing.Mu,   yinyang: YinYang.Yang },
  { index: 1, name: '乙', pinyin: 'yǐ',   wuxing: WuXing.Mu,   yinyang: YinYang.Yin  },
  { index: 2, name: '丙', pinyin: 'bǐng', wuxing: WuXing.Huo,  yinyang: YinYang.Yang },
  { index: 3, name: '丁', pinyin: 'dīng', wuxing: WuXing.Huo,  yinyang: YinYang.Yin  },
  { index: 4, name: '戊', pinyin: 'wù',   wuxing: WuXing.Tu,   yinyang: YinYang.Yang },
  { index: 5, name: '己', pinyin: 'jǐ',   wuxing: WuXing.Tu,   yinyang: YinYang.Yin  },
  { index: 6, name: '庚', pinyin: 'gēng', wuxing: WuXing.Jin,  yinyang: YinYang.Yang },
  { index: 7, name: '辛', pinyin: 'xīn',  wuxing: WuXing.Jin,  yinyang: YinYang.Yin  },
  { index: 8, name: '壬', pinyin: 'rén',  wuxing: WuXing.Shui, yinyang: YinYang.Yang },
  { index: 9, name: '癸', pinyin: 'guǐ',  wuxing: WuXing.Shui, yinyang: YinYang.Yin  },
];

/** 地支数据表 */
export const DIZHI_DATA: DiZhiInfo[] = [
  { index: 0,  name: '子', pinyin: 'zǐ',   wuxing: WuXing.Shui, yinyang: YinYang.Yang, shengxiao: '鼠', shichen: '23:00-01:00' },
  { index: 1,  name: '丑', pinyin: 'chǒu', wuxing: WuXing.Tu,   yinyang: YinYang.Yin,  shengxiao: '牛', shichen: '01:00-03:00' },
  { index: 2,  name: '寅', pinyin: 'yín',  wuxing: WuXing.Mu,   yinyang: YinYang.Yang, shengxiao: '虎', shichen: '03:00-05:00' },
  { index: 3,  name: '卯', pinyin: 'mǎo',  wuxing: WuXing.Mu,   yinyang: YinYang.Yin,  shengxiao: '兔', shichen: '05:00-07:00' },
  { index: 4,  name: '辰', pinyin: 'chén', wuxing: WuXing.Tu,   yinyang: YinYang.Yang, shengxiao: '龙', shichen: '07:00-09:00' },
  { index: 5,  name: '巳', pinyin: 'sì',   wuxing: WuXing.Huo,  yinyang: YinYang.Yin,  shengxiao: '蛇', shichen: '09:00-11:00' },
  { index: 6,  name: '午', pinyin: 'wǔ',   wuxing: WuXing.Huo,  yinyang: YinYang.Yang, shengxiao: '马', shichen: '11:00-13:00' },
  { index: 7,  name: '未', pinyin: 'wèi',  wuxing: WuXing.Tu,   yinyang: YinYang.Yin,  shengxiao: '羊', shichen: '13:00-15:00' },
  { index: 8,  name: '申', pinyin: 'shēn', wuxing: WuXing.Jin,  yinyang: YinYang.Yang, shengxiao: '猴', shichen: '15:00-17:00' },
  { index: 9,  name: '酉', pinyin: 'yǒu',  wuxing: WuXing.Jin,  yinyang: YinYang.Yin,  shengxiao: '鸡', shichen: '17:00-19:00' },
  { index: 10, name: '戌', pinyin: 'xū',   wuxing: WuXing.Tu,   yinyang: YinYang.Yang, shengxiao: '狗', shichen: '19:00-21:00' },
  { index: 11, name: '亥', pinyin: 'hài',  wuxing: WuXing.Shui, yinyang: YinYang.Yin,  shengxiao: '猪', shichen: '21:00-23:00' },
];

/** 纳音表（60甲子） */
const NAYIN_TABLE: string[] = [
  '海中金', '海中金', // 甲子 乙丑
  '炉中火', '炉中火', // 丙寅 丁卯
  '大林木', '大林木', // 戊辰 己巳
  '路旁土', '路旁土', // 庚午 辛未
  '剑锋金', '剑锋金', // 壬申 癸酉
  '山头火', '山头火', // 甲戌 乙亥
  '涧下水', '涧下水', // 丙子 丁丑
  '城头土', '城头土', // 戊寅 己卯
  '白蜡金', '白蜡金', // 庚辰 辛巳
  '杨柳木', '杨柳木', // 壬午 癸未
  '泉中水', '泉中水', // 甲申 乙酉
  '屋上土', '屋上土', // 丙戌 丁亥
  '霹雳火', '霹雳火', // 戊子 己丑
  '松柏木', '松柏木', // 庚寅 辛卯
  '长流水', '长流水', // 壬辰 癸巳
  '沙中金', '沙中金', // 甲午 乙未
  '山下火', '山下火', // 丙申 丁酉
  '平地木', '平地木', // 戊戌 己亥
  '壁上土', '壁上土', // 庚子 辛丑
  '金箔金', '金箔金', // 壬寅 癸卯
  '覆灯火', '覆灯火', // 甲辰 乙巳
  '天河水', '天河水', // 丙午 丁未
  '大驿土', '大驿土', // 戊申 己酉
  '钗钏金', '钗钏金', // 庚戌 辛亥
  '桑柘木', '桑柘木', // 壬子 癸丑
  '大溪水', '大溪水', // 甲寅 乙卯
  '沙中土', '沙中土', // 丙辰 丁巳
  '天上火', '天上火', // 戊午 己未
  '石榴木', '石榴木', // 庚申 辛酉
  '大海水', '大海水', // 壬戌 癸亥
];

/** 地支藏干表 */
export const HIDDEN_STEMS: Record<number, TianGan[]> = {
  [DiZhi.Zi]:   [TianGan.Gui],
  [DiZhi.Chou]: [TianGan.Ji, TianGan.Gui, TianGan.Xin],
  [DiZhi.Yin]:  [TianGan.Jia, TianGan.Bing, TianGan.Wu],
  [DiZhi.Mao]:  [TianGan.Yi],
  [DiZhi.Chen]: [TianGan.Wu, TianGan.Yi, TianGan.Gui],
  [DiZhi.Si]:   [TianGan.Bing, TianGan.Wu, TianGan.Geng],
  [DiZhi.Wu]:   [TianGan.Ding, TianGan.Ji],
  [DiZhi.Wei]:  [TianGan.Ji, TianGan.Ding, TianGan.Yi],
  [DiZhi.Shen]: [TianGan.Geng, TianGan.Ren, TianGan.Wu],
  [DiZhi.You]:  [TianGan.Xin],
  [DiZhi.Xu]:   [TianGan.Wu, TianGan.Xin, TianGan.Ding],
  [DiZhi.Hai]:  [TianGan.Ren, TianGan.Jia],
};

export function getTianGanInfo(index: number): TianGanInfo {
  return TIANGAN_DATA[((index % 10) + 10) % 10];
}

export function getDiZhiInfo(index: number): DiZhiInfo {
  return DIZHI_DATA[((index % 12) + 12) % 12];
}

export function getNayin(jiaziIndex: number): string {
  return NAYIN_TABLE[jiaziIndex] ?? '未知';
}

export function getJiaZiIndex(tg: number, dz: number): number {
  if (tg % 2 !== dz % 2) {
    throw new Error('Invalid TianGan-DiZhi combination: parity mismatch');
  }
  return ((6 * tg - 5 * dz) % 60 + 60) % 60;
}

export function getHiddenStems(diZhi: DiZhiInfo): TianGanInfo[] {
  const stems = HIDDEN_STEMS[diZhi.index] ?? [];
  return stems.map(tg => TIANGAN_DATA[tg]);
}
