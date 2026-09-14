import { ym, type BarDataset, type LineDataset } from './types'

// 過去予測の検証と経済効果推定。research/ai-forecast-scorecard.md,
// ai-macro-economics.md 参照。

/** AGI到達予測の「大圧縮」: 予測時点 x → そのとき予測されたAGI/HLMI年 y */
export const agiForecasts: LineDataset = {
  kind: 'line',
  id: 'agi-forecasts',
  title: 'AGI到達予測の大圧縮: いつの時点で、何年と予測していたか',
  unit: '予測された到達年',
  series: [
    {
      id: 'aiimpacts',
      label: '研究者サーベイ(HLMI)',
      points: [
        { x: 2016, y: 2061, label: 'Grace et al. 2016' },
        { x: 2022, y: 2059, label: 'ESPAI 2022(738人)' },
        { x: 2023, y: 2047, label: 'ESPAI 2023(約2,700人)' },
      ],
    },
    {
      id: 'metaculus',
      label: 'Metaculus(強いAGI)',
      points: [
        { x: 2020, y: 2070, label: '約50年先(近似)' },
        { x: 2023, y: 2040, label: 'GPT-4後(近似)' },
        { x: ym('2025-10'), y: 2033 },
        { x: ym('2026-02'), y: 2033, label: '約2,000人の中央値' },
      ],
    },
    {
      id: 'kokotajlo',
      label: 'Kokotajlo(自動コーダー)',
      points: [
        { x: ym('2025-04'), y: 2027.2, label: 'AI 2027シナリオ' },
        { x: ym('2025-12'), y: 2030.5, label: '3〜5年後ろ倒し(近似)' },
        { x: ym('2026-04'), y: 2028.5, label: 'Q1 2026更新: 2028年央' },
      ],
    },
  ],
  source: {
    title: 'AI Impacts / Metaculus Q5121 / Q1 2026 Timelines Update',
    url: 'https://www.metaculus.com/questions/5121/when-will-the-first-general-ai-system-be-devised-tested-and-publicly-announced/',
    asOf: '2026-04',
    caveat:
      '定義がそれぞれ異なる(HLMI/強いAGI/自動コーダー)。Metaculusの2020・2023年値はグラフ読み取り近似。弱いAGI(Q3479)の中央値は2027年。',
  },
}

/** AI 2027 の53予測・1年後の判定内訳 */
export const ai2027Tracker: BarDataset = {
  kind: 'bar',
  id: 'ai2027-scorecard',
  title: '『AI 2027』(2025年4月)の53予測、1年後の判定',
  unit: '件',
  items: [
    { label: '確認された', value: 14 },
    { label: '予測より先行', value: 3 },
    { label: '順調(オントラック)', value: 10 },
    { label: '遅れている', value: 4 },
    { label: '兆候段階', value: 13 },
    { label: '未検証', value: 9 },
  ],
  source: {
    title: 'AI 2027 Tracker: One Year of Predictions vs. Reality(LessWrong)',
    url: 'https://www.lesswrong.com/posts/oSWae4bE4mqWy5a6Q/ai-2027-tracker-one-year-of-predictions-vs-reality',
    asOf: '2026-04',
    caveat: '確認+先行+順調で27件(51%)。定量進捗は予測ペースの約65%という別評価もある。',
  },
}

/** 機関別のAI経済効果推定(年率換算) — 3桁の開き */
export const growthEstimates: BarDataset = {
  kind: 'bar',
  id: 'growth-estimates',
  title: 'AIの経済成長効果の推定は機関によって400倍違う(年率換算)',
  unit: '%pt/年',
  items: [
    { label: 'Acemoglu 2024(TFP)', value: 0.07, detail: 'タスクベース、Hulten定理による規律付け' },
    { label: 'Penn Wharton 2025', value: 0.15 },
    { label: 'IMF 2025(欧州)', value: 0.2 },
    { label: 'ECB 2025(ユーロ圏)', value: 0.29 },
    { label: 'OECD 2024(中央値)', value: 0.4 },
    { label: 'McKinsey 2023(生成AI上限)', value: 0.6 },
    { label: 'Aghion-Bunel 2024', value: 1.0 },
    { label: 'Goldman Sachs 2023(米)', value: 1.5 },
    { label: 'Korinek-Suh 2024(AGI基準)', value: 18, detail: 'AGI到達を前提とするcomputeベース' },
    { label: 'Epoch GATE 2025(2035年)', value: 30, detail: '積極シナリオでは年30〜100%' },
  ],
  source: {
    title: 'Forecasts of AI & Economic Growth(Tom Cunningham 比較表)',
    url: 'https://tecunningham.github.io/posts/2025-10-19-forecasts-of-AI-growth-extended.html',
    asOf: '2025-10',
    caveat: 'タスクベースの手法は下位に、計算資源ベースの手法は上位に集まる。前提の違いがそのまま3桁の開きになる。',
  },
}

/** Okun係数: 同じGDPショックでも失業率の出方は国で違う */
export const okun: BarDataset = {
  kind: 'bar',
  id: 'okun',
  title: '産出が1%落ちたとき失業率は何pt上がるか(Okun係数)',
  unit: 'pt',
  items: [
    { label: 'スペイン', value: 0.82, detail: '有期雇用比率が高い' },
    { label: '米国', value: 0.45 },
    { label: 'スイス', value: 0.22 },
    { label: '日本', value: 0.17, detail: '長期雇用慣行。ショックは失業でなく賃金・採用で調整される' },
    { label: 'オーストリア', value: 0.13 },
  ],
  source: {
    title: "Okun's Law: Fit at 50?(Ball, Leigh & Loungani)",
    url: 'https://www.imf.org/external/pubs/ft/wp/2013/wp1310.pdf',
    asOf: '2017',
    caveat: '20先進国で安定して成立し、大不況でも係数はほぼ不変。シミュレータの労働流動性パラメータの実証的根拠。',
  },
}
