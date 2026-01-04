// Bend Shader

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Bend controls
uniform float bendAmount;   // -1.0 to 1.0 (negative = opposite bend)
uniform float bendRadius;   // Higher = subtler bend (e.g. 1.0–5.0)
uniform float pivot;        // 0.0–1.0 (center = 0.5)
uniform int bendVertical;   // 0 = horizontal bend, 1 = vertical bend

void main()
{
    vec2 uv = texCoord;

    // Normalize around pivot
    if (bendVertical == 1)
    {
        float offset = uv.y - pivot;
        float bend = offset * offset * bendAmount;
        uv.x += bend / max(bendRadius, 0.0001);
    }
    else
    {
        float offset = uv.x - pivot;
        float bend = offset * offset * bendAmount;
        uv.y += bend / max(bendRadius, 0.0001);
    }

    // Sample texture (required for Friction)
    vec4 color = texture(tex, uv);

    fragColor = color;
}

