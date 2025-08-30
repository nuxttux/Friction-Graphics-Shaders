//Voronoi
#version 330 core
layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex; // required by Friction RC2

// Controls
uniform float time;
uniform float scale;
uniform float speed;
uniform float contrast;
uniform float intensity;

// 2D random
vec2 random2(vec2 p){
    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453123);
}

// Voronoi distance
float voronoi(vec2 uv){
    vec2 i_uv = floor(uv);
    vec2 f_uv = fract(uv);
    float minDist = 1.0;
    for(int y=-1;y<=1;y++){
        for(int x=-1;x<=1;x++){
            vec2 neighbor = vec2(float(x),float(y));
            vec2 point = random2(i_uv + neighbor);
            point = 0.5 + 0.5*sin(time*speed + point*6.2831); // animated points
            vec2 diff = neighbor + point - f_uv;
            minDist = min(minDist, length(diff));
        }
    }
    return minDist;
}

void main(){
    vec2 uv = texCoord * scale;
    float d = voronoi(uv);
    d = pow(clamp(d,0.0,1.0), contrast) * intensity;

    // Required texture sample
    vec4 dummy = texture(tex, texCoord);

    fragColor = vec4(vec3(d), d * dummy.a); // mask-ready alpha
}

