// Rain Shader for Friction
#version 330 core

layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex;
uniform float iTime;
uniform float density;
uniform float speed;
uniform float angle;
uniform float lengthFactor;   // controls streak length
uniform float thickness;      // controls streak thickness

uniform vec2 resolution;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
    vec3 base = texture(tex, texCoord).rgb;

    // normalized UV
    vec2 uv = (texCoord * resolution) / resolution.y;

    // rotate UV by angle
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 uvr = rot * uv;

    // tile space into "density" cells
    float drops = density;
    vec2 id = floor(uvr * drops);
    
    // per-drop randomness
    float rnd = rand(id);
    float brightness = 0.5 + rnd * 0.5;       // vary brightness
    float len = mix(0.3, lengthFactor, rnd);  // vary streak length
    float thick = mix(0.01, thickness, rnd);  // vary streak thickness

    // add small random horizontal jitter inside cell
    vec2 jitter = vec2(rand(id + 0.1) - 0.5, rand(id + 0.2) - 0.5) * 0.3;
    vec2 gv = fract(uvr * drops) - 0.5 + jitter;

    // vertical position with additional small randomness
    float y = fract(iTime * speed + rnd + rand(id + 0.3) * 0.5);

    // raindrop streak shape
    float d = abs(gv.x);
    float drop = smoothstep(thick, 0.0, d) * smoothstep(len, 0.0, abs(gv.y - y));

    vec3 col = base + vec3(drop * brightness);
    fragColor = vec4(col, 1.0);
}

