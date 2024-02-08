precision mediump float;

uniform float uRatio;
uniform float iTime;
varying vec2 vUv;

vec4 drawRect(in float width, in float height, in float thickness) {

  vec4 color = vec4(0.0);
  vec2 center = vec2(0.5);

  float halfWidth = width * 0.5;
  float halfHeight = height * 0.5;

  vec2 topRight = vec2(center.x + halfWidth, center.y + halfHeight);
  vec2 topRightInner = vec2(center.x + halfWidth - thickness, center.y + halfHeight - thickness);
  vec2 bottomLeft = vec2(center.x - halfWidth, center.y - halfHeight);
  vec2 bottomLeftInner = vec2(center.x - halfWidth + thickness, center.y - halfHeight + thickness);

  if(step(bottomLeft, vUv) == vec2(1.0) && step(topRight, vUv) == vec2(0.0)) {
    color = vec4(1.0);
  }
  if(step(bottomLeftInner, vUv) == vec2(1.0) && step(topRightInner, vUv) == vec2(0.0)) {
    color = vec4(0.0);
  }

  return color;
}

void main() {
  /**
   * 获取 uv
   * 概念：画布上所有像素坐标的归一化后的坐标位置。在 glsl 小于 0 得到结果还是 0，大于 1 还是 1。
   * - U：水平方向，左 0.0 -> 右 1.0
   * - V：垂直方向坐标，下 0.0 -> 上 1.0
   */

  // 1.音频强度变化
  float strength = abs(sin(iTime));

  // 2.矩形数量：根据音频强度变化 0 ~ 5
  int count = int(strength * 5.0);

  // 3.矩形参数
  float width = 0.36;// 矩形宽度
  float gap = 0.06;// 矩形间隔
  float thickness = 0.004;// 边框厚度
  float thicknessIncremental = 0.0005;// 边框厚度递增值
  float ratio = 2.0 / 2.7;// 矩形长宽比

  // 4.绘制矩形
  vec4 color = vec4(0.0);
  for(int i = 0; i < count; i++) {
    color += drawRect(width, width * ratio * uRatio, thickness);
    width += gap * 2.0;
    thickness += thicknessIncremental;
  }

  // 5.着色
  gl_FragColor = color;
}
