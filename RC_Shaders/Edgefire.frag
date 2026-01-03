// Edge-Emission Flame Shader

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

uniform float iTime;
uniform float SIZE;
uniform int ITER;

uniform float flameSpeed;
uniform float flameIntensity;

// --------------------------------------------------

float hash(vec2 p)
{
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float noise(vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1));
    float d = hash(i + vec2(1,1));

    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

vec3 fireColor(float t)
{
    t = clamp(t, 0.0, 1.0);

    if (t < 0.33)
        return mix(vec3(0.4,0.0,0.0), vec3(1.0,0.3,0.0), t/0.33);
    else if (t < 0.66)
        return mix(vec3(1.0,0.3,0.0), vec3(1.0,0.8,0.2), (t-0.33)/0.33);
    else
        return mix(vec3(1.0,0.8,0.2), vec3(1.0,1.0,0.9), (t-0.66)/0.34);
}

void main()
{
    vec4 base = texture(tex, texCoord);
    float alpha = base.a;

    float radius = SIZE / 1000.0;
    float time = iTime * flameSpeed;

    vec3 flameColorAccum = vec3(0.0);
    float flameMask = 0.0;

    for (int i = 0; i < ITER; i++)
    {
        float fi = float(i);
        float h = hash(texCoord + fi);

        float y = h * radius;

        // Oscillating curl (fire motion)
        float wave =
            sin(time * 2.0 + h * 6.2831) *
            cos(time * 1.3 + texCoord.y * 12.0);

        vec2 offset;
        offset.x = wave * radius * 0.4;
        offset.y = -y;

        vec2 suv = texCoord + offset;

        float a = texture(tex, suv).a;

        float body = smoothstep(radius, 0.0, y);

        float flicker = noise(vec2(texCoord.x * 6.0,
                                   y * 8.0 + time));

        float f = a * body * flicker;

        if (f > 0.001)
        {
            flameColorAccum += fireColor(f) * f;
            flameMask += f;
        }
    }

    flameMask = clamp(flameMask * flameIntensity, 0.0, 1.0);

    vec3 flameColor = flameColorAccum / max(flameMask, 0.0001);

    // CORRECT COMPOSITING (NO BOX)
    vec3 finalRGB = mix(base.rgb, flameColor, flameMask);
    float finalA = max(alpha, flameMask);

    fragColor = vec4(finalRGB, finalA);
}

