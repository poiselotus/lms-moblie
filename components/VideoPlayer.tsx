import Colors from "@/constants/Colors";
import { PlaybackSpeed } from "@/src/types/course";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface VideoPlayerProps {
  videoUrl?: string;
  onProgress?: (position: number) => void;
  onComplete?: () => void;
  initialPosition?: number;
  autoPlay?: boolean;
  onNext?: () => void;
  hasNext?: boolean;
}

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
  videoUrl,
  onProgress,
  onComplete,
  initialPosition = 0,
  autoPlay = false,
  onNext,
  hasNext = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(180); // Default 3 minutes for demo
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Simulate video loading
  useEffect(() => {
    if (videoUrl) {
      setIsLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoading(false);
        if (autoPlay) {
          startProgressTracking();
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setError("No video URL provided");
      setIsLoading(false);
    }
  }, [videoUrl]);

  // Auto-play next lesson when video completes
  useEffect(() => {
    if (currentTime >= duration && onComplete) {
      onComplete();
    }
  }, [currentTime, duration, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 1 * playbackSpeed;
        if (newTime >= duration) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return duration;
        }
        // Save progress every 10 seconds
        if (Math.floor(newTime) % 10 === 0 && onProgress) {
          onProgress(newTime);
        }
        return newTime;
      });
    }, 1000);
  }, [duration, playbackSpeed, onProgress]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Save current position when pausing
      if (onProgress) {
        onProgress(currentTime);
      }
    } else {
      setIsPlaying(true);
      startProgressTracking();
    }
    resetControlsTimeout();
  }, [isPlaying, currentTime, onProgress, startProgressTracking]);

  const handleSeek = useCallback(
    (direction: "forward" | "backward") => {
      const seekAmount = 10;
      setCurrentTime((prev) => {
        const newTime =
          direction === "forward"
            ? Math.min(prev + seekAmount, duration)
            : Math.max(prev - seekAmount, 0);
        return newTime;
      });
    },
    [duration],
  );

  const handleProgressBarPress = useCallback(
    (event: any) => {
      const { locationX } = event.nativeEvent;
      const progressBarWidth = screenWidth - 32;
      const newPosition = (locationX / progressBarWidth) * duration;
      setCurrentTime(newPosition);
    },
    [duration],
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const cyclePlaybackSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    setPlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
    setShowSpeedMenu(false);
  }, [playbackSpeed]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Unable to load video</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      {/* Video Area */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoArea}
        onPress={resetControlsTimeout}
      >
        {/* Placeholder for actual video component */}
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={80} color={Colors.light.tint} />
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Controls Overlay */}
        {!isLoading && showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                <Text style={styles.speedText}>{playbackSpeed}x</Text>
              </TouchableOpacity>

              {showSpeedMenu && (
                <View style={styles.speedMenu}>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedOption,
                        speed === playbackSpeed && styles.speedOptionActive,
                      ]}
                      onPress={() => {
                        setPlaybackSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.speedOptionText,
                          speed === playbackSpeed &&
                            styles.speedOptionTextActive,
                        ]}
                      >
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => handleSeek("backward")}
              >
                <Ionicons name="play-back" size={32} color="#fff" />
                <Text style={styles.seekText}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={48}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => handleSeek("forward")}
              >
                <Ionicons name="play-forward" size={32} color="#fff" />
                <Text style={styles.seekText}>10</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>

              {/* Progress Bar */}
              <TouchableOpacity
                style={styles.progressBarContainer}
                onPress={handleProgressBarPress}
                activeOpacity={1}
              >
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.bottomRightControls}>
                {hasNext && onNext && (
                  <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.fullscreenButton}
                  onPress={toggleFullscreen}
                >
                  <Ionicons
                    name={isFullscreen ? "contract" : "expand"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    borderRadius: 0,
    aspectRatio: undefined,
  },
  videoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  speedButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  speedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  speedMenu: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.9)",
    borderRadius: 8,
    overflow: "hidden",
  },
  speedOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  speedOptionActive: {
    backgroundColor: Colors.light.tint,
  },
  speedOptionText: {
    color: "#fff",
    fontSize: 14,
  },
  speedOptionTextActive: {
    fontWeight: "600",
  },
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  seekButton: {
    alignItems: "center",
  },
  seekText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    padding: 16,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  bottomRightControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  fullscreenButton: {
    padding: 4,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  errorSubtext: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
});
