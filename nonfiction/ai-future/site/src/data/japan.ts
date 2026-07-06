import { type BarDataset, type LineDataset } from './types'

// 日本・EUの制度条件。research/japan-eu-institutions.md 参照。

/** 生成AI利用率の国際比較 */
export const genAiAdoption: BarDataset = {
  kind: 'bar',
  id: 'genai-adoption',
  title: '生成AIの個人利用率(2024年度、国別)',
  unit: '%',
  items: [
    { label: '中国', value: 81.2 },
    { label: '米国', value: 68.8 },
    { label: 'ドイツ', value: 59.2 },
    { label: '日本', value: 26.7, detail: '前年9.1%から+17.6pt。企業の業務利用は55.2%(米中独は90%超)' },
  ],
  source: {
    title: '総務省 令和7年版情報通信白書',
    url: 'https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd112210.html',
    asOf: '2025-07',
  },
}

/** 平均勤続年数の国際比較(労働流動性の代理指標) */
export const tenure: BarDataset = {
  kind: 'bar',
  id: 'tenure',
  title: '平均勤続年数の国際比較(労働流動性の裏返し)',
  unit: '年',
  items: [
    { label: '日本', value: 12.4 },
    { label: 'フランス', value: 10.3 },
    { label: 'ドイツ', value: 10.1 },
    { label: '英国', value: 9.4 },
    { label: 'スウェーデン', value: 8.0 },
    { label: 'デンマーク', value: 7.0 },
    { label: '米国', value: 3.9 },
  ],
  source: {
    title: 'OECDデータ(2023年前後)',
    url: 'https://toyokeizai.net/articles/-/900776',
    asOf: '2023',
  },
}

/** 日本の労働力不足の進行 */
export const laborShortage: LineDataset = {
  kind: 'line',
  id: 'labor-shortage',
  title: '日本の外国人労働者数(各年10月末)',
  unit: '万人',
  series: [
    {
      id: 'foreign',
      label: '外国人労働者',
      points: [
        { x: 2022.8, y: 182.3 },
        { x: 2023.8, y: 204.9 },
        { x: 2024.8, y: 230.3 },
        { x: 2025.8, y: 257.1, label: '過去最多(+11.7%)' },
      ],
    },
  ],
  source: {
    title: '厚生労働省 外国人雇用状況の届出状況',
    url: 'https://www.mhlw.go.jp/stf/newpage_68794.html',
    asOf: '2025-10',
    caveat: '人手不足倒産も2025年度441件と3年連続過去最多(帝国データバンク)。内訳は建設112件、道路貨物運送55件など。',
  },
}
