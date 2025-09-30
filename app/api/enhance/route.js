// app/api/enhance/route.js
import { NextResponse } from 'next/server';

// Use Node.js runtime for better compatibility
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { 
      inputImages,
      enhancementLevel = 'professional', // professional, subtle, dramatic
      colorStyle = 'natural', // natural, warm, cool, vibrant, corporate
      backgroundBlur = false,
      skinSmoothing = true,
      lightingCorrection = true,
      sharpening = true
    } = await request.json();

    if (!inputImages || inputImages.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one input image' }, { status: 400 });
    }

    // Get API token with proper error handling
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
    
    if (!REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not configured');
      return NextResponse.json({ 
        error: 'Enhancement service is not configured. Please contact support.',
        details: 'Missing API configuration'
      }, { status: 503 });
    }

    if (!REPLICATE_API_TOKEN.startsWith('r8_')) {
      console.error('Invalid REPLICATE_API_TOKEN format');
      return NextResponse.json({ 
        error: 'Enhancement service configuration error',
        details: 'Invalid token format'
      }, { status: 503 });
    }

    let processedImage = inputImages[0];
    const enhancementsApplied = [];

    console.log('Starting LinkedIn photo enhancement...');
    console.log('Settings:', { enhancementLevel, colorStyle, backgroundBlur, skinSmoothing });

    // STEP 1: Face Enhancement with GFPGAN (for skin smoothing and face enhancement)
    if (skinSmoothing || lightingCorrection) {
      try {
        console.log('Applying face enhancement...');
        
        const gfpganResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
            input: {
              img: processedImage,
              version: "1.4",
              scale: 2
            }
          })
        });

        if (gfpganResponse.ok) {
          const prediction = await gfpganResponse.json();
          
          if (prediction.status === 'starting' || prediction.status === 'processing') {
            const result = await pollForCompletion(prediction.id, REPLICATE_API_TOKEN);
            if (result) {
              processedImage = result;
              enhancementsApplied.push('Face enhancement & skin smoothing');
            }
          } else if (prediction.status === 'succeeded' && prediction.output) {
            processedImage = prediction.output;
            enhancementsApplied.push('Face enhancement & skin smoothing');
          }
        } else {
          console.log('Face enhancement failed, continuing with next step');
        }
      } catch (error) {
        console.log('Face enhancement error:', error.message);
      }
    }

    // STEP 2: Quality Enhancement with Real-ESRGAN
    if (sharpening || enhancementLevel !== 'subtle') {
      try {
        console.log('Applying quality enhancement...');
        
        const realEsrganResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
            input: {
              image: processedImage,
              scale: enhancementLevel === 'dramatic' ? 4 : 2,
              face_enhance: true
            }
          })
        });

        if (realEsrganResponse.ok) {
          const prediction = await realEsrganResponse.json();
          
          if (prediction.status === 'starting' || prediction.status === 'processing') {
            const result = await pollForCompletion(prediction.id, REPLICATE_API_TOKEN);
            if (result) {
              processedImage = result;
              enhancementsApplied.push('Quality enhancement & sharpening');
            }
          } else if (prediction.status === 'succeeded' && prediction.output) {
            processedImage = prediction.output;
            enhancementsApplied.push('Quality enhancement & sharpening');
          }
        } else {
          console.log('Quality enhancement failed, continuing');
        }
      } catch (error) {
        console.log('Quality enhancement error:', error.message);
      }
    }

    // STEP 3: Optional Background Blur
    if (backgroundBlur) {
      try {
        console.log('Applying background blur...');
        
        // Remove background first
        const rembgResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
            input: {
              image: processedImage
            }
          })
        });

        if (rembgResponse.ok) {
          const prediction = await rembgResponse.json();
          let foreground;
          
          if (prediction.status === 'starting' || prediction.status === 'processing') {
            foreground = await pollForCompletion(prediction.id, REPLICATE_API_TOKEN);
          } else if (prediction.status === 'succeeded' && prediction.output) {
            foreground = prediction.output;
          }

          if (foreground) {
            // Add blurred background using SDXL
            const sdxlResponse = await fetch('https://api.replicate.com/v1/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                input: {
                  prompt: "professional blurred office background, bokeh effect, soft focus background, professional headshot setting",
                  image: processedImage,
                  prompt_strength: 0.25, // Very low to just blur background
                  num_inference_steps: 20,
                  guidance_scale: 3,
                  negative_prompt: "sharp background, focused background, clear background"
                }
              })
            });

            if (sdxlResponse.ok) {
              const sdxlPrediction = await sdxlResponse.json();
              
              if (sdxlPrediction.status === 'starting' || sdxlPrediction.status === 'processing') {
                const blurred = await pollForCompletion(sdxlPrediction.id, REPLICATE_API_TOKEN);
                if (blurred) {
                  processedImage = blurred;
                  enhancementsApplied.push('Professional background blur');
                }
              } else if (sdxlPrediction.status === 'succeeded' && sdxlPrediction.output) {
                processedImage = Array.isArray(sdxlPrediction.output) ? sdxlPrediction.output[0] : sdxlPrediction.output;
                enhancementsApplied.push('Professional background blur');
              }
            }
          }
        } else {
          console.log('Background removal failed, skipping blur');
        }
      } catch (error) {
        console.log('Background blur error:', error.message);
      }
    }

    // STEP 4: Color Style Adjustment
    if (colorStyle !== 'natural') {
      try {
        console.log('Applying color style:', colorStyle);
        
        const stylePrompts = {
          warm: "warm golden hour tones, welcoming atmosphere, soft warm lighting",
          cool: "cool professional tones, modern corporate feel, crisp lighting",
          vibrant: "vibrant saturated colors, dynamic energy, bright lighting",
          corporate: "neutral corporate tones, formal business atmosphere, balanced lighting"
        };

        const sdxlResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input: {
              prompt: `professional LinkedIn headshot portrait, ${stylePrompts[colorStyle]}, high quality photography`,
              image: processedImage,
              prompt_strength: 0.15, // Very subtle color grading
              num_inference_steps: 20,
              guidance_scale: 5,
              scheduler: "K_EULER",
              negative_prompt: "ugly, distorted, overprocessed, fake, amateur"
            }
          })
        });

        if (sdxlResponse.ok) {
          const prediction = await sdxlResponse.json();
          
          if (prediction.status === 'starting' || prediction.status === 'processing') {
            const styledImage = await pollForCompletion(prediction.id, REPLICATE_API_TOKEN);
            if (styledImage) {
              processedImage = styledImage;
              enhancementsApplied.push(`${colorStyle.charAt(0).toUpperCase() + colorStyle.slice(1)} color grading`);
            }
          } else if (prediction.status === 'succeeded' && prediction.output) {
            processedImage = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
            enhancementsApplied.push(`${colorStyle.charAt(0).toUpperCase() + colorStyle.slice(1)} color grading`);
          }
        } else {
          console.log('Color styling failed, using original colors');
        }
      } catch (error) {
        console.log('Color styling error:', error.message);
      }
    }

    // Return the enhanced image
    return NextResponse.json({ 
      image: processedImage,
      success: true,
      enhancements_applied: enhancementsApplied,
      settings: {
        enhancement_level: enhancementLevel,
        color_style: colorStyle,
        background_blur: backgroundBlur,
        skin_smoothing: skinSmoothing,
        lighting_correction: lightingCorrection,
        sharpening: sharpening
      },
      linkedin_ready: true,
      message: enhancementsApplied.length > 0 
        ? `Successfully applied ${enhancementsApplied.length} enhancements`
        : 'Image processed successfully'
    });

  } catch (error) {
    console.error('Enhancement API error:', error);
    return NextResponse.json({ 
      error: 'Failed to enhance image',
      details: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Polling helper function
async function pollForCompletion(predictionId, token, maxAttempts = 30) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Wait 2 seconds between polls
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (statusResponse.ok) {
        const prediction = await statusResponse.json();
        console.log(`Poll ${attempts + 1}/${maxAttempts}: ${prediction.status}`);
        
        if (prediction.status === 'succeeded' && prediction.output) {
          return Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        }
        
        if (prediction.status === 'failed') {
          console.error('Prediction failed:', prediction.error);
          return null;
        }
        
        if (prediction.status === 'canceled') {
          console.error('Prediction canceled');
          return null;
        }
      } else {
        console.error(`Polling request failed with status: ${statusResponse.status}`);
      }
    } catch (error) {
      console.error(`Polling error at attempt ${attempts + 1}:`, error.message);
    }
    
    attempts++;
  }
  
  console.error('Polling timeout after', maxAttempts, 'attempts');
  return null;
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}