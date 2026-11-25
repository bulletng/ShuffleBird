import { IconButton, Tooltip } from "@mui/material";
import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import { useEffect, useState } from "react";

export const FullscreenButton = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    window.funcs.isFullscreen().then(setIsFullscreen);
    return window.funcs.addFullscreenEventHandler(setIsFullscreen);
  }, []);

  return (
    <Tooltip title={isFullscreen ? "Exit fullscreen (F11)" : "Fullscreen (F11)"}>
      <IconButton
        aria-label="fullscreen"
        onClick={() => window.funcs.setFullscreen(!isFullscreen)}
        sx={{ position: "fixed", top: 8, right: 8, zIndex: 1 }}
      >
        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
    </Tooltip>
  );
};
