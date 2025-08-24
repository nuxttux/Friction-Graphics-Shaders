// Rim Light
#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
uniform vec2 resolution;
in vec2 texCoord;

uniform float intensity;    // rim brightness
uniform float distance;     // base offset in pixels
uniform float soften;       // softness radius in pixels
uniform float angle;        // directional highlight (0-360 deg)
uniform vec4 rimColor;      // rim light color

void main() {
    vec4 base = texture(tex, texCoord);

    // Skip transparent areas
    if (base.a < 0.01) {
        fragColor = base;
        return;
    }

    // Direction vector for highlight
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    vec2 offset = dir * distance / resolution;

    // Initialize rim factor
    float rimFactor = clamp((base.a - texture(tex, texCoord + offset).a) * intensity, 0.0, 1.0);

    // Softened rim: sample a small 2D kernel around the offset
    int steps = int(max(1.0, soften)); // number of steps based on soften slider
    if (steps > 0) {
        float total = rimFactor;
        float weightSum = 1.0;

        for (int x = -steps; x <= steps; x++) {
            for (int y = -steps; y <= steps; y++) {
                if (x == 0 && y == 0) continue; // skip center, already included
                vec2 sampleOffset = vec2(x, y) / resolution;
                vec4 sample = texture(tex, texCoord + offset + sampleOffset);
                float f = clamp((base.a - sample.a) * intensity, 0.0, 1.0);

                // radial falloff
                float dist = length(vec2(float(x), float(y)));
                float weight = max(0.0, 1.0 - dist / float(steps));
                total += f * weight;
                weightSum += weight;
            }
        }

        rimFactor = total / weightSum;
    }

    vec3 rim = rimFactor * rimColor.rgb;
    fragColor = vec4(base.rgb + rim, base.a);
}

