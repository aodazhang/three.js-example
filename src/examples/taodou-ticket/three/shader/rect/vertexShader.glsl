varying vec2 vUv;

void main(){
  /**
  * Three.js 传递变量（可不声明直接使用）
  * - attribute vec3 position：顶点坐标
  * - attribute vec3 normal：顶点法向量
  * - attribute vec2 uv：顶点 uv 坐标
  * - vec3 cameraPosition：相机坐标
  * - mat4 modelViewMatrix：模型视图矩阵 = 视图矩阵 x 模型矩阵
  *   - mat4 modelMatrix：模型矩阵
  *   - mat4 viewMatrix：视图矩阵
  * - mat4 projectionMatrix：投影矩阵
  */
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  
  vUv=uv;
}
