

# Formation Flight Simulator (TypeScript)

TypeScriptとHTML5 Canvasで実装された、自律エージェントによる**編隊飛行（Formation Flight）シミュレーター**です。
操舵行動（Steering Behaviors）のアルゴリズムをベースに、リーダーの移動や旋回に合わせて追従機が動的にフォーメーション（V字編成）を維持する挙動をシミュレートします。
<img width="1053" height="777" alt="スクリーンショット 2026-06-18 144525" src="https://github.com/user-attachments/assets/899479fe-77ba-48b8-a1e7-cb27ff5884f1" />
## 🚀 デモの起動方法

本プロジェクトはビルドツールに [Vite](https://vitejs.dev/) を使用しています。

### 1. 事前準備
PCに [Node.js](https://nodejs.org/) がインストールされていることを確認してください。

### 2. 依存関係のインストール
プロジェクトのルートディレクトリで以下のコマンドを実行します。
```bash
npm install
3. ローカルサーバーの起動
以下のコマンドで開発用サーバーが立ち上がります。

Bash
npm run dev
ターミナルに表示されるURL（例: http://localhost:5173/）にブラウザでアクセスしてください。

🎮 操作方法
マウス移動: 赤色のリーダー機がマウスカーソルを追従（到着行動）します。

編隊の維持: 緑色の追従機は、リーダー機の位置と進行方向から計算された「自身の定位置（スロット）」へ自動的に回り込み、滑らかに減速して整列します。

🛠️ 技術的なポイント
1. 操舵行動（Steering Behaviors）の応用
クレイグ・レイノルズ（Craig Reynolds）氏が提唱した自律エージェントの移動アルゴリズムを採用しています。

到着（Arrival）: 目標地点（スロット）に近づくにつれて速度を落とし、オーバーシュート（行き過ぎ）せずにピタッと定位置に収まります。

2. 動的なスロット座標の計算（簡易回転行列）
リーダー機が旋回した際、編隊の形状が崩れないよう、リーダーの進行方向（Velocity）を基準としたローカル座標系からワールド座標系への変換を行っています。

TypeScript
// リーダーの進行方向と、それに対する右方向の法線ベクトルを抽出
const leaderDir = this.leader.velocity.normalize();
const leaderRight = new Vector2D(-leaderDir.y, leaderDir.x);

// リーダーの向きに合わせてオフセット（相対座標）を回転させ、目標スロットを算出
const slotX = this.leader.position.x + (leaderRight.x * offset.x) + (leaderDir.x * offset.y);
これにより、三角関数（Math.sin/Math.cos）を毎フレーム多用することなく、軽量に編隊の回転を処理しています。

📂 構成ファイルのカスタマイズ
編隊の形状を変更したい場合は、src/main.ts 内の FormationSimulator クラスにある formationOffsets の数値を調整してください。

TypeScript
// 現在の設定（V字編成）
private formationOffsets: Vector2D[] = [
    new Vector2D(-40, 40),  // 左後方1
    new Vector2D(40, 40),   // 右後方1
    new Vector2D(-80, 80),  // 左後方2
    new Vector2D(80, 80),   // 右後方2
];
並列（アブレスト）に変える場合: new Vector2D(-40, 0), new Vector2D(40, 0) のようにY軸（縦軸）を0にします。

直列（トレイル）に変える場合: new Vector2D(0, 40), new Vector2D(0, 80) のようにX軸（横軸）を0にします。

📝 ライセンス
MIT License
