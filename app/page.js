'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultPrompt = "Professional B&W corporate headshot. Dark navy suit, white shirt, silk tie. Sharp 8K quality. Soft studio lighting. Blurred office background. Eyes in focus.";

  const generateImage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || defaultPrompt }),
      });
      const data = await response.json();
      setImageUrl(data.image);
    } catch (error) {
      alert('Failed to generate image. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Professional Headshot
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Generate AI-powered professional photos in seconds
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How it works
          </h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Describe your desired headshot style (or use default)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Click generate and wait 30-60 seconds</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Download your professional photo</span>
            </li>
          </ol>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Describe your headshot
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

        {/* Generate Button */}
        <button
          onClick={generateImage}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Headshot'
          )}
        </button>

        {/* Loading State */}
        {loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-yellow-800 text-center">
              ⏳ Creating your professional headshot... This takes about 30-60 seconds
            </p>
          </div>
        )}

        {/* Result Card */}
        {imageUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Your Headshot
            </h2>
            
            <div className="relative aspect-[4/5] w-full mb-4 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={imageUrl}
                alt="Generated professional headshot"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-3">
              <a
                href={imageUrl}
                download="professional-headshot.png"
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-green-700 active:scale-[0.98] transition-all"
              >
                Download
              </a>
              <button
                onClick={() => setImageUrl('')}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 active:scale-[0.98] transition-all"
              >
                Generate New
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 mt-8">
          <h3 className="text-base font-semibold text-slate-900 mb-3">
            💡 Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Be specific about clothing, lighting, and background</li>
            <li>• Mention "professional" or "corporate" for business style</li>
            <li>• Include "sharp focus" or "8K" for high quality</li>
            <li>• Try "soft lighting" for a flattering look</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-xs sm:text-sm text-slate-500">
          Powered by AI • Professional headshots in seconds
        </p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}