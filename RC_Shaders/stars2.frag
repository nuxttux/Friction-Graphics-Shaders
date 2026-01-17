// Stars V2

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
uniform vec2 scenePos;
in vec2 texCoord;

uniform float iTime;
uniform float Speed;
uniform float Density;
uniform float Brightness;
uniform float Seed;

#define PI 3.141592
#define EPS 1e-4

float time = iTime * 0.08 * Speed;

/* ---------- Stable hash ---------- */
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/* ---------- Smooth noise ---------- */
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/* ---------- Fractal motion noise ---------- */
float movingNoise(vec2 p) {
    float n = 0.0;
    float amp = 1.0;
    float sum = 0.0;

    for (int i = 0; i < 3; i++) {
        n += noise(p + time) * amp;
        sum += amp;
        p *= 2.0;
        amp *= 0.5;
    }
    return n / sum;
}

/* ---------- Safe star field ---------- */
float Stars(vec3 p) {
    p += vec3(1.35, 1.54, 1.23);
    p *= 0.3;

    for (int i = 0; i < 16; i++) {
        p = abs(p);
        float d = max(dot(p, p), EPS);
        p /= d;
        p -= vec3(Seed * 0.09);
    }

    float s = length(p);
    s = pow(s, 1.3 * Brightness);
    return s * 0.004 * (Density + 0.75);
}

void main() {
    /* Aspect-correct UV */
    vec2 uv = texCoord;
    uv = (uv - 0.5) * vec2(scenePos.x / scenePos.y, 1.0) + 0.5;

    vec3 dir = normalize(vec3((uv - 0.5) * 0.8, 1.0));

    float stars = Stars(dir * 10.0);
    stars = max(stars, 0.0);

    /* Stable noise mask */
    float n = movingNoise(uv * 120.0);
    n = smoothstep(0.35, 0.85, n);

    vec3 col = vec3(stars * n);

    fragColor = vec4(col, texture(tex, texCoord).a);
}

