/*
ShaderToy 内置变量（可不声明直接使用）
- vec2 fragCoord：获取基于 Canvas 坐标系的片元坐标（等价于 gl_FragCoord）
- vec4 fragColor：设置片元颜色（等价于 gl_FragColor）
- vec4 iResolution：Cavans 整体大小，一般取 x、y 维度。
- float iTime：Shader 开始执行到现在经过的时间。
- vec2 iMouse：用户鼠标在 Canvas 的坐标。
*/

/*
ShaderToy 片元着色器主函数
- fragColor：输出像素颜色
- fragCoord：输入像素坐标
*/
void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  
  // 1.圆形（SDF 绘制）
  float dist=length(uv-vec2(.5));
  fragColor=vec4(vec3(step(.5,dist)),1.);
  
  // 2.随时间变化半径 + 圆形
  fragColor=vec4(vec3(step(abs(sin(iTime)*.5),dist)),1.);
  
  // 3.水平垂直重复（先重复后居中） + 圆形
  dist=length(fract(uv*5.)-vec2(.5));
  fragColor=vec4(vec3(step(.5,dist)),1.);
  
  // 4.水平垂直重复（先重复后居中） + 随时间变化半径 + 圆形
  dist=length(fract(uv*5.)-vec2(.5));
  fragColor=vec4(vec3(step(abs(sin(iTime)*.5),dist)),1.);
  
  // 5.水平垂直重复（先重复后居中） + 随时间变化半径 + 时间错位 + 圆形
  dist=length(fract(uv*5.)-vec2(.5));
  fragColor=vec4(vec3(step(abs(sin(iTime+uv.x+uv.y)*.5),dist)),1.);
  
  // 6.径向重复（先居中后重复）
  // dist=fract(length(uv-vec2(.5))*5.);// 默认 length(uv-vec2(.5)) 的最大值不是 (0, 0) ~ (1, 1) 而是 (0.5, 0.5) ~ (1, 1)，也就是 √2/2=0.707，因此可以先除以 0.707 再翻倍取小数
  dist=fract(length(uv-vec2(.5))/.707*5.);
  fragColor=vec4(vec3(step(.5,dist)),1.);
  
  // 7.径向重复（先居中后重复） + 随时间变化半径
  dist=fract((length(uv-vec2(.5))/.707+iTime)*5.);
  fragColor=vec4(vec3(step(.5,dist)),1.);
}
