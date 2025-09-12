// Procedural Noise / Turbulence
#version 330 core
layout(location = 0) out vec4 fragColor;
in vec2 texCoord;
uniform sampler2D tex; // required by Friction RC2

uniform float time;
uniform float scale;
uniform float speed;
uniform int octaves;
uniform float intensity;

// 2D hash
float hash(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p.x+p.y)*43758.5453123); }

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    float a = hash(i + vec2(0.0,0.0));
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

float fbm(vec2 p){
    float v = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for(int i=0;i<8;i++){
        if(i>=octaves) break;
        v += amp * noise(p * freq + vec2(time * speed * 0.05));
        freq *= 2.0; amp *= 0.5;
    }
    return v;
}

void main(){
    vec2 uv = texCoord * scale;
    float n = fbm(uv);
    vec4 base = texture(tex, texCoord); // required texture sample
    vec3 outc = base.rgb * (1.0 + (n - 0.5) * intensity);
    fragColor = vec4(outc, base.a);
}
