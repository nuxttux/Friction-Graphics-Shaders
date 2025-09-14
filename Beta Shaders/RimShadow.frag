// Rim Shadow (Multiply)
#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
uniform vec2 resolution;
in vec2 texCoord;

uniform float intensity;    // shadow darkness multiplier
uniform float distance;     // base offset in pixels
uniform float soften;       // softness radius in pixels
uniform float angle;        // directional shadow (0-360 deg)
uniform vec4 shadowColor;   // shadow color (dark)

void main() {
    vec4 base = texture(tex, texCoord);

    if (base.a < 0.01) {
        fragColor = base;
        return;
    }

    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    vec2 offset = dir * distance / resolution;

    // compute shadow factor: positive when neighboring alpha is less than current
    float shadowFactor = clamp((base.a - texture(tex, texCoord + offset).a) * intensity, 0.0, 1.0);

    // softened shadow
    int steps = int(max(1.0, soften));
    if (steps > 0) {
        float total = shadowFactor;
        float weightSum = 1.0;

        for (int x = -steps; x <= steps; x++) {
            for (int y = -steps; y <= steps; y++) {
                if (x == 0 && y == 0) continue;
                vec2 sampleOffset = vec2(float(x), float(y)) / resolution;
                vec4 sample = texture(tex, texCoord + offset + sampleOffset);
                float f = clamp((base.a - sample.a) * intensity, 0.0, 1.0);
                float dist = length(vec2(float(x), float(y)));
                float weight = max(0.0, 1.0 - dist / float(steps));
                total += f * weight;
                weightSum += weight;
            }
        }

        shadowFactor = total / weightSum;
    }

    // apply shadow via proper multiply
    vec3 shadow = base.rgb * (1.0 - shadowFactor + shadowFactor * shadowColor.rgb);
    fragColor = vec4(shadow, base.a);
}

