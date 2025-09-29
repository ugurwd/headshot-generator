'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputImages, setInputImages] = useState([]);

  const defaultPrompt = "Professional B&W corporate headshot. Dark navy suit, white shirt, silk tie. Sharp 8K quality. Soft studio lighting. Blurred office background. Eyes in focus.";

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setInputImages(imageUrls);
  };

  const generateImage = async () => {
    if (inputImages.length === 0) {
      alert('Please upload at least one face photo');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt || defaultPrompt,
          inputImages: inputImages 
        }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setImageUrl(data.image);
      }
    } catch (error) {
      alert('Failed to generate image. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Professional Headshot Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Upload your photo and generate AI-powered professional headshots
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How it works
          </h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Upload 1-4 photos of your face (clear, front-facing)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Describe your desired professional style</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Generate and download your headshot (30-60 seconds)</span>
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Upload Your Photos (1-4 images)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">
            Upload clear photos of your face. Best results with 2-4 images.
          </p>
          
          {inputImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {inputImages.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={'Upload ' + (idx + 1)}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Describe your headshot style
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={defaultPrompt}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
            rows="4"
          />
          <p className="text-xs text-slate-500 mt-2">
            Leave blank to use default professional style
          </p>
        </div>

        <button
          onClick={generateImage}
          disabled={loading || inputImages.length === 0}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Generating...' : 'Generate Headshot'}
        </button>

        {loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-yellow-800 text-center">
              Creating your professional headshot... This takes about 30-60 seconds
            </p>
          </div>
        )}

        {imageUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Your Headshot
            </h2>
            <div className="relative aspect-[4/5] w-full mb-4 rounded-xl overflow-hidden bg-slate-100">
              <img src={imageUrl} alt="Generated headshot" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <a href={imageUrl} download="professional-headshot.png" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-green-700">
                Download
              </a>
              <button onClick={() => setImageUrl('')} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300">
                Generate New
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
