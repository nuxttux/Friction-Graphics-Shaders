// Rim Light (Stable – Artifact Free)
// Friction RC2
#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
uniform vec2 resolution;
in vec2 texCoord;

uniform float intensity;   
uniform float distance;    
uniform float soften;      
uniform float angle;       
uniform float spread;      
uniform vec4 rimColor;     

void main() {
    vec4 base = texture(tex, texCoord);

    // Pass through fully transparent pixels
    if (base.a < 0.001) {
        fragColor = base;
        return;
    }

    // Rim direction
    float rad = radians(angle);
    vec2 dir = vec2(cos(rad), sin(rad));
    vec2 offset = dir * distance / resolution;

    // Core edge detection (alpha only)
    float a0 = base.a;
    float a1 = texture(tex, texCoord + offset).a;
    float diff = max(a0 - a1, 0.0);

    float threshold = 0.02;
    if (diff < threshold) diff = 0.0;

    float rimFactor = clamp(diff * intensity, 0.0, 1.0);

    // Soft rim sampling (alpha-safe)
    int steps = int(soften);
    if (steps > 0) {
        float total = rimFactor;
        float weightSum = 1.0;

        float sigma = float(steps) * 0.5;

        for (int x = -steps; x <= steps; x++) {
            for (int y = -steps; y <= steps; y++) {
                if (x == 0 && y == 0) continue;

                vec2 sampleOffset = vec2(x, y) / resolution;
                vec2 coord = texCoord + offset + sampleOffset;

                // Reject samples outside object or UV bounds
                if (coord.x < 0.0 || coord.y < 0.0 ||
                    coord.x > 1.0 || coord.y > 1.0)
                    continue;

                float a2 = texture(tex, coord).a;
                float d = max(a0 - a2, 0.0);
                if (d < threshold) d = 0.0;

                float f = clamp(d * intensity, 0.0, 1.0);

                float dist = length(vec2(float(x), float(y)));
                float weight = exp(-0.5 * (dist * dist) / (sigma * sigma));
                total += f * weight;
                weightSum += weight;
            }
        }
        rimFactor = total / weightSum;
    }

    // Angular mask
    vec2 centered = texCoord - vec2(0.5);
    float angleToPixel = atan(centered.y, centered.x);
    float diffAng = abs(atan(sin(angleToPixel - rad), cos(angleToPixel - rad)));

    float spreadRad = radians(spread);
    float angularMask = smoothstep(spreadRad, 0.0, diffAng);
    rimFactor *= angularMask;

    rimFactor = clamp(rimFactor, 0.0, 1.0);

    // Apply rim color (no RGB artifacts)
    vec3 rimRGB = rimColor.rgb * rimFactor * rimColor.a;

    // Final alpha includes rim but remains stable
    float outA = base.a + rimFactor * rimColor.a;
    outA = clamp(outA, 0.0, 1.0);

    fragColor = vec4(base.rgb + rimRGB * base.a, outA);
}

