import { Link } from "react-router-dom";
import { SourceLink } from "./SourceLink";
const actions = [
  [
    "雇用の入口を守る",
    "新卒・若年・職種別の採用率と求人賃金を四半期で確認。失業率だけで判断しない。",
    "厚生労働・教育・統計部門",
    "高曝露職の採用が、景気と非曝露職を調整しても継続的に弱まる",
    "若手への実務機会、職業訓練、雇用保険の接続を先に改善する。",
  ],
  [
    "実証を、継続稼働へ変える",
    "補助対象を購入台数だけで評価せず、12か月後の稼働・省力化・事故・保守費を追う。",
    "産業・中小企業・地方自治体",
    "実証件数は増えるが、本導入や総費用の改善が伸びない",
    "機器購入に加え、業務設計・データ整備・現場人材を支援する。",
  ],
  [
    "電力の約束を検証する",
    "接続申請、確定接続、通電済み容量を別々に把握する。",
    "エネルギー・インフラ・系統運用者",
    "データセンター完成時期より接続・送電増強が遅れる",
    "設備と系統の工程を合わせ、費用負担と需要過大見積もりを検証する。",
  ],
  [
    "給付の財源を同時に設計する",
    "対象、金額、既存給付との重複、税収、平時に戻す条件を明記する。",
    "財政・税制・社会保障部門",
    "所得減少が長引き、既存制度の対象外の人に集中する",
    "所得補償や税額控除から段階導入し、普遍給付は別途財政試算する。",
  ],
  [
    "供給網の時間を買う",
    "重要部品を原料・精製・磁石・部品・完成品に分け、代替調達の所要月数を測る。",
    "経済安全保障・調達部門",
    "単一供給源の品目で納期が恒常的に延びる",
    "備蓄・代替設計・複線調達を、費用と停止損失で選ぶ。",
  ],
];
export default function Policy() {
  return (
    <div className="page policy">
      <div className="page-heading">
        <div>
          <span className="eyebrow">POLICY BRIEF / 説明の準備資料</span>
          <h1>
            いま決めること。
            <br />
            観測してから決めること。
          </h1>
          <p>技術の到達年を一つに決めなくても、移行への準備は始められます。</p>
        </div>
        <button
          className="button print-button"
          onClick={() => {
            const closed = Array.from(
              document.querySelectorAll("main details"),
            ).filter(
              (d) => !(d as HTMLDetailsElement).open,
            ) as HTMLDetailsElement[];
            closed.forEach((d) => (d.open = true));
            window.print();
            closed.forEach((d) => (d.open = false));
          }}
        >
          ブリーフを印刷 / PDF保存 ↗
        </button>
      </div>
      <section className="brief-lead">
        <span className="eyebrow">会議の冒頭で伝える、三つの要点</span>
        <ol>
          <li>
            <strong>能力の向上は速い。経済への波及は別途検証が必要。</strong>
            <p>
              評価課題の成功、企業の導入、国全体の生産性を分ける。AGIという名前だけで政策を起動しない。
            </p>
          </li>
          <li>
            <strong>雇用の変化は、解雇より前に採用に出る可能性がある。</strong>
            <p>
              若年の入職、非正規契約、職種別賃金、社内移行を追う。失業率の低さだけで安心しない。
            </p>
          </li>
          <li>
            <strong>成長と分配は、それぞれに政策が要る。</strong>
            <p>
              導入基盤を整える政策と、所得・技能・再就職を支える政策を組み合わせる。給付は財源と対で説明する。
            </p>
          </li>
        </ol>
      </section>
      <div className="brief-columns">
        <section>
          <h2>確認できたこと</h2>
          <p>
            ILOの推計では、世界の約4人に1人が生成AIの影響を受けうる職業にいる。ただし、これは失業予測ではない。
            <SourceLink id="ilo" />
          </p>
          <p>
            IEAはデータセンター電力が2025〜2030年にほぼ倍増する中心見通しを示す。接続や設備の制約が普及速度を左右する。
            <SourceLink id="iea" />
          </p>
          <p>
            中国は2024年の産業用ロボット新規設置の約54%を占める。設置先の集中と製造の独占を区別する。
            <SourceLink id="ifr" />
          </p>
        </section>
        <section>
          <h2>まだ決められないこと</h2>
          <p>
            トップ研究者に相当する仕事を、幅広い分野で自律的かつ安定して遂行できる時期。
          </p>
          <p>
            AIが生む新しい仕事と、代替される仕事の純差。研究現場の成果を経済全体に拡張した効果。
          </p>
          <p>
            具体的なUBI導入年、社会不安の発生年、国別の失業率。本サイトの仮定モデルからこれらを断定しない。
          </p>
        </section>
      </div>
      <section className="policy-actions">
        <div className="section-heading">
          <span className="eyebrow">政策提案 / 実証結果ではありません</span>
          <h2>予測が外れても、役に立つ準備。</h2>
        </div>
        {actions.map(([title, measure, owner, trigger, action], i) => (
          <article key={title}>
            <span className="number">0{i + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{measure}</p>
              <dl>
                <div>
                  <dt>関係する部門</dt>
                  <dd>{owner}</dd>
                </div>
                <div>
                  <dt>見直しの合図</dt>
                  <dd>{trigger}</dd>
                </div>
                <div>
                  <dt>検討する対応</dt>
                  <dd>{action}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </section>
      <section className="reading-note">
        <h2>四つの地域で、同じ問いをする。</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>地域</th>
                <th>主な論点（条件付きの見立て）</th>
                <th>先に確認する指標</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>米国</th>
                <td>導入と雇用調整の速さを、再就職と電力が支えられるか。</td>
                <td>職種別採用、失業期間、接続済み電力容量</td>
              </tr>
              <tr>
                <th>日本</th>
                <td>
                  人手不足を補いながら、若手の入口と社内の技能形成を守れるか。
                </td>
                <td>新卒採用、非正規更新、導入後の稼働率</td>
              </tr>
              <tr>
                <th>中国</th>
                <td>
                  製造基盤とAIを結び付け、国内需要と供給網のリスクに対応できるか。
                </td>
                <td>用途別稼働、部品納期、設備投資の収益</td>
              </tr>
              <tr>
                <th>EU</th>
                <td>
                  域内の制度・産業差を越えて、導入と労働移行を両立できるか。
                </td>
                <td>国別導入、技能不足、越境展開の費用</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="questions">
        <h2>説明の場で、聞かれやすいこと。</h2>
        {[
          [
            "「4分の1の仕事がなくなる」のか。",
            "いいえ。ILOの数字は職業が生成AIの影響を受けうる度合いです。導入費用、需要、新しい仕事、人の判断が必要な部分を経て、雇用の純効果が決まります。",
          ],
          [
            "AGIの実現を待って政策を決めればよいか。",
            "採用・技能・電力・供給網への影響は、AGIと呼ばれる前にも起こりえます。名前や到達年より、観測する指標と対応の条件を先に決める方法が有効です。",
          ],
          [
            "AIでGDPが増えれば、UBIの財源は自然にできるか。",
            "GDPは税収ではありません。利益がどこに帰属し、どの税でどれだけ徴収できるかが必要です。給付額×対象人数の総費用から既存給付の置換を引き、増税・歳出変更・国債の別を明示します。",
          ],
          [
            "日本は解雇が少ないから影響も小さいか。",
            "雇用維持は移行の時間を稼ぎます。一方、採用抑制、非更新、賃金や昇進の停滞で調整される可能性があります。企業内の技能形成が進むかどうかが分岐です。",
          ],
          [
            "シミュレータの数値を予算要求の根拠に使えるか。",
            "仕組みと仮定を説明する補助資料には使えますが、実績に適合させた政策効果推計ではありません。実際の予算判断には対象集団、制度、財源、反実仮想を定義した別の推計が必要です。",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <div className="reading-next">
        <div>
          <span className="eyebrow">次の議論へ</span>
          <h2>同じ能力で、政策だけ変えてみる。</h2>
        </div>
        <Link className="button" to="/simulator">
          シミュレータを開く ↗
        </Link>
      </div>
    </div>
  );
}
