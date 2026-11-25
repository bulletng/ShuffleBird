import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormGroup,
  Input,
  InputAdornment,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { useState } from "react";
import { AutoButtonGroup } from "./ButtonGroup";

interface IProps {
  selectedInterval?: number;
  onSetInterval: (interval: number) => void;
  onBack: () => void;
  start: (sessionLimitEnabled: boolean, sessionImageCount: number) => void;
}

const intervals = [
  { name: "No Interval", value: Infinity },
  { name: "3s", value: 3 },
  { name: "5s", value: 5 },
  { name: "10s", value: 10 },
  { name: "15s", value: 15 },
  { name: "30s", value: 30 },
  { name: "60s", value: 60 },
];

// Display options (image path, contrast, etc.) live on the Settings page
export function IntervalSelector(props: IProps) {
  const [sessionCount, setSessionCount] = useState(0);

  const handleSessionCountChange = (count: number) => {
    setSessionCount(count);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={props.onBack}
          aria-label="back"
        >
          back
        </Button>
      </div>
      <p>Select Interval (seconds)</p>
      <div>
        <Box my={1}>
          <AutoButtonGroup
            choices={intervals}
            selected={props.selectedInterval}
            onSelect={props.onSetInterval}
          />
          <Input
            size="small"
            onChange={(e) => {
              const value = e.target.value || "";
              if (!value) return props.onSetInterval(Infinity);
              const interval = +value.replace("-", "");
              !isNaN(interval) && interval > 0 && props.onSetInterval(interval);
            }}
            value={
              props.selectedInterval === Infinity
                ? "-"
                : (props.selectedInterval ?? "")
            }
            endAdornment={<InputAdornment position="end">s</InputAdornment>}
            sx={{
              mx: 1,
              maxWidth: "5rem",
              input: {
                textAlign: "center",
              },
            }}
          ></Input>
        </Box>
      </div>
      <div>
        <Box mb={1}>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDown />}>
              Session length
            </AccordionSummary>
            <AccordionDetails sx={{ marginInline: "20px 0" }}>
              <FormGroup>
                {/* Sellect session limit */}
                <Box>
                  <p>Number of images</p>
                  <AutoButtonGroup
                    choices={[
                      { name: "No Limit", value: 0 },
                      { name: "5", value: 5 },
                      { name: "10", value: 10 },
                      { name: "15", value: 15 },
                      { name: "20", value: 20 },
                      { name: "40", value: 40 },
                    ]}
                    selected={sessionCount}
                    onSelect={handleSessionCountChange}
                  />
                  <Input
                    size="small"
                    onChange={(e) => {
                      const value = e.target.value || "";
                      if (!value) return handleSessionCountChange(0);
                      const sessionCount = +value.replace("-", "");
                      !isNaN(sessionCount) &&
                        sessionCount > 0 &&
                        handleSessionCountChange(sessionCount);
                    }}
                    value={sessionCount}
                    sx={{
                      mx: 1,
                      maxWidth: "5rem",
                      input: {
                        textAlign: "center",
                      },
                    }}
                  ></Input>
                  <p
                    style={{
                      color: "gray",
                      visibility:
                        props.selectedInterval != null &&
                        props.selectedInterval !== Infinity &&
                        props.selectedInterval > 0 &&
                        sessionCount > 0
                          ? "visible"
                          : "hidden",
                    }}
                  >
                    Session time: ~
                    {props.selectedInterval * sessionCount < 60
                      ? `${props.selectedInterval * sessionCount} s`
                      : `${Math.ceil((props.selectedInterval * sessionCount) / 60)} min`}
                  </p>
                </Box>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </Box>
      </div>
      <div>
        <Button
          variant="contained"
          className="wide"
          onClick={() => props.start(true, sessionCount)}
        >
          Start
        </Button>
      </div>
    </div>
  );
}
