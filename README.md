# こんにちは🌐 3D halftone gen (alpha)です

## About
* 立体ハーフトーンパターンのようなものをイラレでつくるスクリプトです
* 個人制作のalpha版です。問題や不具合があればお知らせ下さい
* 2D版はこちら → [halftone gen](https://github.com/ykwe/halftone_gen/)

## 使い方
* [3d_halftone_gen.jsx](3d_halftone_gen.jsx) をダウンロードし、イラレのスクリプトとして開いてください

## 作例


<img width="550" height="916" alt="1" src="https://github.com/user-attachments/assets/c1da3eb6-ad48-4be3-b53c-c775d20a1782" />
<img width="550" height="916" alt="1" src="https://github.com/user-attachments/assets/6a407236-1ab5-4e82-a5b5-8aca89ad8679" />
<img width="550" height="916" alt="1" src="https://github.com/user-attachments/assets/da41fd6e-2f8a-4555-9fa8-7796ad4a951e" />

## 設定項目

<img width="482" height="916" alt="スクリーンショット 2025-12-31 1 24 05" src="https://github.com/user-attachments/assets/d2e12190-650e-4b16-9ac1-8d16afe1ca90" />

#### ドット個数
* 縦、横、奥行きのドット個数を指定します
#### 出力モード
* 全てのドットを出力するか、面のみにするか、フレームのみにするかを指定します
* 全て出力 / 面のみ出力では、フレーム表示のオンオフを選べます
* 面の状態は透過 / 不透過から選べます
#### シェイプ設定
* ドット形状を丸 / 四角 / テキストから指定します
* テキストを選択した場合には、リピートして使うか / ランダムに1文字を選ぶかを選べます
* リピートの場合は、開始位置（どの頂点からか）と埋める順序（どちら側に進むか）を選べます
  
<img width="482" height="262" alt="スクリーンショット 2025-12-31 1 24 07" src="https://github.com/user-attachments/assets/9b01fe60-65a5-4697-b5a4-1e06cdafb08e" />

#### オブジェクト回転
* オブジェクト（立方体や直方体）の回転を指定します
* X / Y / Zのそれぞれの軸を中心とした任意の回転角度を指定します
#### カメラ
* オブジェクトと視点（カメラ）の距離を指定します
* 距離が近いとパースが強くかかり、距離が遠いと平行投影っぽくなりなります
#### 効果
* グラデーション / ライティングの効果を選択します
* グラデーションの場合、ドットのサイズを一定方向で徐々に変化させます
* ライティングの場合、光源による各面の明るさに応じてドットのサイズを変化させます
* 双方とも、方向（水平の角度 / 垂直の角度）と、最大・最小の濃度を指定します
  
<img width="482" height="132" alt="スクリーンショット 2025-12-31 1 24 14" src="https://github.com/user-attachments/assets/78f8a443-6fb4-40a0-a7e7-cf971fc1af61" />

#### 設定値を出力
* 設定項目をテキストとして生成します
* 一度出力したドットパターンを再現したいときに便利です
