// Wobble / Displacement
#version 330 core
layout(location = 0) out vec4 fragColor;
in vec2 texCoord;
uniform sampler2D tex; // required by Friction RC2

uniform float amplitude;
uniform float frequency;
uniform float time;
// NOTE: speed is intentionally NOT declared here to reproduce the GRE/FRAG mismatch error

void main(){
    vec2 uv = texCoord;
    float w = sin((uv.y + time * 0.01) * frequency + uv.x * 3.14159) * 0.5;
    float w2 = cos((uv.x - time * 0.01) * frequency + uv.y * 2.1) * 0.5;
    vec2 off = vec2(w, w2) * amplitude / vec2(textureSize(tex,0));
    vec4 c = texture(tex, uv + off); // required sample
    fragColor = c;
}
