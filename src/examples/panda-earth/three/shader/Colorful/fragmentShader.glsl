precision mediump float;

uniform sampler2D uDiffuse;// 渲染纹理
uniform float uBrightness;// 亮度
uniform float uContrast;// 对比度
uniform float uSaturation;// 饱和度
varying vec2 vUv;

/**
* 亮度矩阵
* @param brightness 亮度，范围 0.0~1.0
* @returns 亮度矩阵
*/
mat4 brightnessMatrix(float brightness){
  return mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    brightness,brightness,brightness,1
  );
}

/**
* 对比度矩阵
* @param contrast 对比度，设置为 1.5 时对比度增加 50%
* @returns 对比度矩阵
*/
mat4 contrastMatrix(float contrast){
  float t=(1.-contrast)/2.;
  return mat4(
    contrast,0,0,0,
    0,contrast,0,0,
    0,0,contrast,0,
    t,t,t,1
  );
}

/**
* 饱和度矩阵
* @param saturation 饱和度
* @returns 饱和度矩阵
*/
mat4 saturationMatrix(float saturation){
  vec3 luminance=vec3(.3086,.6094,.0820);
  
  float oneMinusSat=1.-saturation;
  
  vec3 red=vec3(luminance.x*oneMinusSat);
  red+=vec3(saturation,0,0);
  
  vec3 green=vec3(luminance.y*oneMinusSat);
  green+=vec3(0,saturation,0);
  
  vec3 blue=vec3(luminance.z*oneMinusSat);
  blue+=vec3(0,0,saturation);
  
  return mat4(
    red,0,
    green,0,
    blue,0,
    0,0,0,1
  );
}

void main(){
  // 获取纹理颜色
  vec4 color=texture2D(uDiffuse,vUv);
  // 最终输出颜色向量 = 亮度矩阵 x 对比度矩阵 x 饱和度矩阵 x 颜色向量
  gl_FragColor=brightnessMatrix(uBrightness)*contrastMatrix(uContrast)*saturationMatrix(uSaturation)*color;
}
