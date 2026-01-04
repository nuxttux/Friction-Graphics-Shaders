// Bend Shader V2

#version 330 core
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
in vec2 texCoord;

// Controls
uniform float bendAmount;     // Curve strength (-1 to 1)
uniform float bendRadius;     // Curve softness
uniform float pivot;          // Bend origin (0–1)
uniform int bendVertical;     // 0 = horizontal, 1 = vertical

void main()
{
    vec2 uv = texCoord;
    vec2 bentUV = uv;

    if (bendVertical == 1)
    {
        // Vertical bend: curve along Y, offset X
        float t = uv.y - pivot;

        // Parabolic curve (non-scaling)
        float curve = t * t * bendAmount;

        bentUV.x += curve / max(bendRadius, 0.0001);
    }
    else
    {
        // Horizontal bend: curve along X, offset Y
        float t = uv.x - pivot;
        float curve = t * t * bendAmount;

        bentUV.y += curve / max(bendRadius, 0.0001);
    }

    // Sample texture once (required)
    vec4 color = texture(tex, bentUV);

    fragColor = color;
}

