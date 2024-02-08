precision mediump float;

uniform float iTime;
varying vec2 vUv;

void main() {
  /**
   * 获取 uv
   * 概念：画布上所有像素坐标的归一化后的坐标位置。在 glsl 小于 0 得到结果还是 0，大于 1 还是 1。
   * - U：水平方向，左 0.0 -> 右 1.0
   * - V：垂直方向坐标，下 0.0 -> 上 1.0
   */
  vec2 uv = vUv;
  gl_FragColor = vec4(uv, 0.0, 1.0);
}
