struct Uniforms {
  center: vec2<f32>,
  rectangle: vec2<f32>,
  iterations: u32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) vpos: vec2<f32>
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
  out.vpos = pos;

  return out;
}

@fragment
fn fragment_main(@location(0) vpos: vec2<f32>) -> @location(0) vec4<f32> {
  let coord = uniforms.center + vpos * uniforms.rectangle;

  let cX = coord.x;
  let cY = coord.y;
  var zx = cX;
  var zy = cY;

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
