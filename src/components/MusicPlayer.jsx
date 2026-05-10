import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FAVICON_ARTWORK, musicTracks } from "./musicTracks.js";

const SEEK_STEP_SECONDS = 10;
const PREVIOUS_RESTART_SECONDS = 4;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function clampTime(value, duration) {
  if (!Number.isFinite(duration) || duration <= 0) return Math.max(0, value);
  return Math.min(Math.max(0, value), duration);
}

function getRandomTrackIndex() {
  return Math.floor(Math.random() * musicTracks.length);
}

export function MusicPlayer() {
  const audioRef = useRef(null);
  const shouldResumeRef = useRef(false);
  const [trackIndex, setTrackIndex] = useState(getRandomTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const track = musicTracks[trackIndex];
  const artwork = track.artwork || FAVICON_ARTWORK;
  const hasPrevious = trackIndex > 0;
  const hasNext = trackIndex < musicTracks.length - 1;
  const progress = duration > 0 ? currentTime / duration : 0;

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    shouldResumeRef.current = true;
    audio.play().catch(() => {
      shouldResumeRef.current = false;
      setIsPlaying(false);
    });
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    shouldResumeRef.current = false;
    audio.pause();
  }, []);

  const seekTo = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = clampTime(time, audio.duration);
    setCurrentTime(audio.currentTime);
  }, []);

  const goToNext = useCallback(
    ({ autoplay = true } = {}) => {
      if (!hasNext) {
        shouldResumeRef.current = false;
        pause();
        return;
      }
      shouldResumeRef.current = autoplay;
      setTrackIndex((index) => Math.min(index + 1, musicTracks.length - 1));
    },
    [hasNext, pause],
  );

  const goToPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > PREVIOUS_RESTART_SECONDS) {
      seekTo(0);
      return;
    }

    if (!hasPrevious) {
      seekTo(0);
      return;
    }

    shouldResumeRef.current = isPlaying;
    setTrackIndex((index) => Math.max(index - 1, 0));
  }, [hasPrevious, isPlaying, seekTo]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
      return;
    }
    play();
  }, [isPlaying, pause, play]);

  const selectTrack = useCallback(
    (nextIndex) => {
      shouldResumeRef.current = true;

      if (nextIndex === trackIndex) {
        seekTo(0);
        play();
        return;
      }

      setTrackIndex(nextIndex);
    },
    [play, seekTo, trackIndex],
  );

  const handleProgressInput = useCallback(
    (event) => {
      const nextProgress = Number(event.target.value) / 1000;
      seekTo(nextProgress * (duration || 0));
    },
    [duration, seekTo],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (shouldResumeRef.current) {
      audio.play().catch(() => {
        shouldResumeRef.current = false;
        setIsPlaying(false);
      });
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => goToNext({ autoplay: true });

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [goToNext]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !("MediaMetadata" in window)) {
      return undefined;
    }

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: [
        { src: artwork, sizes: "640x640", type: "image/jpeg" },
        { src: FAVICON_ARTWORK, sizes: "any", type: "image/svg+xml" },
      ],
    });

    const setHandler = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Safari and older Chromium builds may not support every action.
      }
    };

    setHandler("play", play);
    setHandler("pause", pause);
    setHandler("nexttrack", () => goToNext({ autoplay: true }));
    setHandler("previoustrack", goToPrevious);
    setHandler("seekbackward", () =>
      seekTo((audioRef.current?.currentTime || 0) - SEEK_STEP_SECONDS),
    );
    setHandler("seekforward", () =>
      seekTo((audioRef.current?.currentTime || 0) + SEEK_STEP_SECONDS),
    );
    setHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seekTo(details.seekTime);
    });

    return () => {
      [
        "play",
        "pause",
        "nexttrack",
        "previoustrack",
        "seekbackward",
        "seekforward",
        "seekto",
      ].forEach((action) => setHandler(action, null));
    };
  }, [artwork, goToNext, goToPrevious, pause, play, seekTo, track]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const progressLabel = useMemo(
    () => `${formatTime(currentTime)} / ${formatTime(duration)}`,
    [currentTime, duration],
  );

  return (
    <aside
      className={`music-player${isExpanded ? " is-expanded" : ""}`}
      aria-label="LOEM music player"
    >
      <audio ref={audioRef} preload="metadata" />
      <button
        className="music-player__brand-toggle"
        type="button"
        aria-label={isExpanded ? "Hide playlist" : "Show playlist"}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <img src={FAVICON_ARTWORK} alt="" />
      </button>

      <button
        className="music-player__artwork-wrap"
        type="button"
        aria-label={isExpanded ? "Hide playlist" : "Show playlist"}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <img
          className="music-player__artwork"
          src={artwork}
          alt=""
          onError={(event) => {
            event.currentTarget.src = FAVICON_ARTWORK;
          }}
        />
      </button>

      <div className="music-player__main">
        <div className="music-player__meta">
          <div
            className="music-player__eyebrow"
            aria-label="Loēm Sounds. Soundtrack for flow. The art of flow. Life in flow. Live unbound."
          >
            <span className="music-player__eyebrow-track" aria-hidden="true">
              <span>Loēm Sounds</span>
              <span>A soundtrack for flow</span>
              <span>The art of flow</span>
              <span>Life in flow</span>
              <span>Sounds that Flow with you</span>
            </span>
          </div>
          <p className="music-player__title">{track.title}</p>
          <p className="music-player__artist">{track.artist}</p>
        </div>

        <div className="music-player__controls">
          <button
            className="music-player__button"
            type="button"
            aria-label="Previous track"
            onClick={goToPrevious}
          >
            <span aria-hidden="true">‹‹</span>
          </button>
          <button
            className="music-player__button music-player__button--play"
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlayback}
          >
            <span
              className={
                isPlaying ? "music-player__pause-icon" : "music-player__play-icon"
              }
              aria-hidden="true"
            >
              {isPlaying ? "Ⅱ" : "▶"}
            </span>
          </button>
          <button
            className="music-player__button"
            type="button"
            aria-label="Next track"
            onClick={() => goToNext({ autoplay: isPlaying })}
            disabled={!hasNext}
          >
            <span aria-hidden="true">››</span>
          </button>
        </div>

        <div className="music-player__timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            className="music-player__progress"
            type="range"
            min="0"
            max="1000"
            value={Math.round(progress * 1000)}
            aria-label={`Track progress, ${progressLabel}`}
            onChange={handleProgressInput}
            style={{ "--progress": `${progress * 100}%` }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="music-player__playlist" aria-label="Playlist tracks">
        {musicTracks.map((playlistTrack, index) => (
          <button
            className="music-player__track"
            type="button"
            key={`${playlistTrack.title}-${playlistTrack.artist}`}
            aria-current={index === trackIndex ? "true" : undefined}
            onClick={() => selectTrack(index)}
          >
            <img
              className="music-player__track-artwork"
              src={playlistTrack.artwork || FAVICON_ARTWORK}
              alt=""
              onError={(event) => {
                event.currentTarget.src = FAVICON_ARTWORK;
              }}
            />
            <span className="music-player__track-copy">
              <span className="music-player__track-title">
                {playlistTrack.title}
              </span>
              <span className="music-player__track-artist">
                {playlistTrack.artist}
              </span>
            </span>
            <span className="music-player__track-state" aria-hidden="true">
              {index === trackIndex ? (isPlaying ? "Playing" : "Selected") : ""}
            </span>
          </button>
        ))}
        <a
          className="music-player__spotify-link"
          href="https://open.spotify.com/playlist/5JPvs7Jf0mZwDbqUfXFtoI?si=6baaafc5c63543c5"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Spotify
        </a>
      </div>
    </aside>
  );
}
