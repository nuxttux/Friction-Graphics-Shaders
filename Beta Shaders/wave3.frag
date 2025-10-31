// Waves Advanced
#version 330 core

layout(location = 0) out vec4 fragColor;

in vec2 texCoord;
uniform sampler2D tex;

// Wave controls
uniform float frequency;
uniform float intensity;
uniform float evolution;
uniform int vertical;         // 0 = horizontal wave, 1 = vertical wave

// Gradient controls
uniform float start;          
uniform float fadeInLength;   
uniform float fadeOut;        
uniform float fadeOutLength;
uniform int gradientVertical; // 0 = horizontal fade, 1 = vertical fade (independent of wave)

//---------------------------
// Gradient Fade Function
//---------------------------
float gradientFactor(float coord)
{
    float inFactor  = clamp((coord - start) / max(fadeInLength, 1e-6), 0.0, 1.0);
    float outFactor = clamp((fadeOut - coord) / max(fadeOutLength, 1e-6), 0.0, 1.0);
    return min(inFactor, outFactor);
}

//---------------------------
// Main
//---------------------------
void main(void)
{
    vec2 uv = texCoord;

    // Fade axis can be independent of wave direction
    float gradientCoord = (gradientVertical == 1) ? uv.y : uv.x;
    float fadeFactor = gradientFactor(gradientCoord);

    // Wave direction
    vec2 displacedUV = uv;
    if (vertical == 1)
        displacedUV.x -= sin((uv.y - evolution * 0.01) * frequency) * intensity * 0.01 * fadeFactor;
    else
        displacedUV.y -= sin((uv.x - evolution * 0.01) * frequency) * intensity * 0.01 * fadeFactor;

    if (displacedUV.x < 0.0 || displacedUV.x > 1.0 || displacedUV.y < 0.0 || displacedUV.y > 1.0)
        discard;

    fragColor = texture(tex, displacedUV);
}

