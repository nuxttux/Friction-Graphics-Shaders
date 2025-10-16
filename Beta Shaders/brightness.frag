// Simple Brightness
#version 330 core
layout(location = 0) out vec4 fragColor;

in vec2 texCoord;
uniform sampler2D tex;

// Controls
uniform float brightness; // 0.0 = black, 1.0 = normal, >1.0 = brighter

void main()
{
    vec4 base = texture(tex, texCoord);
    vec3 color = base.rgb * brightness;
    vec4 outColor = vec4(color, base.a);

    // Premultiplied alpha version (for additive / compositing pipelines)
    fragColor = vec4(outColor.rgb * outColor.a, outColor.a);
}

