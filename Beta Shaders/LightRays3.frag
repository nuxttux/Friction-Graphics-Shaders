// Moon / God Rays — Radial or directional moving rays from a point
// Friction RC2 — GLSL 330 core
#version 330 core

layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex; // must be named 'tex'

// Controls
uniform vec2 origin;          // normalized origin [0..1]
uniform float blankRadius;    // fraction of canvas radius to keep empty
uniform float spread;         // how far rays extend
uniform float time;           // animation
uniform float ray1_density;   // first ray layer density
uniform float ray2_density;   // second ray layer density
uniform float ray2_intensity; // second layer intensity multiplier
uniform vec4 color;           // ray color
uniform float seed1;          // noise seed 1
uniform float seed2;          // noise seed 2
uniform float angle;          // main ray direction in radians
uniform float cone;           // half-width of directional cone (0..PI)
uniform int mode;             // 0 = radial, 1 = directional

// Random / noise
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 uv){
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float a = rand(i);
    float b = rand(i + vec2(1.0,0.0));
    float c = rand(i + vec2(0.0,1.0));
    float d = rand(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}

void main() {
    vec2 dir = texCoord - origin;
    float dist = length(dir);

    // blank center
    if(dist < blankRadius){
        fragColor = texture(tex, texCoord);
        return;
    }

    // normalize direction
    vec2 normDir = dir / dist;
    float angleFromOrigin = atan(normDir.y, normDir.x);

    float mask = 1.0;

    if(mode == 1){
        // directional cone mask
        float diff = angleFromOrigin - angle;
        diff = mod(diff + 3.1415926, 6.2831853) - 3.1415926; // wrap to [-PI,PI]
        mask = smoothstep(cone, 0.0, abs(diff));
    }

    // noise layers
    float n1 = noise(normDir * ray1_density + vec2(time + seed1));
    float n2 = noise(normDir * ray2_density + vec2(time*1.5 + seed2)) * ray2_intensity;

    float intensity = (n1 + n2) * smoothstep(blankRadius, 1.0, dist) * spread * mask;

    fragColor = vec4(color.rgb * intensity, intensity * texture(tex, texCoord).a);
}

