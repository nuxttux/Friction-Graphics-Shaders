// Snow Shader for Friction RC2
// Multi-layer, continuous falling flakes with randomness + angle control

#version 330 core

layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex;          
uniform float iTime;            

uniform int density;            // base flake count
uniform float speed;            // base fall speed
uniform float size;             // base flake size
uniform float softness;         // edge softness
uniform float wind;             // horizontal sinusoidal drift
uniform float angle;            // fall angle in radians

uniform vec2 resolution;

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

vec2 flakePosition(float fi, float layer, float time) {
    float rx = rand(fi * 12.34 + layer * 7.89);
    float ry = rand(fi * 56.78 + layer * 3.21);

    // random speed variation per flake (±30%)
    float speedVar = 0.7 + 0.6 * rand(fi * 91.11);

    // base fall vector (downward in screen space)
    vec2 fall = vec2(0.0, 1.0);

    // rotate by angle
    mat2 rot = mat2(cos(angle), -sin(angle),
                    sin(angle),  cos(angle));
    fall = rot * fall;

    // apply time * speed * randomness
    vec2 offset = fall * time * speed * resolution.y * (0.3 + 0.7 * layer) * speedVar;

    // initial spawn position
    vec2 pos = vec2(rx * resolution.x, ry * resolution.y);

    // wind drift (sine-wave horizontal offset)
    float drift = sin(time * 0.5 + fi) * wind * resolution.x * (0.3 + 0.7 * layer);
    pos.x += drift;

    // wrap around screen edges
    pos = mod(pos + offset, resolution);

    return pos;
}

void main(void) {
    vec3 base = texture(tex, texCoord).rgb;
    vec2 uv = texCoord * resolution;

    float alpha = 0.0;

    int flakesPerLayer = density / 3;
    float t = iTime;

    for (int layer = 0; layer < 3; layer++) {
        for (int i = 0; i < 200; i++) {
            if (i >= flakesPerLayer) break;

            float fi = float(i + layer * 1000);

            vec2 flakePos = flakePosition(fi, float(layer), t);

            float flakeSize = size * (0.5 + 0.8 * float(layer));
            float d = length(uv - flakePos);

            // circular flake with soft edge
            float a = smoothstep(flakeSize * resolution.y, 
                                 flakeSize * resolution.y - softness * resolution.y, d);

            alpha += a;
        }
    }

    alpha = clamp(alpha, 0.0, 1.0);

    vec3 col = vec3(1.0) * alpha;

    fragColor = vec4(base + col, 1.0);  // black background, use "Screen" blending
}

