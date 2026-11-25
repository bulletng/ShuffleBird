import { Box, Button, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useEffect } from "react";

const NoImagesFound = ({
  folders,
  onBack,
}: {
  folders: string[];
  onBack: () => void;
}) => {
  // Esc goes back, like stopping a slideshow
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onBack]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        No images found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        No JPG, PNG or WebP files were found in:
      </Typography>
      <Box my={1}>
        {folders.map((folder) => (
          <Typography
            key={folder}
            variant="body2"
            sx={{ wordBreak: "break-all" }}
          >
            {folder}
          </Typography>
        ))}
      </Box>
      <Button
        variant="contained"
        startIcon={<ChevronLeftIcon />}
        onClick={onBack}
        sx={{ mt: 1 }}
      >
        Back
      </Button>
    </Box>
  );
};

export default NoImagesFound;
