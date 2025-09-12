// Lift Gamma Gain Shader for Friction RC2
#version 330 core

layout(location = 0) out vec4 fragColor;
in vec2 texCoord;

uniform sampler2D tex;

// vec4s because Friction passes color as RGBA
uniform vec4 lift;  
uniform vec4 gamma; 
uniform vec4 gain;  

void main(void) {
    vec4 col = texture(tex, texCoord);

    vec3 c = col.rgb;

    // Apply Lift → Gamma → Gain
    c = c + lift.rgb;  
    c = pow(max(c, 0.0), 1.0 / max(gamma.rgb, vec3(0.001)));  
    c = c * gain.rgb;  

    fragColor = vec4(clamp(c, 0.0, 1.0), col.a);
}

