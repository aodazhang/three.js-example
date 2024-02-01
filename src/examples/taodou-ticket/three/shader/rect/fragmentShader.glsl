precision mediump float;

uniform float uRatio;
uniform float iTime;
/**
* 获取 uv
* 概念：画布上所有像素坐标的归一化后的坐标位置。在glsl小于0得到结果还是0，大于1还是1。
* - U：水平方向，左 0.0 -> 右 1.0
* - V：垂直方向坐标，下 0.0 -> 上 1.0
*/
varying vec2 vUv;

vec4 drawRect(in float width,in float height,in float thickness){
  
  vec4 color=vec4(0.);
  vec2 center=vec2(.5);
  
  float halfWidth=width*.5;
  float halfHeight=height*.5;
  
  vec2 topRight=vec2(center.x+halfWidth,center.y+halfHeight);
  vec2 topRightInner=vec2(center.x+halfWidth-thickness,center.y+halfHeight-thickness);
  vec2 bottomLeft=vec2(center.x-halfWidth,center.y-halfHeight);
  vec2 bottomLeftInner=vec2(center.x-halfWidth+thickness,center.y-halfHeight+thickness);
  
  if(step(bottomLeft,vUv)==vec2(1.)&&step(topRight,vUv)==vec2(0.)){
    color=vec4(1.);
  }
  if(step(bottomLeftInner,vUv)==vec2(1.)&&step(topRightInner,vUv)==vec2(0.)){
    color=vec4(.0);
  }
  
  return color;
}

void main(){
  // 1.音频强度变化
  float strength=abs(sin(iTime));
  // 2.矩形数量：根据音频强度变化 0 ~ 5
  int count=int(strength*5.);
  
  // 3.矩形参数
  float width=.36;// 矩形宽度
  float gap=.06;// 矩形间隔
  float thickness=.004;// 边框厚度
  float thicknessIncremental=.0005;// 边框厚度递增值
  float ratio=2./2.7;// 矩形长宽比
  
  // 4.绘制矩形
  vec4 color=vec4(.0);
  for(int i=0;i<count;i++){
    color+=drawRect(width,width*ratio*uRatio,thickness);
    width+=gap*2.;
    thickness+=thicknessIncremental;
  }
  
  // 5.着色
  gl_FragColor=color;
}
