#version 300 es

precision highp float;

in vec2 vPosition;

uniform vec2 center;
uniform vec2 rectangle;
uniform int iterations;

out vec4 color;

void main() {
  float cX = center.x + vPosition.x * rectangle.x;
  float cY = center.y + vPosition.y * rectangle.y;
  float zx = cX;
  float zy = cY;

  int iter = iterations;

  while (zx * zx + zy * zy < 4.0 && iter > 0) {
    float tmp = zx * zx - zy * zy + cX;
    zy = 2.0 * zx * zy + cY;
    zx = tmp;
    iter--;
  }

  int rgb = iter | (iter << 8);

  int a = (rgb >> 16) & 0xFF;
  int b = (rgb >> 8) & 0xFF;
  int c = rgb & 0xFF;

  color = vec4(float(a) / 255.0, float(c) / 255.0, float(b) / 255.0, 1.0);
}
