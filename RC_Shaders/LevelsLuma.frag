// Luma Levels
// Friction Graphics RC3

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Levels controls (0–100)
uniform float black;
uniform float mid;
uniform float white;

// Perceptual luma (Rec.709, gamma-aware)
float perceptualLuma(vec3 c)
{
    // to linear
    c = pow(c, vec3(2.2));
    float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
    // back to perceptual
    return pow(y, 1.0 / 2.2);
}

void main(void)
{
    vec4 col = texture(tex, texCoord);

    float b = black / 100.0;
    float m = clamp(mid / 100.0, 0.01, 0.99);
    float w = white / 100.0;

    // Prevent invalid ranges
    w = max(w, b + 0.0001);

    // Extract perceptual luma
    float y = perceptualLuma(col.rgb);

    // Normalize between black and white
    float yN = clamp((y - b) / (w - b), 0.0, 1.0);

    // Midtone (gamma) adjustment
    float gamma = log(0.5) / log(m);
    yN = pow(yN, gamma);

    // Re-apply luminance while preserving color ratios
    float eps = 1e-5;
    col.rgb *= (yN / max(y, eps));

    fragColor = col;
}

