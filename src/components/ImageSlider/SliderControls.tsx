import { Box, IconButton, LinearProgress } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrowRounded";
import NextIcon from "@mui/icons-material/SkipNextRounded";
import PreviousIcon from "@mui/icons-material/SkipPreviousRounded";
import PauseIcon from "@mui/icons-material/PauseRounded";
import StopIcon from "@mui/icons-material/StopRounded";
import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import React from "react";

interface IProps {
  progress: number;
  isPaused: boolean;
  hideProgressBar?: boolean;
  isDisabled?: boolean;
  isPlayPauseDisabled?: boolean;
  /** Seconds without mouse movement before the controls fade out */
  hideDelay?: number;
  hideCursorWhenIdle?: boolean;
  onStart(): void;
  onPreviousImage(): void;
  onNextImage(): void;
  onPause(): void;
  onStop(): void;
}

interface IState {
  isFullscreen: boolean;
  activatedFullscreen: boolean;
  isIdle: boolean;
}

const DEFAULT_HIDE_DELAY_S = 3;

export default class SliderControls extends React.Component<IProps, IState> {
  idleTimeout?: ReturnType<typeof setTimeout>;
  controlsRef = React.createRef<HTMLDivElement>();
  lastPointer?: { x: number; y: number };
  /** Pointer position inside the window, or undefined when it's unknown/outside */
  lastClientPointer?: { x: number; y: number };
  removeFullscreenHandler?: () => void;

  constructor(props: IProps) {
    super(props);
    this.state = {
      isFullscreen: false,
      // We try to check if the user set fullscreen from the slides control.
      // If he did, we need to remember this so we'll get him out of fulscreen when he leaves.
      // If the user entered fullscreen from OS controls, then we'll leave it there.
      // Decided this for now so that the user won't get stuck in fullscreen mode in case he doesn't know how to exit.
      activatedFullscreen: false,
      isIdle: false,
    };
  }

  async componentDidMount(): Promise<void> {
    document.addEventListener("keydown", this.handleKeyPress);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.documentElement.addEventListener("mouseleave", this.handleMouseLeaveWindow);
    this.scheduleIdle();
    const isFullscreen = await window.funcs.isFullscreen();
    this.setState({ isFullscreen });
    this.removeFullscreenHandler = window.funcs.addFullscreenEventHandler(
      this.updateFullscreenValue,
    );
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyPress);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.documentElement.removeEventListener("mouseleave", this.handleMouseLeaveWindow);
    clearTimeout(this.idleTimeout);
    document.body.classList.remove("hide-cursor");
    this.removeFullscreenHandler?.();
    if (this.state.activatedFullscreen && this.state.isFullscreen)
      window.funcs.setFullscreen(false);
  }

  scheduleIdle = (): void => {
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      // Keep the controls up while the pointer is resting on them
      // (check again later rather than giving up, in case a mouseleave gets missed)
      if (this.isPointerOverControls()) {
        this.scheduleIdle();
        return;
      }
      this.setState({ isIdle: true });
      if (this.props.hideCursorWhenIdle)
        document.body.classList.add("hide-cursor");
    }, (this.props.hideDelay ?? DEFAULT_HIDE_DELAY_S) * 1000);
  };

  // Checked against the bar's current position rather than tracked with mouseenter/leave:
  // when the window resizes (e.g. entering fullscreen) the bar moves out from under a
  // still pointer without any mouseleave firing, which left the controls stuck visible.
  isPointerOverControls = (): boolean => {
    const el = this.controlsRef.current;
    const p = this.lastClientPointer;
    if (!el || !p) return false;
    const r = el.getBoundingClientRect();
    return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
  };

  handleMouseLeaveWindow = (): void => {
    this.lastClientPointer = undefined;
  };

  handleMouseMove = (e: MouseEvent): void => {
    this.lastClientPointer = { x: e.clientX, y: e.clientY };
    // Chromium fires synthetic mousemove events when the content under a still pointer
    // changes (image swaps, cursor hiding). Only treat real pointer movement as activity.
    if (
      this.lastPointer &&
      this.lastPointer.x === e.screenX &&
      this.lastPointer.y === e.screenY
    )
      return;
    this.lastPointer = { x: e.screenX, y: e.screenY };

    if (this.state.isIdle) this.setState({ isIdle: false });
    document.body.classList.remove("hide-cursor");
    this.scheduleIdle();
  };

  updateFullscreenValue = (isEnabled: boolean): void => {
    this.setState({ isFullscreen: isEnabled });
    // The layout just changed, so the last known pointer position is stale
    this.lastClientPointer = undefined;
    this.scheduleIdle();
  };

  toggleFullscreen = async (): Promise<void> => {
    const isFullscreen = await window.funcs.isFullscreen();
    if (!isFullscreen) {
      if (!this.state.activatedFullscreen)
        this.setState({ activatedFullscreen: true });
      window.funcs.setFullscreen(true);
    } else window.funcs.setFullscreen(false);
  };

  handleKeyPress = (e: KeyboardEvent) => {
    // Disable keyboard controls when dialog is open
    if (this.props.isDisabled) return;

    e.preventDefault();

    switch (e.key) {
      case "ArrowRight":
        this.props.onNextImage();
        return;
      case "ArrowLeft":
        this.props.onPreviousImage();
        return;
      case " ":
        this.props.isPaused ? this.props.onStart() : this.props.onPause();
        return;
      case "Escape":
        this.props.onStop();
        return;
    }
  };

  render = () => (
    <div
      className={`image-controls${this.state.isIdle ? " idle" : ""}`}
      ref={this.controlsRef}
    >
      <Box my={1}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="button-container">
            {/* Previous Image */}
            <IconButton
              aria-label="previous"
              onClick={this.props.onPreviousImage}
              disabled={this.props.isDisabled}
            >
              <PreviousIcon />
            </IconButton>
            {/* Play */}
            {!this.props.isPlayPauseDisabled && this.props.isPaused && (
              <IconButton
                aria-label="play"
                onClick={this.props.onStart}
                disabled={this.props.isDisabled}
              >
                <PlayIcon />
              </IconButton>
            )}
            {/* Pause */}
            {!this.props.isPlayPauseDisabled && !this.props.isPaused && (
              <IconButton
                aria-label="pause"
                onClick={this.props.onPause}
                disabled={this.props.isDisabled}
              >
                <PauseIcon />
              </IconButton>
            )}
            {/* Stop */}
            <IconButton
              aria-label="stop"
              onClick={this.props.onStop}
              disabled={this.props.isDisabled}
            >
              <StopIcon />
            </IconButton>
            {/* Next Image */}
            <IconButton
              aria-label="next"
              onClick={this.props.onNextImage}
              disabled={this.props.isDisabled}
            >
              <NextIcon />
            </IconButton>
            |{/* Fullscreen */}
            <IconButton
              aria-label="fullscreen"
              onClick={this.toggleFullscreen}
              disabled={this.props.isDisabled}
            >
              {this.state.isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </div>
        </div>

        {/* Progress bar */}
        {!this.props.hideProgressBar && (
          <Box mt={1}>
            <LinearProgress
              sx={{ border: "1px solid black" }}
              variant="determinate"
              value={this.props.progress}
            />
          </Box>
        )}
      </Box>
    </div>
  );
}
