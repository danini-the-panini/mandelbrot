struct Uniforms {
  width: f32,
  height: f32,
  zoom: f32,
  iterations: u32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>
}

@vertex
fn vertex_main(@builtin(vertex_index) idx : u32) -> VSOut {
  var data = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(1.0, 1.0),

    vec2<f32>(-1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, 1.0),
  );

  var pos = data[idx];

  var out : VSOut;
  out.pos = vec4<f32>(pos, 0.0, 1.0);
  out.uv.x = (pos.x + 1.0) / 2.0;
  out.uv.y = (1.0 - pos.y) / 2.0;

  return out;
}

@fragment
fn fragment_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let coord = vec2(uv.x * uniforms.width, uv.y * uniforms.height);

  var zx = 0.0;
  var zy = 0.0;
  let cX = (coord.x - uniforms.width / 2.0) / uniforms.zoom;
  let cY = (coord.y - uniforms.height / 2.0) / uniforms.zoom;

  var iter = uniforms.iterations;

  while (zx * zx + zy * zy < 4.0 && iter > 0u) {
    let tmp = zx * zx - zy * zy + cX;
    zy = 2.0 * zx * zy + cY;
    zx = tmp;
    iter--;
  }

  let rgb = iter | (iter << 8u);

  let a = (rgb >> 16u) & 0xFFu;
  let b = (rgb >> 8u) & 0xFFu;
  let c = rgb & 0xFFu;

  return vec4<f32>(f32(a) / 255.0, f32(c) / 255.0, f32(b) / 255.0, 1.0);
}
