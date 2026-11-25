import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CheckIcon from "@mui/icons-material/Check";
import { ReactNode } from "react";
import {
  AccentColor,
  DEFAULT_SETTINGS,
  getSettings,
  ISettings,
  setSettings,
} from "../utils/localStorage";
import { ACCENT_COLORS, resolveMode } from "../utils/theme";

interface IProps {
  settings: ISettings;
  onChange(settings: ISettings): void;
  onBack(): void;
}

const formatContrastMultiplierText = (value: number) =>
  value === 1 ? "Off" : `x${value}`;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="overline" color="text.secondary" component="h2">
      {title}
    </Typography>
    {children}
  </Paper>
);

const Label = ({ children }: { children: ReactNode }) => (
  <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>
    {children}
  </Typography>
);

export function SettingsPage({ settings, onChange, onBack }: IProps) {
  // Every change is saved immediately. Build on the stored settings rather than
  // props so rapid changes (e.g. dragging a slider) never undo each other.
  const update = (changes: ISettings) => {
    const newSettings = { ...getSettings(), ...changes };
    setSettings(newSettings);
    onChange(newSettings);
  };

  const mode = resolveMode(settings);

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Button startIcon={<ChevronLeftIcon />} onClick={onBack} aria-label="back">
          back
        </Button>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Settings
        </Typography>
      </Box>

      <Section title="Appearance">
        <Label>Color scheme</Label>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={settings.themeMode}
          onChange={(_, themeMode) => themeMode && update({ themeMode })}
        >
          <ToggleButton value="dark">Dark</ToggleButton>
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="system">System</ToggleButton>
        </ToggleButtonGroup>

        <Label>Accent color</Label>
        <Box sx={{ display: "flex", gap: 1 }}>
          {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((accent) => (
            <Tooltip key={accent} title={accent[0].toUpperCase() + accent.slice(1)}>
              <Box
                component="button"
                aria-label={`${accent} accent`}
                onClick={() => update({ accentColor: accent })}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor:
                    settings.accentColor === accent ? "text.primary" : "transparent",
                  bgcolor: ACCENT_COLORS[accent][mode],
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 0,
                }}
              >
                {settings.accentColor === accent && (
                  <CheckIcon
                    fontSize="small"
                    sx={{ color: mode === "light" ? "#fff" : "#000" }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Section>

      <Section title="Transitions">
        <TextField
          select
          size="small"
          label="Effect between images"
          value={settings.transition}
          onChange={(e) =>
            update({ transition: e.target.value as ISettings["transition"] })
          }
          sx={{ mt: 2, minWidth: "14rem" }}
        >
          <MenuItem value="none">None (instant)</MenuItem>
          <MenuItem value="crossfade">Crossfade</MenuItem>
          <MenuItem value="fade-black">Fade out, then in</MenuItem>
          <MenuItem value="slide">Slide</MenuItem>
        </TextField>

        <Label>Transition speed</Label>
        <Box px={1}>
          <Slider
            aria-label="Transition speed"
            disabled={settings.transition === "none"}
            value={settings.transitionDuration}
            onChange={(_, value) => update({ transitionDuration: value as number })}
            min={100}
            max={2000}
            step={100}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value / 1000}s`}
          />
        </Box>
      </Section>

      <Section title="Slideshow">
        <TextField
          size="small"
          type="number"
          label="Default interval (seconds)"
          value={settings.defaultInterval}
          onChange={(e) => {
            const defaultInterval = +e.target.value;
            if (defaultInterval > 0) update({ defaultInterval });
          }}
          inputProps={{ min: 1 }}
          sx={{ mt: 2, minWidth: "14rem" }}
        />

        <Label>Image size</Label>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={settings.imageFit}
          onChange={(_, imageFit) => imageFit && update({ imageFit })}
        >
          <ToggleButton value="contain">Fit whole image</ToggleButton>
          <ToggleButton value="cover">Fill screen (crop)</ToggleButton>
        </ToggleButtonGroup>

        <Label>Background</Label>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={settings.slideshowBackground}
          onChange={(_, slideshowBackground) =>
            slideshowBackground && update({ slideshowBackground })
          }
        >
          <ToggleButton value="theme">Theme</ToggleButton>
          <ToggleButton value="black">Black</ToggleButton>
          <ToggleButton value="gray">Gray</ToggleButton>
          <ToggleButton value="white">White</ToggleButton>
        </ToggleButtonGroup>

        <FormGroup sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!settings.showImmersiveBackground}
                onChange={(e) =>
                  update({ showImmersiveBackground: e.target.checked })
                }
              />
            }
            label="Immersive background (blurred copy of the image)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!settings.showImagePath}
                onChange={(e) => update({ showImagePath: e.target.checked })}
              />
            }
            label="Show image path"
          />
        </FormGroup>
      </Section>

      <Section title="Image adjustments">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!settings.grayscale}
                onChange={(e) => update({ grayscale: e.target.checked })}
              />
            }
            label="Grayscale (helps judge values)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!settings.mirror}
                onChange={(e) => update({ mirror: e.target.checked })}
              />
            }
            label="Mirror images horizontally"
          />
        </FormGroup>

        <Label>Contrast</Label>
        <Box px={1}>
          <Slider
            aria-label="Contrast multiplier"
            value={settings.contrastMultiplier ?? 1}
            getAriaValueText={formatContrastMultiplierText}
            valueLabelFormat={formatContrastMultiplierText}
            step={0.05}
            marks
            min={1}
            max={1.3}
            valueLabelDisplay="auto"
            onChange={(_, value) =>
              update({
                contrastMultiplier: (value as number) > 1 ? (value as number) : undefined,
              })
            }
          />
        </Box>
      </Section>

      <Section title="Controls">
        <Label>Hide controls after</Label>
        <Box px={1}>
          <Slider
            aria-label="Hide controls after"
            value={settings.controlsHideDelay}
            onChange={(_, value) => update({ controlsHideDelay: value as number })}
            min={1}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}s`}
          />
        </Box>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!settings.hideCursorWhenIdle}
                onChange={(e) => update({ hideCursorWhenIdle: e.target.checked })}
              />
            }
            label="Hide mouse pointer with the controls"
          />
        </FormGroup>
      </Section>

      <Button
        className="wide"
        variant="outlined"
        onClick={() =>
          update({
            ...DEFAULT_SETTINGS,
            showImagePath: false,
            showImmersiveBackground: false,
            contrastMultiplier: undefined,
          })
        }
      >
        Reset to defaults
      </Button>
    </div>
  );
}
