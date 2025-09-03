// Waves wt gradient
#version 330 core

layout(location = 0) out vec4 fragColor;

in vec2 texCoord;

uniform sampler2D tex;

uniform float frequency;
uniform float intensity;
uniform float evolution;
uniform int vertical;

// gradient fade-in/out
uniform float start;        // where the wave begins (0–1)
uniform float fadeInLength; // length of fade-in
uniform float fadeOut;      // where fade-out begins (0–1)
uniform float fadeOutLength;// length of fade-out

float gradientFactor(float coord) {
    // Fade-in
    float inFactor = clamp((coord - start) / max(fadeInLength, 1e-6), 0.0, 1.0);

    // Fade-out
    float outFactor = clamp((fadeOut - coord) / max(fadeOutLength, 1e-6), 0.0, 1.0);

    // Combine
    return min(inFactor, outFactor);
}

void main(void) {
    float x = texCoord.x;
    float y = texCoord.y;

    float coord = (vertical == 1) ? texCoord.y : texCoord.x;
    float factor = gradientFactor(coord);

    if (vertical == 1) {
        x -= sin((texCoord.y - (evolution * 0.01)) * frequency) * intensity * 0.01 * factor;
    } else {
        y -= sin((texCoord.x - (evolution * 0.01)) * frequency) * intensity * 0.01 * factor;
    }

    if (y < 0.0 || y > 1.0 || x < 0.0 || x > 1.0) {
        discard;
    } else {
        fragColor = texture(tex, vec2(x, y));
    }
}

