// Procedural Noise with Alpha
#version 330 core
layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex; // Must be 'tex' in RC2

// Controls
uniform float time;       // animation
uniform float scale;      // zoom of the noise
uniform float detail;     // number of noise octaves
uniform float contrast;   // contrast adjustment
uniform float intensity;  // overall intensity

// Random / hash function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
}

// 2D Perlin-like noise
float noise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

// Fractal Brownian Motion
float fbm(vec2 uv) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i=0; i<8; i++){
        if(i >= int(detail)) break;
        value += amplitude * noise(uv * frequency + time*0.1);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main(){
    vec2 uv = texCoord * scale;

    float n = fbm(uv);

    // Apply contrast and intensity
    n = pow(clamp(n,0.0,1.0), contrast) * intensity;

    // Sample tex to satisfy RC2
    vec4 original = texture(tex, texCoord);

    // RGB = grayscale noise, Alpha = noise * original alpha
    fragColor = vec4(vec3(n), n * original.a);
}

