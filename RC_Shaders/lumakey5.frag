// Lumakey V5 + Edge Blur
// Friction Graphics RC3

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Thresholds
uniform float loc;
uniform float hic;

// Feathering
uniform float smoothLow;
uniform float smoothHigh;

// Matte shaping
uniform float edgeBias;

// Spill
uniform float spill;

// Channel-weighted luma
uniform float wR;
uniform float wG;
uniform float wB;

// Temporal stability
uniform float stability;

// Edge blur
uniform float edgeBlur;   // 0–10

// Options
uniform int invert;
uniform int premultiply;

// Gamma-correct weighted luma
float weightedLuma(vec3 c, vec3 w)
{
    c = pow(c, vec3(2.2));
    float y = dot(c, w);
    return pow(y, 1.0 / 2.2);
}

void main(void)
{
    vec4 col = texture(tex, texCoord);

    // Normalize channel weights
    vec3 w = vec3(wR, wG, wB) / 100.0;
    w /= max(dot(w, vec3(1.0)), 0.0001);

    float luma = weightedLuma(col.rgb, w);

    float lo = loc / 100.0;
    float hi = hic / 100.0;

    float sLo = smoothLow  / 100.0;
    float sHi = smoothHigh / 100.0;

    float bias = edgeBias / 100.0;
    lo = clamp(lo + bias, 0.0, 1.0);
    hi = clamp(hi + bias, 0.0, 1.0);

    // Temporal stability
    float stab = stability / 100.0;
    float lumaDamped = mix(luma, smoothstep(lo, hi, luma), stab);

    // Matte
    float aLow  = smoothstep(lo - sLo, lo + sLo, lumaDamped);
    float aHigh = 1.0 - smoothstep(hi - sHi, hi + sHi, lumaDamped);
    float alpha = aLow * aHigh;

    if (invert == 1)
        alpha = 1.0 - alpha;

    // --- RC3 anchor for spill + blur ---
    alpha *= (1.0 + spill * 0.0 + edgeBlur * 0.0);

    // Spill suppression
    float edge = 1.0 - alpha;
    float spillAmt = clamp(spill / 100.0 * edge, 0.0, 1.0);
    float gray = weightedLuma(col.rgb, vec3(0.2126, 0.7152, 0.0722));
    col.rgb = mix(col.rgb, vec3(gray), spillAmt);

    col.a = alpha;

    // --- Edge-only blur ---
    if (edgeBlur > 0.0 && alpha > 0.0 && alpha < 1.0)
    {
        vec2 texel = 1.0 / vec2(textureSize(tex, 0));
        vec4 sum = vec4(0.0);

        sum += texture(tex, texCoord + texel * vec2(-1,  0));
        sum += texture(tex, texCoord + texel * vec2( 1,  0));
        sum += texture(tex, texCoord + texel * vec2( 0, -1));
        sum += texture(tex, texCoord + texel * vec2( 0,  1));

        vec4 blurCol = sum * 0.25;

        // Blend blur only near edges
        float edgeMask = smoothstep(0.0, 1.0, edgeBlur / 10.0);
        col.rgb = mix(col.rgb, blurCol.rgb, edgeMask);
        col.a   = mix(col.a,   blurCol.a,   edgeMask);
    }

    if (premultiply == 1)
        col.rgb *= col.a;

    fragColor = col;
}

