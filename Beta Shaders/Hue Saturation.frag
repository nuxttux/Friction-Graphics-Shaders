// Hue Saturation
#version 330 core
layout(location = 0) out vec4 fragColor;

in vec2 texCoord;
uniform sampler2D tex;

// Controls
uniform float hue;        // degrees, -180 .. +180
uniform float saturation; // -1 .. +1
uniform float contrast;   // -1 .. +1
uniform float lightness;  // -1 .. +1

vec3 rgb2hsl(vec3 c) {
    float r = c.r, g = c.g, b = c.b;
    float maxc = max(r, max(g, b));
    float minc = min(r, min(g, b));
    float l = (maxc + minc) * 0.5;
    float h = 0.0;
    float s = 0.0;
    if (maxc != minc) {
        float d = maxc - minc;
        s = (l > 0.5) ? d / (2.0 - maxc - minc) : d / (maxc + minc);
        if (maxc == r) {
            h = (g - b) / d + (g < b ? 6.0 : 0.0);
        } else if (maxc == g) {
            h = (b - r) / d + 2.0;
        } else {
            h = (r - g) / d + 4.0;
        }
        h /= 6.0;
    }
    return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    if (s == 0.0) {
        return vec3(l);
    } else {
        float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
        float p = 2.0 * l - q;
        float r = hue2rgb(p, q, h + 1.0/3.0);
        float g = hue2rgb(p, q, h);
        float b = hue2rgb(p, q, h - 1.0/3.0);
        return vec3(r, g, b);
    }
}

vec3 applyContrast(vec3 col, float c) {
    float scale = 1.0 + c;
    return (col - 0.5) * scale + 0.5;
}

void main() {
    vec4 base = texture(tex, texCoord);

    // skip fully transparent pixels
    if (base.a <= 0.0) {
        fragColor = base;
        return;
    }

    // un-premultiply so color adjustments don’t touch alpha
    vec3 color = base.rgb / base.a;

    vec3 hsl = rgb2hsl(color);
    float hueOffset = hue / 360.0;
    hsl.x = fract(hsl.x + hueOffset);
    hsl.y = clamp(hsl.y * (1.0 + saturation), 0.0, 1.0);
    hsl.z = clamp(hsl.z + lightness, 0.0, 1.0);

    vec3 col = hsl2rgb(hsl);
    col = applyContrast(col, contrast);
    col = clamp(col, 0.0, 1.0);

    // re-premultiply
    col *= base.a;

    fragColor = vec4(col, base.a);
}


