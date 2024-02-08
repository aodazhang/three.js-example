// 引入 lygia 的柏林噪声函数
#include "/node_modules/lygia/generative/cnoise.glsl"

uniform float iTime;
uniform float uDistort;
varying vec2 vUv;

vec3 distort(vec3 p) {
  float noise = cnoise(p + iTime);
  p += noise * normal * uDistort;
  return p;
}

void main() {
  /**
  * Three.js 传递变量（可不声明直接使用）
  * - attribute vec3 position：顶点坐标
  * - attribute vec3 normal：顶点法向量
  * - attribute vec2 uv：顶点 uv 坐标
  * - uniform mat4 modelViewMatrix：模型视图矩阵 = 视图矩阵 x 模型矩阵
  *   - uniform mat4 modelMatrix：模型矩阵
  *   - uniform mat4 viewMatrix：视图矩阵
  * - uniform mat4 projectionMatrix：投影矩阵
  * - uniform vec3 cameraPosition：相机坐标
  * - uniform bool isOrthographic：是否正交投影相机
  * - uniform mat3 normalMatrix：法线矩阵，用于将顶点着色器的法向量转换为相机空间中的法向量
  */
  gl_Position = projectionMatrix * modelViewMatrix * vec4(distort(position), 1.0);

  vUv = uv;
}