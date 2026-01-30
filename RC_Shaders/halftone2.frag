//Halftone V2
// Halftone Dot Shader – Blend & Shape Modes
// Friction Graphics RC3
#version 330 core

layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Controls
uniform float dotSize;
uniform float contrast;
uniform float angle;
uniform vec3 dotColor;
uniform float dotOpacity;
uniform float invert;

uniform int shapeMode;   // 0 circle, 1 square, 2 line
uniform int blendMode;   // 0 normal, 1 multiply, 2 screen, 3 overlay

vec2 rotate2D(vec2 p, float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c) * p;
}

// Blend modes
vec3 blend(vec3 base, vec3 blend, int mode)
{
    if (mode == 1)       // Multiply
        return base * blend;
    else if (mode == 2)  // Screen
        return 1.0 - (1.0 - base) * (1.0 - blend);
    else if (mode == 3)  // Overlay
        return mix(
            2.0 * base * blend,
            1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
            step(0.5, base)
        );
    return blend;        // Normal
}

void main()
{
    vec4 src = texture(tex, texCoord);

    // Luminance
    float lum = dot(src.rgb, vec3(0.299, 0.587, 0.114));
    lum = pow(lum, contrast);
    if (invert > 0.5)
        lum = 1.0 - lum;

    // Pixel space
    vec2 resolution = vec2(textureSize(tex, 0));
    vec2 pixelPos = texCoord * resolution;

    // Rotate screen
    vec2 center = resolution * 0.5;
    vec2 rotated = rotate2D(pixelPos - center, radians(angle)) + center;

    // Cell
    vec2 cell = mod(rotated, dotSize) - dotSize * 0.5;

    float mask = 0.0;
    float radius = lum * (dotSize * 0.5);

    // Shape modes
    if (shapeMode == 0) {
        // Circle
        float dist = length(cell);
        mask = smoothstep(radius, radius - 1.0, dist);
    }
    else if (shapeMode == 1) {
        // Square
        float d = max(abs(cell.x), abs(cell.y));
        mask = smoothstep(radius, radius - 1.0, d);
    }
    else if (shapeMode == 2) {
        // Line
        float d = abs(cell.y);
        mask = smoothstep(radius, radius - 1.0, d);
    }

    float dotAlpha = mask * dotOpacity;

    // Blend dots over image
    vec3 blended = blend(src.rgb, dotColor, blendMode);
    vec3 outColor = mix(src.rgb, blended, dotAlpha);

    fragColor = vec4(outColor, src.a);
}

