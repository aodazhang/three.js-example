/*
ShaderToy 内置变量（可不声明直接使用）
- vec2 fragCoord：获取基于 Canvas 坐标系的片元坐标（等价于 gl_FragCoord）
- vec4 fragColor：设置片元颜色（等价于 gl_FragColor）
- vec4 iResolution：Cavans 整体大小，一般取 x、y 维度。
- float iTime：Shader 开始执行到现在经过的时间。
- vec2 iMouse：用户鼠标在 Canvas 的坐标。
*/

float aastep(float threshold, float value) {
  #ifdef GL_OES_standard_derivatives
  float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
  return smoothstep(threshold - afwidth, threshold + afwidth, value);
  #else
  return step(threshold, value);
  #endif
}

/*
ShaderToy 片元着色器主函数
- fragColor：输出像素颜色
- fragCoord：输入像素坐标
*/
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;

  /**
  1.黑白棋盘格
  先用一组非重复的数据验证，得到计算思路如下
  - mask1：
    0   1
    0   1
  - mask2:
    1   1
    0   0
  - mask1 - mask2：
   -1   0
    0   1
  因此对 mask1 - mask2 求绝对值就能得到最基础的棋盘格图形
  */
  // vec3 mask1=vec3(step(0.5,uv.x));
  // vec3 mask2=vec3(step(0.5,uv.y));
  vec3 mask1 = vec3(step(0.5, fract(uv.x * 3.0)));
  vec3 mask2 = vec3(step(0.5, fract(uv.y * 3.0)));
  vec3 color = abs(mask1 - mask2);
  fragColor = vec4(color, 1.0);

  // 2.彩色棋盘格
  vec3 color1 = vec3(1.0, 1.0, 0.0);
  vec3 color2 = vec3(0.0, 1.0, 1.0);
  mask1 = vec3(step(0.5, fract(uv.x * 3.0)));
  mask2 = vec3(step(0.5, fract(uv.y * 3.0)));
  vec3 mixer = abs(mask1 - mask2);
  fragColor = vec4(mix(color1, color2, mixer), 1.0);

  // 3.圆环
  float strength = distance(uv, vec2(0.5)) - 0.25;// 获取向量 uv 和 vec2(0.5) 之间的距离
  strength = abs(strength);// 取绝对中让靠近中间的距离变为正数
  strength = aastep(0.01, strength);// 通过限制过渡，形成圆环（这里采用 aastep 代替 step，作用为抗锯齿）
  fragColor = vec4(vec3(strength), 1.0);

  // 4.对角线
  float mixer1 = 1.0 - abs((uv.x + uv.y - 1.0));// uv.x+uv.y-1.0 范围限制在 [-1, 1]，通过绝对值限制为 [1, 1]，在利用 1 - 该值得到对角线效果
  fragColor = vec4(vec3(mixer1), 1.0);
}
