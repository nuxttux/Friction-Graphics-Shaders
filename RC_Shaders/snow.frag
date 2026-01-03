// Snow Shader for Friction RC2
// Multi-layer, continuous falling flakes with randomness + angle control

// Snow Shader for Friction RC2 (Clean, Compatible)
// Multi-layer, continuous falling flakes with randomness + angle control

#version 330 core

layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex;

// Friction supplies these as floats; converted to usable forms
uniform float iTime;
uniform float density;     // as float, cast to int
uniform float speed;
uniform float size;
uniform float softness;
uniform float wind;
uniform float angle;

uniform vec2 resolution;

// REQUIRED BY FRICTION: sampler2D *must* be sampled at least once
// even if we overwrite color later.
vec4 _dummySample() {
    return texture(tex, vec2(0.0));
}

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

vec2 flakePosition(float fi, float layer, float time) {
    float rx = rand(fi * 12.34 + layer * 7.89);
    float ry = rand(fi * 56.78 + layer * 3.21);

    float speedVar = 0.7 + 0.6 * rand(fi * 91.11);

    vec2 fall = vec2(0.0, 1.0);

    mat2 rot = mat2(cos(angle), -sin(angle),
                    sin(angle),  cos(angle));

    fall = rot * fall;

    vec2 offset = fall * time * speed * resolution.y *
                  (0.3 + 0.7 * layer) * speedVar;

    vec2 pos = vec2(rx * resolution.x, ry * resolution.y);

    float drift = sin(time * 0.5 + fi) * wind * resolution.x *
                  (0.3 + 0.7 * layer);

    pos.x += drift;

    pos = mod(pos + offset, resolution);

    return pos;
}

void main(void) {

    // mandatory texture sample so tex is considered "used"
    _dummySample();

    vec4 base = texture(tex, texCoord);

    vec2 uv = texCoord * resolution;

    float alpha = 0.0;

    int total = int(density);
    int flakesPerLayer = total / 3;
    float t = iTime;

    for (int layer = 0; layer < 3; layer++) {
        for (int i = 0; i < 200; i++) {
            if (i >= flakesPerLayer) break;

            float fi = float(i + layer * 1000);
            vec2 flakePos = flakePosition(fi, float(layer), t);

            float flakeSize = size * (0.5 + 0.8 * float(layer));

            float d = length(uv - flakePos);

            float a = smoothstep(flakeSize * resolution.y,
                                 flakeSize * resolution.y - softness * resolution.y,
                                 d);

            alpha += a;
        }
    }

    alpha = clamp(alpha, 0.0, 1.0);

    // white snow; background stays dark (user can Screen blend)
    vec3 snow = vec3(1.0) * alpha;

    fragColor = vec4(base.rgb + snow, 1.0);
}

