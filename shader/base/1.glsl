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
  
  // 1.纯色
  fragColor=vec4(1.,0.,0.,1.);
  
  // 2.渐变色
  fragColor=vec4(vec3(uv.x),1.);// 左黑、右白
  fragColor=vec4(vec3(uv.y),1.);// 上白、下黑
  fragColor=vec4(uv,0.,1.);// 左上绿、右下红
  fragColor=vec4(uv,1.,1.);// 左上青、右下粉
  
  // 3.判断
  fragColor=vec4(vec3(step(.5,uv.x)),1.);// 左黑、右白
  fragColor=vec4(vec3(step(.5,1.-uv.x)),1.);// 左白、右黑
  
  // 4.重复
  fragColor=vec4(vec3(fract(uv.x*3.)),1.);// 左黑、右白（重复3次）
  fragColor=vec4(vec3(step(.5,fract(uv.x*3.))),1.);// 左黑、右白（重复3次）
}
