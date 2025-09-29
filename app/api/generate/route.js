import Replicate from 'replicate';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "tencentarc/photomaker:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          style_name: "Photographic (Default)",
          num_steps: 30,
          style_strength_ratio: 20,
        }
      }
    );

    return NextResponse.json({ image: output[0] });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}