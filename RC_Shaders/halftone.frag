//Halftone
// Halftone Dot Shader (Overlay)
// Friction Graphics RC3
#version 330 core

layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Parameters
uniform float dotSize;
uniform float contrast;
uniform float angle;
uniform vec3 dotColor;
uniform float dotOpacity;
uniform float invert;

vec2 rotate2D(vec2 p, float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c) * p;
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

    // Dot grid
    vec2 cell = mod(rotated, dotSize) - dotSize * 0.5;
    float dist = length(cell);

    float radius = lum * (dotSize * 0.5);
    float mask = smoothstep(radius, radius - 1.0, dist);

    // Dot color & alpha
    float dotAlpha = mask * dotOpacity;

    // Composite dots OVER source
    vec3 outColor = mix(src.rgb, dotColor, dotAlpha);
    float outAlpha = src.a;

    fragColor = vec4(outColor, outAlpha);
}

