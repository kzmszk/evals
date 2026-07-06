import { type BarDataset, type LineDataset } from './types'

// フィジカルAI。research/physical-ai.md 参照。

/** 産業用ロボット世界年間設置台数 */
export const robotInstalls: LineDataset = {
  kind: 'line',
  id: 'robot-installs',
  title: '産業用ロボットの世界年間設置台数',
  unit: '千台',
  series: [
    {
      id: 'installs',
      label: '年間設置台数',
      points: [
        { x: 2014, y: 213 },
        { x: 2015, y: 249 },
        { x: 2016, y: 297 },
        { x: 2017, y: 393 },
        { x: 2018, y: 415 },
        { x: 2019, y: 376 },
        { x: 2020, y: 379 },
        { x: 2021, y: 519 },
        { x: 2022, y: 553 },
        { x: 2023, y: 541 },
        { x: 2024, y: 542 },
      ],
    },
    {
      id: 'forecast',
      label: 'IFR予測',
      dashed: true,
      points: [
        { x: 2024, y: 542 },
        { x: 2025, y: 575 },
        { x: 2028, y: 700 },
      ],
    },
  ],
  source: {
    title: 'IFR World Robotics 2025',
    url: 'https://ifr.org/img/worldrobotics/Executive_Summary_WR_2025_Industrial_Robots.pdf',
    asOf: '2025-09',
    caveat: '2014〜2021年はグラフ読み取りの近似。2024年の中国シェアは54%(29.5万台)、稼働台数は中国だけで200万台超。',
  },
}

/** 2024年 産業用ロボット設置の国別内訳 */
export const robotCountries: BarDataset = {
  kind: 'bar',
  id: 'robot-countries',
  title: '産業用ロボット年間設置台数の国別内訳(2024年)',
  unit: '台',
  items: [
    { label: '中国', value: 295045, detail: '世界の54%。国産メーカーのシェアも57%へ逆転' },
    { label: '日本', value: 44453 },
    { label: '米国', value: 34164 },
    { label: '韓国', value: 30596 },
    { label: 'ドイツ', value: 26982 },
  ],
  source: {
    title: 'IFR World Robotics 2025',
    url: 'https://ifr.org/img/worldrobotics/Executive_Summary_WR_2025_Industrial_Robots.pdf',
    asOf: '2025-09',
  },
}

/** 2025年ヒューマノイド出荷(社別、Omdia) */
export const humanoidShipments: BarDataset = {
  kind: 'bar',
  id: 'humanoid-shipments',
  title: 'ヒューマノイドロボットの2025年出荷・生産(社別)',
  unit: '台',
  items: [
    { label: 'AgiBot(智元)', value: 5168, detail: '2026年3月に累計1万台到達' },
    { label: 'Unitree(宇樹)', value: 4200, detail: 'Omdia集計。自社発表では5,500台超' },
    { label: 'UBTech Walker S2', value: 1000, detail: '2025年末までの累計生産(約)。BYD等へ配備' },
    { label: 'Figure 03', value: 350, detail: '2026年4月末の累計生産(超)。BotQの設計能力は年1.2万台' },
  ],
  source: {
    title: 'Omdia(2026年1月)/ 各社発表',
    url: 'https://www.forbes.com/sites/jonmarkman/2026/04/27/unitree-g1-humanoid-robots-are-reshaping-the-robotics-investment-stack/',
    asOf: '2026-04',
    caveat: '2025年の世界出荷は約13,300台(前年比約5倍)で、中国勢が約8〜9割。出荷台数と実稼働は別物である点に注意。',
  },
}

/** ヒューマノイド価格の急低下 */
export const humanoidPrices: BarDataset = {
  kind: 'bar',
  id: 'humanoid-prices',
  title: 'ヒューマノイドの発売価格はわずか2年で1桁下がった',
  unit: 'ドル',
  items: [
    { label: 'Unitree H1(2023年)', value: 90000 },
    { label: 'Unitree H2(2025年10月)', value: 40900 },
    { label: 'Tesla Optimus 目標(未実現)', value: 22500, detail: '$20k〜25kの中央値。2026年夏にV3低量産開始予定' },
    { label: '1X NEO 家庭用(2025年10月)', value: 20000 },
    { label: 'Unitree G1(2024年)', value: 16000 },
    { label: 'Unitree R1(2025年7月)', value: 5900 },
  ],
  source: {
    title: 'Unitree / 1X / Tesla 各社発表',
    url: 'https://shop.unitree.com/',
    asOf: '2026-01',
    caveat: 'Goldman Sachs推計では製造BOMは2022→2023年に約40%低下。ただし低価格機と労働代替可能な商用機は別クラス。',
  },
}

/** 中国ヒューマノイド出荷予測(Morgan Stanley) */
export const humanoidForecast: BarDataset = {
  kind: 'bar',
  id: 'humanoid-forecast',
  title: '中国のヒューマノイド出荷台数: 実績と予測',
  unit: '台',
  items: [
    { label: '2025年 実績(世界の約9割)', value: 12800 },
    { label: '2026年 予測(Morgan Stanley)', value: 50000, detail: '2026年6月に2.8万から5万へ上方修正' },
    { label: '2030年 予測(同上)', value: 446000, detail: '従来予測26.2万から上方修正' },
  ],
  source: {
    title: 'Morgan Stanley(SCMP / CNBC報道)/ MERICS',
    url: 'https://www.scmp.com/tech/article/3358210/morgan-stanley-raises-china-humanoid-robot-shipment-forecast-50000-units',
    asOf: '2026-06',
  },
}
