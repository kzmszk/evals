# 計画書 02: 煙と炎 — Stable Fluids (WebGL2 / GPU)

## ゴール

下部のエミッタから炎が明滅しながら立ち上り、先端が煙に変わって渦を巻く、リアルタイム GPU 流体。
マウスドラッグでかき混ぜ・追加できる。モード切替: 炎 / 煙 / 両方。1080p で 60fps。

## 技術選定

- Jos Stam **"Stable Fluids"**（半ラグランジュ移流＋圧力射影）。無条件安定でリアルタイム向きの定番。
- WebGL2 + `EXT_color_buffer_float`、RGBA16F テクスチャ、各計算パスをフラグメントシェーダで実行、ping-pong FBO。
- 系譜としては Pavel Dobryakov の "WebGL Fluid Simulation" (MIT) と同型だが、本デモは
  **温度・浮力・炎の発色（チャネル別散逸）** を追加する。

## テクスチャ構成

全て RGBA16F。フィルタは LINEAR（`OES_texture_float_linear` が無い環境は NEAREST にフォールバック）。
WRAP は CLAMP_TO_EDGE（これが実質の境界条件になる）。

| テクスチャ | 解像度 | 内容 | ダブルバッファ |
|-----------|--------|------|:---:|
| velocity | sim（短辺 192〜256） | xy = 速度（**sim テクセル/秒**） | ✔ |
| pressure | sim | x = 圧力 | ✔ |
| divergence, curl | sim | x のみ | – |
| dye | 表示解像度（〜1280×720） | **r=煙濃度, g=温度(浮力の源), b=炎エミッション** | ✔ |

## 毎フレームのパス順

1. **curl**: `c = 0.5·((R.y−L.y) − (T.x−B.x))`
2. **vorticity confinement**: `force = ε · 0.5·(|T|−|B|, |R|−|L|) / (|force|+1e-5) × curl`、
   `force.y *= −1`、`vel += force·dt`（ε 既定 25。渦の巻きの強さ＝映像の主役）
3. **buoyancy**: `vel.y += dt·(β·dye.g − κ·dye.r)`（β=浮力 ~45、κ=煙の重さ ~1.0）
4. **divergence**: `0.5·((R.x−L.x) + (T.y−B.y))`
5. **pressure**: 前フレーム値 × 0.8 で初期化（clear シェーダ）→ **Jacobi 24 回**
   `p = (L+R+T+B − div) / 4`
6. **gradient subtract**: `vel −= 0.5·(pR−pL, pT−pB)`
7. **advect velocity**: 散逸 0.15
8. **advect dye**: **チャネル別散逸 vec4(0.35, 1.8, 4.0, 0)** — 煙は残り、熱は中速、炎は速く燃え尽きる

移流シェーダ（共通・肝）:

```glsl
vec2 coord = vUv - uDt * texture(uVel, vUv).xy * uTexel;  // uTexel = sim 格子のテクセルサイズ
o = texture(uSrc, coord) / (1.0 + uDiss * uDt);            // uDiss は vec4
```

dye を移流するときも `uTexel` は **velocity 格子のテクセルサイズ**を渡す（速度の単位が sim テクセル/秒のため）。

## splat（注入）シェーダ

```glsl
vec2 p = vUv - uPoint;  p.x *= uAspect;
o = texture(uTarget, vUv) + exp(-dot(p, p) / uRadius) * uColor;
```

## エミッタと入力

- 底辺 y≈0.02 に固定エミッタ 3 個（x = 0.3, 0.5, 0.7）。毎フレーム:
  - `flicker = 0.5 + 0.5·(sin合成ノイズ)`（周波数・位相をエミッタごとに変える。**明滅が炎らしさの要**）
  - velocity へ上向き splat: `(横揺らぎ, rise·flicker)`、rise ~150 テクセル/秒
  - dye へ splat: `(smoke, heat·flicker, fire·flicker, 0)`
- モード別の注入量:

| モード | smoke | heat | fire | rise |
|--------|-------|------|------|------|
| 🔥 炎  | 0.25 | 9.0 | 3.5 | 160 |
| 💨 煙  | 2.2  | 3.5 | 0   | 80  |
| 🌋 両方 | 1.2  | 7.0 | 2.5 | 130 |

- ポインタ: ドラッグ中、移動 delta(UV) × ~4000 を velocity splat、モード色 × 0.6 を dye splat。

## 表示シェーダ

```glsl
vec4 d = texture(uDye, vUv);
vec3 fire  = fireRamp(d.b);
vec3 smoke = vec3(0.72, 0.76, 0.86) * d.r * 0.32;
vec3 c = smoke + fire;
c = 1.6 * c / (1.0 + c);               // ソフトトーンマップ
c *= vignette(vUv);                     // 弱いビネット
c += dither(gl_FragCoord.xy);           // 1/255 ディザでバンディング軽減
```

fireRamp（t は 1 を超えてよい。黒→暗赤→橙→黄→白）:

```glsl
vec3 c = mix(vec3(0.0), vec3(0.45,0.02,0.0), smoothstep(0.0, 0.3, t));
c = mix(c, vec3(1.0,0.32,0.03), smoothstep(0.25, 0.65, t));
c = mix(c, vec3(1.0,0.85,0.35), smoothstep(0.6, 1.1, t));
c = mix(c, vec3(1.0,0.99,0.9),  smoothstep(1.0, 1.8, t));
```

## UI

モード 3 ボタン（🔥/💨/🌋）、スライダー: 渦強調 ε (0–50)・浮力 β (10–80)・エミッタ強度 (0–2)、
一時停止、クリア（velocity/dye 両バッファを 0 クリア）。FPS 表示。

## 実装手順

1. WebGL2 初期化・拡張チェック（非対応ならエラーメッセージを DOM に表示）、fullscreen quad、FBO ユーティリティ
2. splat + display のみで「マウスで色が置ける」状態を作る
3. 移流＋圧力射影 → かき混ぜて渦が保存されることを確認
4. curl / vorticity / buoyancy → 煙が立ち上る
5. 炎の発色・エミッタ・モード・UI

## 完成判定チェックリスト

- [ ] 起動直後からエミッタの炎が明滅しながら立ち上る
- [ ] 炎の根本は白〜黄、先端へ橙→暗赤→灰色の煙、と遷移して見える
- [ ] マウスでかき混ぜると渦が巻いて煙が引き込まれる
- [ ] 5 分放置で発散も真っ白飽和もしない
- [ ] 1080p で 60fps（内蔵 GPU で可）

## 落とし穴

- `EXT_color_buffer_float` 必須。float の LINEAR フィルタは `OES_texture_float_linear` が必要
  （無ければ NEAREST — dye 解像度が高ければ見た目は許容範囲）。
- **dt は実測フレーム時間を 1/60 でクランプ**。タブ復帰時の巨大 dt で爆発する。
- 散逸をチャネル別（vec4）にしないと「炎が消えない」か「煙まで消える」のどちらかになる。
- 圧力を毎回 0 クリアすると Jacobi 収束が遅く映像がもたつく。前フレーム × 0.8 で初期化。
- splat の aspect 補正（`p.x *= aspect`）を忘れると楕円になる。
- velocity は vorticity パスで ±1000 にクランプしておくと保険になる。
