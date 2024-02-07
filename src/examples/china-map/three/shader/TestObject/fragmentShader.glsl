precision mediump float;

uniform float iTime;
varying vec2 vUv;

void main(){
  vec2 uv=vUv;
  gl_FragColor=vec4(uv,0.,1.);
}
