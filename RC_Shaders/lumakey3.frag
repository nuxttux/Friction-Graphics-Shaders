// Lumakey V3
// Friction Graphics RC3

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Thresholds
uniform float loc;          // 0–100
uniform float hic;          // 0–100

// Feathering
uniform float smoothLow;    // 0–100
uniform float smoothHigh;   // 0–100

// Matte shaping
uniform float edgeBias;     // -100 .. 100

// Spill
uniform float spill;        // 0–100

// Options
uniform int invert;
uniform int premultiply;   // 1 = premultiplied, 0 = straight alpha

// Gamma-correct perceptual luma (Rec.709)
float perceptualLuma(vec3 c)
{
    // Convert to linear
    c = pow(c, vec3(2.2));
    float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
    // Back to perceptual space
    return pow(y, 1.0 / 2.2);
}

void main(void)
{
    vec4 col = texture(tex, texCoord);

    float luma = perceptualLuma(col.rgb);

    float lo = loc / 100.0;
    float hi = hic / 100.0;

    float sLo = smoothLow  / 100.0;
    float sHi = smoothHigh / 100.0;

    // Bias shifts edge inward or outward
    float bias = edgeBias / 100.0;
    lo += bias;
    hi += bias;

    lo = clamp(lo, 0.0, 1.0);
    hi = clamp(hi, 0.0, 1.0);

    // Feathered matte
    float aLow  = smoothstep(lo - sLo, lo + sLo, luma);
    float aHigh = 1.0 - smoothstep(hi - sHi, hi + sHi, luma);

    float alpha = aLow * aHigh;

    if (invert == 1)
        alpha = 1.0 - alpha;

    // Spill suppression (edge-weighted desaturation)
    float edge = 1.0 - alpha;
    float spillAmt = clamp(spill / 100.0 * edge, 0.0, 1.0);

    float gray = perceptualLuma(col.rgb);
    col.rgb = mix(col.rgb, vec3(gray), spillAmt);

    col.a = alpha;

    // Output mode
    if (premultiply == 1)
        col.rgb *= col.a;

    fragColor = col;
}

