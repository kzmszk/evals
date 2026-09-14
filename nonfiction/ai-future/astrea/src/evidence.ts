export type Source = {
  id: string;
  title: string;
  org: string;
  date: string;
  period: string;
  kind: string;
  url: string;
  finding: string;
  limit: string;
  topic: string;
};
export const sources: Source[] = [
  {
    id: "metr-work",
    org: "METR",
    date: "2025年7月10日",
    period: "2025年前半・熟練開発者16人、246課題",
    kind: "無作為化実験",
    topic: "仕事",
    title: "Experienced Open-Source Developer Productivity",
    url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
    finding:
      "自身の大規模リポジトリでの作業で、AI利用群の所要時間が平均19%増えた。",
    limit:
      "小標本・特定の熟練者・当時のツール。全開発者や現行AIへ一般化しない。後続研究も参照。",
  },
  {
    id: "metr-update",
    org: "METR",
    date: "2026年2月24日",
    period: "2025年後半の追試",
    kind: "追試・方法論",
    topic: "仕事",
    title: "We are Changing our Developer Productivity Experiment Design",
    url: "https://metr.org/blog/2026-02-24-uplift-update/",
    finding:
      "改善の可能性を認めつつ、AIなし条件を避ける選択効果などで効果量が信頼できないと報告。",
    limit:
      "旧結果を現在に固定せず、新結果も確定した生産性上昇率として扱わない。",
  },
  {
    id: "denmark",
    org: "Humlum & Vestergaard / NBER",
    date: "2025年公開・改訂あり",
    period: "デンマークの職業調査と行政記録",
    kind: "観察研究",
    topic: "仕事",
    title: "Large Language Models, Small Labor Market Effects",
    url: "https://www.nber.org/papers/w33777",
    finding:
      "対象職種における賃金・記録上の労働時間への大きな短期効果を確認できなかった。",
    limit:
      "一国・短期の推計。技能や制度、対象期間が違う場所でもゼロだという意味ではない。",
  },

  {
    id: "metr",
    org: "METR",
    date: "2026年5月更新",
    period: "評価課題・モデルごとに異なる",
    kind: "能力評価",
    topic: "知能",
    title: "Task-Completion Time Horizons",
    url: "https://metr.org/time-horizons/",
    finding:
      "人間の専門家にかかる時間とAIの課題成功率から、50%・80%成功の時間地平線を推定。",
    limit:
      "主にソフトウェア・ML・サイバー分野。連続して働ける時間でも、職業全体の代替率でもない。",
  },
  {
    id: "metr-limit",
    org: "METR",
    date: "2026年1月22日",
    period: "指標の解釈",
    kind: "方法論",
    topic: "知能",
    title: "Clarifying limitations of time horizon",
    url: "https://metr.org/notes/2026-01-22-time-horizon-limitations/",
    finding: "実務への換算には人間の指示・検証・待ち時間を含める必要がある。",
    limit: "ベンチマークをそのまま研究者の生産性に変換できない。",
  },
  {
    id: "ai2027",
    org: "AI Futures Project",
    date: "2025年4月公開・後日更新あり",
    period: "2027年に至る条件付き経路",
    kind: "シナリオ",
    topic: "知能",
    title: "AI 2027",
    url: "https://ai-2027.com/",
    finding: "研究自動化と能力向上が連鎖する具体的な未来像を描く。",
    limit:
      "物語上の日付と著者の確率分布は同じではない。2027年の到達点は基準日時点で未判定。",
  },
  {
    id: "sa",
    org: "Leopold Aschenbrenner",
    date: "2024年6月",
    period: "2020年代後半への見通し",
    kind: "論考・予測",
    topic: "知能",
    title: "Situational Awareness",
    url: "https://situational-awareness.ai/wp-content/uploads/2024/06/situationalawareness.pdf",
    finding: "計算量・アルゴリズム・能力の実用化から研究者水準のAIを見通す。",
    limit:
      "著者の推論。計算量の拡大と自律的研究の成功は別に検証する必要がある。",
  },
  {
    id: "ilo",
    org: "ILO / NASK",
    date: "2025年5月20日",
    period: "2025年版の職務曝露推計",
    kind: "曝露推計",
    topic: "仕事",
    title: "Generative AI and jobs: A 2025 update",
    url: "https://www.ilo.org/publications/generative-ai-and-jobs-2025-update",
    finding: "世界の労働者の約4人に1人が、何らかの生成AI曝露のある職業に就く。",
    limit:
      "曝露は技術的な影響の可能性。4人に1人が失業する、という意味ではない。",
  },
  {
    id: "support",
    org: "Brynjolfsson, Li & Raymond / NBER",
    date: "2023年公開・改訂あり",
    period: "顧客対応担当者5,179人",
    kind: "準実験",
    topic: "仕事",
    title: "Generative AI at Work",
    url: "https://www.nber.org/papers/w31161",
    finding:
      "顧客対応へのAI導入で処理件数が増加。経験の浅い担当者に大きい効果。",
    limit: "一企業の特定業務。初期WPの平均14%と出版版の約15%を混在させない。",
  },
  {
    id: "writing",
    org: "Noy & Zhang / MIT",
    date: "2023年3月・後にScience掲載",
    period: "専門職444人の文章作成課題",
    kind: "無作為化実験",
    topic: "仕事",
    title: "Experimental Evidence on the Productivity Effects of Generative AI",
    url: "https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1_0.pdf",
    finding: "文章作成課題で作業時間が短縮し、成果物の評価が上昇。",
    limit:
      "組織固有の事情や事実確認を十分含まない短時間課題。雇用の純増減は測らない。",
  },
  {
    id: "acemoglu",
    org: "Daron Acemoglu / NBER",
    date: "2024年5月公開・改訂あり",
    period: "10年間の条件付き効果",
    kind: "マクロモデル",
    topic: "経済",
    title: "The Simple Macroeconomics of AI",
    url: "https://www.nber.org/papers/w32487",
    finding:
      "経済全体への効果は、影響を受けるタスクの重みとコスト削減幅に依存する。",
    limit:
      "タスク構成の変化や研究自動化の増幅をどう置くかで結論が変わる。普遍的な成長の上限ではない。",
  },
  {
    id: "oecd",
    org: "OECD",
    date: "2024年",
    period: "中期の生産性シナリオ",
    kind: "マクロモデル",
    topic: "経済",
    title:
      "Miracle or Myth? Assessing the macroeconomic productivity gains from AI",
    url: "https://www.oecd.org/en/publications/miracle-or-myth-assessing-the-macroeconomic-productivity-gains-from-artificial-intelligence_b524a072-en.html",
    finding:
      "タスク別の生産性、普及、産業間のつながりを通じてマクロへの効果を考える。",
    limit: "推計条件が異なる数値を、単純な予測精度ランキングにはできない。",
  },
  {
    id: "iea",
    org: "IEA",
    date: "2026年版",
    period: "2025年推計・2030年中心見通し",
    kind: "実績推計＋将来推計",
    topic: "電力",
    title: "Key Questions on Energy and AI",
    url: "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary",
    finding:
      "世界のデータセンター電力は2025年485TWhから2030年950TWhへ増加する中心見通し。",
    limit:
      "AI専用の消費量ではない。2030年は推計値であり、効率・設備・利用の条件に左右される。",
  },
  {
    id: "ifr",
    org: "IFR",
    date: "2025年9月公表",
    period: "2024年の新規設置",
    kind: "業界統計",
    topic: "ロボット",
    title: "World Robotics 2025",
    url: "https://ifr.org/worldrobotics/report-2025",
    finding:
      "世界で産業用ロボット約54.2万台を設置。中国は約29.5万台、日本は約4.45万台。",
    limit:
      "産業用ロボットの設置台数。製造国のシェア、AI搭載率、ヒューマノイドの台数ではない。",
  },
  {
    id: "china",
    org: "中国商務部・税関総署",
    date: "2025年4月4日",
    period: "公告第18号の制度例",
    kind: "政策原文",
    topic: "供給網",
    title:
      "Export Control on Certain Medium and Heavy Rare Earth Related Items",
    url: "https://english.mofcom.gov.cn/Policies/AnnouncementsOrders/art/2025/art_0dd87cbee7b045bf93fabe6ab2faceee.html",
    finding: "指定された中・重希土類関連品目に輸出許可を求めた公告。",
    limit:
      "全面禁輸という意味ではない。2026年の現行規制一覧として扱わず、実務には追加公告の確認が必要。",
  },
  {
    id: "population",
    org: "総務省統計局",
    date: "2025年4月14日公表",
    period: "2024年10月1日推計",
    kind: "公的統計",
    topic: "日本",
    title: "人口推計（2024年）",
    url: "https://www.stat.go.jp/data/jinsui/2024np/index.htm",
    finding: "総人口1億2,380万2千人、65歳以上29.3%。",
    limit:
      "人口と労働力人口は異なる。女性・高齢者の参加や移民を考慮せず労働力の減少へ直結させない。",
  },
  {
    id: "meti",
    org: "経済産業省",
    date: "2025年",
    period: "2040年の就業構造シナリオ",
    kind: "政策シナリオ",
    topic: "日本",
    title: "Estimation of the Employment Structure in 2040",
    url: "https://www.meti.go.jp/english/policy/economy/industrial_council/pdf/250603008_03.pdf",
    finding: "AI・ロボットの利活用とスキル形成を将来の労働需給に結び付ける。",
    limit:
      "政策前提を置く推計。いま観測された不足人数や確定した将来値ではない。",
  },
];
export const getSource = (id: string) => sources.find((s) => s.id === id)!;
