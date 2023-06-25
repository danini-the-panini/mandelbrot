#version 300 es

precision highp float;

uniform int width;
uniform int height;

const float zoom = 150.0;
const int iterations = 570;

out vec4 color;

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(width, height);

  float zx = 0.0;
  float zy = 0.0;
  float cX = (gl_FragCoord.x - float(width) / 2.0) / zoom;
  float cY = (gl_FragCoord.y - float(height) / 2.0) / zoom;

  int iter = iterations;

  while (zx * zx + zy * zy < 4.0 && iter > 0) {
    float tmp = zx * zx - zy * zy + cX;
    zy = 2.0 * zx * zy + cY;
    zx = tmp;
    iter--;
  }

  int rgb = iter | (iter << 8);

  int r = (rgb >> 16) & 0xFF;
  int g = (rgb >> 8) & 0xFF;
  int b = rgb & 0xFF;

  color = vec4(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0, 1.0);
}
