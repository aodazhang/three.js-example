precision mediump float;

uniform sampler2D uDiffuse;
uniform float uBrightness;// 亮度
uniform float uContrast;// 对比度
uniform float uSaturation;// 饱和度
varying vec2 vUv;

mat4 brightnessMatrix(float brightness){
  return mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    brightness,brightness,brightness,1
  );
}

mat4 contrastMatrix(float contrast){
  float t=(1.-contrast)/2.;
  return mat4(
    contrast,0,0,0,
    0,contrast,0,0,
    0,0,contrast,0,
    t,t,t,1
  );
}

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
  vec4 color=texture2D(uDiffuse,vUv);// 获取纹理颜色
  gl_FragColor=brightnessMatrix(uBrightness)*contrastMatrix(uContrast)*saturationMatrix(uSaturation)*color;
}
