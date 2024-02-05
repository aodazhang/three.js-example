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
  
  // 1.混合色
  vec3 color1=vec3(1.,1.,0.);
  vec3 color2=vec3(0.,1.,1.);
  float mixer=step(.5,uv.x);// 块状色
  mixer=uv.x;// 渐变色
  fragColor=vec4(mix(color1,color2,mixer),1.);
  
  // 2.水平重复 + 混合色
  mixer=step(.5,fract(uv.x*3.));// 块状色
  mixer=fract(uv.x*3.);// 渐变色
  fragColor=vec4(mix(color1,color2,mixer),1.);
  
  // 3.圆形 + 混合色
  float dist=length(uv-vec2(.5));
  mixer=step(.25,dist);// 块状色
  mixer=dist;// 渐变色
  fragColor=vec4(mix(color1,color2,mixer),1.);
  
  // 4.水平垂直重复 + 圆形 + 混合色
  dist=length(fract(uv*5.)-vec2(.5));
  mixer=step(.25,dist);// 块状色
  mixer=dist;// 渐变色
  fragColor=vec4(mix(color1,color2,mixer),1.);
  
  // 5.对角线重复 + 混合色
  mixer=step(1.,uv.x+uv.y);// 块状色（uv.x+uv.y 在对角线达到 1.0）
  mixer=(uv.x+uv.y)/2.;// 渐变色（除以 2 让渐变更平滑）
  mixer=1.-(uv.x+uv.y)/2.;// 反向渐变色
  fragColor=vec4(mix(color1,color2,mixer),1.);
  
  // 6.对角线中轴重复 + 混合色
  float mixer1=uv.x+uv.y;// 黄 -> 青
  float mixer2=2.-(uv.x+uv.y);// 青 -> 黄
  mixer=min(mixer1,mixer2);// 取两种混合最小值
  fragColor=vec4(mix(color1,color2,mixer),1.);
}
