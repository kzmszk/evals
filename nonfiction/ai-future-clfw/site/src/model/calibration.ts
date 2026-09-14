import type { CountryParams, Scenario } from './types'

// ============================================================
// 係数はすべてこのファイルに集約する。
// 出典は research/ の調査ノートと data/sources を参照。
// 「暫定」とあるものは調査結果の反映で更新する。
// ============================================================

/** モデルの動学係数(国に依らない) */
export const DYNAMICS = {
  /**
   * 自動化1単位あたりの平均労働コスト削減率。
   * Acemoglu (2024) "The Simple Macroeconomics of AI" の27%
   * (Noy-Zhang / Brynjolfsson et al. の実験値平均)に合わせた。
   */
  costSavingPerTask: 0.27,
  /** 復権効果: 自動化1単位が生む新タスクの労働需要(置換の何割を相殺するか) */
  reinstatement: 0.35,
  /** 基準再吸収速度(年あたり、流動性1のとき失業超過分のこの割合が再就職) */
  reabsorptionBase: 0.55,
  /** 需要不足ペナルティ: 失業率+1ptの急変が成長率を何pt削るか(無策時) */
  demandPenalty: 0.35,
  /** 資本深化: 有効自動化1単位あたりの追加成長寄与(%) */
  capitalDeepening: 1.2,
  /** 潜在調整の解消速度(年あたり) */
  latentRelease: 0.15,
  /** 潜在調整が実現を遅らせる分のTFP実現率(0-1、λで補間) */
  latentTfpRealization: 0.55,
  /** 給付の立ち上がり速度(redistribution=1, 財政余地1のときの年あたり増分) */
  transferRampMax: 0.35,
  /** 給付発動の失業率閾値(u0からの上昇pt) */
  transferTriggerDu: 1.5,
  /** 生産年齢人口成長率が失業率に与える係数(労働供給経路: 人口減→需給逼迫→失業低下) */
  popGrowthToU: 0.15,
  /** 生産年齢人口成長率のGDP成長への寄与係数 */
  popGrowthToGdp: 0.4,
  /** 潜在スラックへの流入倍率(置換1ptが指数を何pt押し上げるか) */
  latentInflow: 2.5,
  /** 賃金への成長パススルー(生産性上昇の労働者取り分) */
  wagePassthrough: 0.55,
  /** 給付1.0が賃金(可処分所得)指数に与える年間押し上げ(%) */
  wageTransferBoost: 0.8,
  /** 復権効果(新タスク)1ptの賃金押し上げ係数 */
  wageReinstatement: 0.5,
  /** 賃金への置換圧力係数 */
  wagePressure: 0.9,
  /** 安定性の重み */
  stability: {
    uLevel: 3.2, // 失業率1ptあたりの減点
    uQuad: 0.12, // 失業率超過分の二乗項(高失業ほど非線形に効く)
    uDelta: 6.0, // 失業率の年間上昇1ptあたりの減点
    latent: 0.45, // 潜在スラック1ptあたりの減点
    wageDecline: 0.8, // 賃金指数の低下1ptあたりの減点
    transferRelief: 30, // 給付1.0あたりの加点
    growthRelief: 1.0, // 成長率1%あたりの加点
    recovery: 0.25, // ストレスが減った年に基準(100)へ戻る速度
  },
  /** 危機閾値(これを割ると不安定化イベント) */
  crisisThreshold: 40,
} as const

/**
 * 国別パラメータのキャリブレーション根拠(research/ の調査ノート参照):
 * - laborFlexibility: Okun係数の国際比較(Ball-Leigh-Loungani: 米0.45 / 日0.17 /
 *   西0.82)と平均勤続年数(米3.9年 / 日12.4年)の相対比に合わせた。
 * - cognitiveExposure: IMF SDN/2024/001(先進国の雇用の60%がAI曝露、うち約半分が
 *   代替リスク)と Eloundou et al. (2023) を折衷。中国は新興国水準(曝露40%)。
 * - adoptionSpeed: 生成AI業務利用率(総務省 令和7年版白書: 米90.6% / 中95.8% /
 *   独90.3% / 日55.2%)と個人利用率(日26.7%)の格差を反映。
 * - baselineGrowth / u0: IMF WEO と各国統計の2026年央の実績値近傍。
 * - 社会安定性の給付効果の非対称性: Ponticelli-Voth(緊縮≥5%GDPで不安イベント
 *   約2倍、増税側は非有意)に基づき「可処分所得の急落」をトリガーにしている。
 */
export const COUNTRIES: CountryParams[] = [
  {
    id: 'us',
    name: 'アメリカ',
    laborFlexibility: 0.85,
    adoptionSpeed: 0.22,
    cognitiveExposure: 0.46,
    physicalExposure: 0.28,
    baselineGrowth: 2.0,
    u0: 4.3,
    uFloor: 3.2,
    popGrowth: 0.3,
    safetyNet: 0.35,
    fiscalSpace: 0.6,
    exposedToChinaControls: true,
  },
  {
    id: 'china',
    name: '中国',
    laborFlexibility: 0.6,
    adoptionSpeed: 0.2,
    cognitiveExposure: 0.32,
    physicalExposure: 0.42,
    baselineGrowth: 4.0,
    u0: 5.1,
    uFloor: 3.8,
    popGrowth: -0.3,
    safetyNet: 0.3,
    fiscalSpace: 0.55,
    exposedToChinaControls: false,
  },
  {
    id: 'japan',
    name: '日本',
    laborFlexibility: 0.3,
    adoptionSpeed: 0.1,
    cognitiveExposure: 0.4,
    physicalExposure: 0.32,
    baselineGrowth: 0.6,
    u0: 2.5,
    uFloor: 2.0,
    popGrowth: -0.8,
    safetyNet: 0.55,
    fiscalSpace: 0.35,
    exposedToChinaControls: true,
  },
  {
    id: 'eu',
    name: 'EU',
    laborFlexibility: 0.45,
    adoptionSpeed: 0.11,
    cognitiveExposure: 0.42,
    physicalExposure: 0.3,
    baselineGrowth: 1.2,
    u0: 5.9,
    uFloor: 4.5,
    popGrowth: -0.2,
    safetyNet: 0.7,
    fiscalSpace: 0.45,
    exposedToChinaControls: true,
  },
]

/**
 * 記事の「中位シナリオ」に対応する既定値。
 * agiMidYear=2031 は Metaculus 強いAGI中央値 2033(2026-02)、Kokotajlo の
 * 自動コーダー中央値 2028年央(2026-04)、Lifland の 2030年央 の間を取った値。
 * cognitiveCap=0.85 は「規制・物理・人間選好で残る仕事」を15%とみる仮定。
 */
export const DEFAULT_SCENARIO: Scenario = {
  agiMidYear: 2031,
  capabilitySlope: 0.45,
  cognitiveCap: 0.85,
  physicalLagYears: 6,
  redistribution: 0.4,
  chinaExportControl: 0.35,
}

export const SIM_START = 2026
export const SIM_END = 2036
