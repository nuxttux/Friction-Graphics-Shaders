// 3D Box + Z Rotation //
#version 330 core

layout(location = 0) out vec4 fragColor;

in vec2 texCoord;
uniform sampler2D tex;

// Four corners in normalized [0..1] destination space (can be negative or >1)
uniform vec2 topLeft;
uniform vec2 topRight;
uniform vec2 bottomRight;
uniform vec2 bottomLeft;

// Z rotation in radians
uniform float rotZ;

// Edge sampling mode
uniform int edgeMode; // 0=Transparent, 1=Clamp, 2=Repeat

// Compute projective UV using bilinear inverse mapping
vec2 projectiveUV(vec2 p)
{
    // Center rotation
    vec2 center = vec2(0.5, 0.5);
    vec2 rp = p - center;
    float cosR = cos(rotZ);
    float sinR = sin(rotZ);
    rp = vec2(
        rp.x * cosR - rp.y * sinR,
        rp.x * sinR + rp.y * cosR
    );
    vec2 rotatedP = center + rp;

    // Destination quad corners
    vec2 dst[4];
    dst[0] = topLeft;
    dst[1] = topRight;
    dst[2] = bottomRight;
    dst[3] = bottomLeft;

    // Normalized source quad (unit square)
    vec2 src[4];
    src[0] = vec2(0.0, 0.0);
    src[1] = vec2(1.0, 0.0);
    src[2] = vec2(1.0, 1.0);
    src[3] = vec2(0.0, 1.0);

    // Solve bilinear coordinates by iterative approximation
    vec2 uv = rotatedP;
    for(int i = 0; i < 8; i++)
    {
        vec2 f = mix(mix(dst[0], dst[1], uv.x), mix(dst[3], dst[2], uv.x), uv.y);
        vec2 diff = rotatedP - f;
        uv += diff * 0.5;
    }

    // Map back to source quad
    return mix(mix(src[0], src[1], uv.x), mix(src[3], src[2], uv.x), uv.y);
}

void main()
{
    vec2 uv = projectiveUV(texCoord);
    vec4 col;

    if(edgeMode == 1) {
        uv = clamp(uv, -1.0, 2.0);
        col = texture(tex, uv);
    } else if(edgeMode == 2) {
        uv = fract(uv);
        col = texture(tex, uv);
    } else {
        if(any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
            col = vec4(0.0);
        } else {
            col = texture(tex, uv);
        }
    }

    fragColor = col;
}

