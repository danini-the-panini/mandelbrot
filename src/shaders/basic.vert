#version 300 es

in vec4 position;

out vec2 vPosition;

void main() {
  gl_Position = position;
  vPosition = position.xy;
}
