// モデルの入出力型。動的な仕組みは engine.ts、係数は calibration.ts を参照。

export type CountryId = 'us' | 'china' | 'japan' | 'eu'

/** シナリオスライダー(UIから操作する外生入力) */
export interface Scenario {
  /** 認知タスク自動化可能率が上限の50%に達する年 */
  agiMidYear: number
  /** ロジスティックの傾き(1/年)。大きいほど急激な進化 */
  capabilitySlope: number
  /** 認知タスク自動化可能率の上限 (0-1) */
  cognitiveCap: number
  /** フィジカルAIが認知系に遅れる年数 */
  physicalLagYears: number
  /** 再分配政策の積極度 (0-1)。政治がどれだけ早く・厚く動くか */
  redistribution: number
  /** 中国のロボット部品輸出規制の強度 (0-1)。非中国のフィジカルAI導入を遅らせる */
  chinaExportControl: number
}

/** 国別の構造パラメータ(calibration.ts で出典付きで定義) */
export interface CountryParams {
  id: CountryId
  name: string
  /** 労働流動性 (0-1)。高いほど置換が顕在失業として現れ、再吸収も速い */
  laborFlexibility: number
  /** フロンティア能力を実運用に落とす速さ (0-1/年) */
  adoptionSpeed: number
  /** 雇用に占めるAI曝露度の高い認知タスクの割合 (0-1) */
  cognitiveExposure: number
  /** 雇用に占めるロボット化可能な身体タスクの割合 (0-1) */
  physicalExposure: number
  /** AIなしの基準実質成長率 (%/年) */
  baselineGrowth: number
  /** 初期失業率 (%) */
  u0: number
  /** 失業率の下限 (%) */
  uFloor: number
  /** 生産年齢人口成長率 (%/年)。日本は負 */
  popGrowth: number
  /** 既存セーフティネットの厚み (0-1) */
  safetyNet: number
  /** 追加再分配(UBI等)の財政余地 (0-1) */
  fiscalSpace: number
  /** 中国規制の影響を受ける側か(中国自身は false) */
  exposedToChinaControls: boolean
}

/** 1年分のシミュレーション結果 */
export interface YearResult {
  year: number
  /** 認知タスクの自動化可能率(フロンティア) */
  frontierCognitive: number
  /** 実際に導入された自動化率(認知+身体の曝露加重平均) */
  effectiveAutomation: number
  /** GDP指数 (2026=100) */
  gdpIndex: number
  /** 実質成長率 (%/年) */
  growth: number
  /** 失業率 (%) */
  unemployment: number
  /** 潜在スラック指数 (0-100)。採用凍結・賃金停滞など統計に出ない調整の蓄積 */
  latentSlack: number
  /** 実質賃金指数 (2026=100) */
  wageIndex: number
  /** 再分配給付の水準 (0-1)。1で本格UBI相当 */
  transferLevel: number
  /** 社会安定性指数 (0-100) */
  stability: number
}

export interface CountryRun {
  country: CountryId
  years: YearResult[]
  /** 給付が本格化(transferLevel > 0.5)した年。なければ null */
  ubiYear: number | null
  /** 安定性が危機閾値(40)を割った最初の年。なければ null */
  crisisYear: number | null
}

export type SimulationResult = Record<CountryId, CountryRun>
