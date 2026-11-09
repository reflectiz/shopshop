import React from 'react';

const videoId = 'mMiL4_1Yewg';
const VideoPage: React.FC = () => {
  // Video ID from https://www.youtube.com/watch?v=mMiL4_1Yewg

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Watch Our Video</h1>
          <p className="text-lg text-gray-600">
            Check out our featured video
          </p>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;

