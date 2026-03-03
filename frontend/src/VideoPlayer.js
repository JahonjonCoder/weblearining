import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.scss';

function VideoPlayer({ videoUrl, title = "Video" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Cleanup when component unmounts or videoUrl changes
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        setIsPlaying(false);
      }
    };
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(err => {
              console.warn('Play was interrupted:', err);
              setIsPlaying(false);
            });
        } else {
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Error in play/pause:', err);
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
  };

  const handleBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  };

  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const fullVideoUrl = (videoUrl || '').startsWith('http')
    ? videoUrl
    : `http://localhost:8000${videoUrl}`;

  return (
    <div className="video-player-container">
      <h4 className="video-title">{title}</h4>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        >
          <source src={fullVideoUrl} type="video/mp4" />
          <source src={fullVideoUrl} type="video/webm" />
          <source src={fullVideoUrl} type="video/ogg" />
          <p>Video qo'llab-quvvatlanmaydi.</p>
        </video>

        <div className="video-controls">
          <div className="control-buttons">
            <button
              className="control-btn backward-btn"
              onClick={handleBackward}
              title="10 soniya orqaga"
            >
              ⏪ -10s
            </button>

            <button
              className="control-btn play-pause-btn"
              onClick={handlePlayPause}
              title={isPlaying ? "Pauza" : "Ijro etish"}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              className="control-btn forward-btn"
              onClick={handleForward}
              title="10 soniya oldinga"
            >
              +10s ⏩
            </button>
          </div>

          <div className="progress-bar-container">
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              title="Video progres"
            />
          </div>

          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="separator">/</span>
            <span className="duration">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
