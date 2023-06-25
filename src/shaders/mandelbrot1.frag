precision highp float;

uniform int width;
uniform int height;

const float zoom = 150.0;
const int iterations = 570;

// bitwise operations from: https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a

int OR(int n1, int n2){

    float v1 = float(n1);
    float v2 = float(n2);
    
    int byteVal = 1;
    int result = 0;
    
    for(int i = 0; i < 32; i++){
        bool keepGoing = v1>0.0 || v2 > 0.0;
        if(keepGoing){
            
            bool addOn = mod(v1, 2.0) > 0.0 || mod(v2, 2.0) > 0.0;
            
            if(addOn){
                result += byteVal;
            }
            
            v1 = floor(v1 / 2.0);
            v2 = floor(v2 / 2.0);
            
            byteVal *= 2;
        } else {
            return result;
        }
    }
    return result;
}

int AND(int n1, int n2){
    
    float v1 = float(n1);
    float v2 = float(n2);
    
    int byteVal = 1;
    int result = 0;
    
    for(int i = 0; i < 32; i++){
        bool keepGoing = v1>0.0 || v2 > 0.0;
        if(keepGoing){
            
            bool addOn = mod(v1, 2.0) > 0.0 && mod(v2, 2.0) > 0.0;
            
            if(addOn){
                result += byteVal;
            }
            
            v1 = floor(v1 / 2.0);
            v2 = floor(v2 / 2.0);
            byteVal *= 2;
        } else {
            return result;
        }
    }
    return result;
}

int RShift(int num, float shifts){
    return int(floor(float(num) / pow(2.0, shifts)));
}

int LShift(int num, float shifts){
    return int(floor(float(num) * pow(2.0, shifts)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(width, height);

  float zx = 0.0;
  float zy = 0.0;
  float cX = (gl_FragCoord.x - float(width) / 2.0) / zoom;
  float cY = (gl_FragCoord.y - float(height) / 2.0) / zoom;

  int iter = iterations;

  for (int i = 0; i < iterations; i++) {
    if (zx * zx + zy * zy < 4.0 && iter > 0) {
      float tmp = zx * zx - zy * zy + cX;
      zy = 2.0 * zx * zy + cY;
      zx = tmp;
      iter--;
    } else {
      break;
    }
  }

  int rgb = OR(iter, LShift(iter, 8.0));

  int r = AND(RShift(rgb, 16.0), 0xFF);
  int g = AND(RShift(rgb, 8.0), 0xFF);
  int b = AND(rgb, 0xFF);

  gl_FragColor = vec4(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0, 1.0);
}
