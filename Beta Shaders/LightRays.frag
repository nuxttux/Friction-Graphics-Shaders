//Light Rays
#version 330 core
layout(location = 0) out vec4 fragColor;

in vec2 texCoord;
uniform sampler2D tex; // must be named 'tex' in RC2

// Controls
uniform vec2 origin;        // 0..1, center of rays
uniform float time;         // animation
uniform float blankRadius;  // radius of empty center
uniform float ray1_density;
uniform float ray2_density;
uniform float ray2_intensity;
uniform float spread;       // controls thickness/falloff
uniform vec4 color;         // ray color
uniform float seed1;
uniform float seed2;

// Random / noise function
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
    // direction from origin
    vec2 dir = texCoord - origin;
    float dist = length(dir);

    if (dist < blankRadius) {
        fragColor = vec4(0.0);
        return;
    }

    // normalize direction for radial rays
    vec2 uv = dir / dist;

    // Layer 1
    float ray1 = noise(uv * ray1_density + time + seed1);

    // Layer 2 (moving)
    float ray2 = noise(uv * ray2_density + time*1.5 + seed2) * ray2_intensity;

    // combine, apply spread / falloff
    float intensity = (ray1 + ray2) * smoothstep(blankRadius, 1.0, dist) * spread;

    fragColor = vec4(color.rgb * intensity, intensity * texture(tex, texCoord).a);
}

