import { ym, type BarDataset, type LineDataset } from './types'

// 雇用への影響。research/ai-employment-impact.md 参照。

/** Stanford「Canaries」研究: 若年AI高曝露職の相対雇用 */
export const canaries: LineDataset = {
  kind: 'line',
  id: 'canaries',
  title: '22〜25歳のAI高曝露職の雇用(2022年末比の相対変化)',
  unit: '%',
  series: [
    {
      id: 'young-exposed',
      label: '22〜25歳・高曝露職',
      points: [
        { x: ym('2022-11'), y: 0 },
        { x: ym('2025-07'), y: -13 },
        { x: ym('2025-10'), y: -16 },
      ],
    },
  ],
  source: {
    title: 'Canaries in the Coal Mine?(Stanford Digital Economy Lab、ADP給与個票)',
    url: 'https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/',
    asOf: '2025-11',
    caveat:
      '企業レベルショック統制後の相対減。若手ソフトウェア開発者単体では約-20%。経験者・低曝露職は横ばい〜増加。',
  },
}

/** 生成AI生産性RCTの効果量(負値=悪化) */
export const rctEffects: BarDataset = {
  kind: 'bar',
  id: 'rct-effects',
  title: '生成AIの生産性効果: 無作為化実験(RCT)の結果',
  unit: '%',
  items: [
    { label: 'コーディング時間短縮(GitHub Copilot 2023)', value: 55.8 },
    { label: '文書作成時間短縮(Noy & Zhang 2023)', value: 40 },
    { label: 'コールセンター新人の処理数(Brynjolfsson 2023)', value: 34 },
    { label: 'コールセンター全体(同上)', value: 14 },
    { label: '熟練OSS開発者の速度(METR 2025)', value: -19, detail: '本人は「20%速くなった」と認識していたが実測は19%遅延' },
  ],
  source: {
    title: '各RCT論文(Science 他)',
    url: 'https://www.science.org/doi/10.1126/science.adh2586',
    asOf: '2025-07',
    caveat: '測定指標が研究ごとに異なる。新人・定型作業ほど効果が大きく、熟練者の複雑な作業では逆効果の例も。',
  },
}

/** 2026年上半期のAI言及レイオフ */
export const layoffs: BarDataset = {
  kind: 'bar',
  id: 'layoffs',
  title: 'AIを理由に挙げた主要レイオフ(2026年上半期)',
  unit: '人',
  items: [
    { label: 'Oracle', value: 21000 },
    { label: 'Amazon', value: 16000 },
    { label: 'Dell', value: 11000 },
    { label: 'Meta', value: 8000 },
    { label: 'PayPal', value: 4500 },
    { label: 'Block', value: 4000 },
    { label: 'Cisco', value: 4000 },
    { label: 'Intuit', value: 3000 },
  ],
  source: {
    title: 'TechCrunch AI layoffs list 2026',
    url: 'https://techcrunch.com/2026/06/22/the-running-list-major-tech-layoffs-in-2026-where-employers-cited-ai/',
    asOf: '2026-06',
    caveat: '「AIに言及した」レイオフであり、純粋なAI代替とは限らない。2025年通年の米AI起因レイオフは約5.5万人。',
  },
}

/** 失業率の対比: 全体は静かで、入口だけが痛む */
export const unemploymentGap: BarDataset = {
  kind: 'bar',
  id: 'unemployment-gap',
  title: '失業率: 経済全体は歴史的低水準、若年大卒だけが悪化(2026年)',
  unit: '%',
  items: [
    { label: '日本 全体(2026年5月)', value: 2.5, detail: '有効求人倍率1.17倍' },
    { label: '米国 全体(2026年6月)', value: 4.2 },
    { label: '米国 22〜27歳大卒(2026年3月)', value: 5.6, detail: 'NY連銀。新卒の不完全就業率は41.5%' },
    { label: 'ユーロ圏 全体(2026年5月)', value: 6.2 },
  ],
  source: {
    title: 'BLS / Eurostat / 総務省 / NY連銀',
    url: 'https://ec.europa.eu/eurostat/web/products-euro-indicators/w/3-02072026-ap',
    asOf: '2026-06',
  },
}
