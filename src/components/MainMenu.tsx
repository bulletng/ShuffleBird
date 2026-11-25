import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Tooltip,
} from "@mui/material";
import React from "react";
import DatasetCreation from "./CreateCollection";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Header } from "./Header";
import { FullscreenButton } from "./FullscreenButton";
import { SettingsPage } from "./SettingsPage";
import SettingsIcon from "@mui/icons-material/Settings";
import { ISettings } from "../utils/localStorage";
import { IntervalSelector } from "./IntervalSelector";

type SortOrder = "newest" | "oldest";

// Collections saved before dates were tracked get their old list order as a timestamp,
// so they sort as older than anything created from now on.
const loadCreatedDates = (
  datasets: Record<string, string[]>,
): Record<string, number> => {
  const localData = localStorage.getItem("datasetsCreated");
  const stored: Record<string, number> = localData ? JSON.parse(localData) : {};
  const created: Record<string, number> = {};
  Object.keys(datasets).forEach((name, index) => {
    created[name] = stored[name] ?? index;
  });
  return created;
};

interface IProps {
  onDirSelected(
    filepaths: string[],
    interval: number,
    sessionLimitEnabled: boolean,
    sessionImageCount: number,
  ): void;
  settings: ISettings;
  onSettingsChange(settings: ISettings): void;
}

interface IState {
  folders: string[];
  interval: number;
  datasets: Record<string, string[]>;
  datasetsCreated: Record<string, number>;
  previews: Record<string, string | null>;
  sortOrder: SortOrder;
  showDatasetCreation: boolean;
  showSettings: boolean;
  datasetToEdit?: string;
  sessionLimitEnabled: boolean;
  sessionImageCount: number;
}

export default class MainMenu extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const localData = localStorage.getItem("datasets");
    const datasets = localData ? JSON.parse(localData) : {};

    this.state = {
      folders: null,
      interval: props.settings.defaultInterval,
      datasets,
      datasetsCreated: loadCreatedDates(datasets),
      previews: {},
      sortOrder:
        localStorage.getItem("datasetsSortOrder") === "oldest"
          ? "oldest"
          : "newest",
      showDatasetCreation: false,
      showSettings: false,
      sessionLimitEnabled: false,
      sessionImageCount: 5,
    };
  }

  componentDidMount(): void {
    Object.keys(this.state.datasets).forEach(this.loadPreview);
  }

  loadPreview = (name: string) => {
    window.funcs
      .getFolderPreview(this.state.datasets[name])
      .then((preview: string | null) =>
        this.setState((state) => ({
          previews: { ...state.previews, [name]: preview },
        })),
      )
      .catch(console.error);
  };

  toggleSortOrder = () => {
    const sortOrder = this.state.sortOrder === "newest" ? "oldest" : "newest";
    localStorage.setItem("datasetsSortOrder", sortOrder);
    this.setState({ sortOrder });
  };

  getSortedDatasetNames = () => {
    const direction = this.state.sortOrder === "newest" ? -1 : 1;
    return Object.keys(this.state.datasets).sort(
      (a, b) =>
        direction *
        (this.state.datasetsCreated[a] - this.state.datasetsCreated[b]),
    );
  };

  onLoadFolder = async () => {
    const result = await window.funcs.loadFolder();
    if (result.canceled) return;

    console.log(result);

    this.setState({ folders: result.filePaths });
  };

  createNewDataset = () => this.setState({ showDatasetCreation: true });
  closeNewDataset = () => this.setState({ showDatasetCreation: false });
  saveDataSet = (name: string, folders: string[]) => {
    const newDatasets = { ...this.state.datasets };
    const newCreated = { ...this.state.datasetsCreated };
    const editing = this.state.datasetToEdit;
    // Renaming keeps the original creation date
    const createdAt = editing ? newCreated[editing] : Date.now();
    if (editing && name !== editing) {
      delete newDatasets[editing];
      delete newCreated[editing];
    }

    newDatasets[name] = folders;
    newCreated[name] = createdAt;

    this.setState({
      datasets: newDatasets,
      datasetsCreated: newCreated,
      showDatasetCreation: false,
      datasetToEdit: undefined,
    }, () => this.loadPreview(name));

    this.saveDatasets(newDatasets, newCreated);
  };

  removeDataSet = (dataset: string) => {
    const { [dataset]: _, ...rest } = this.state.datasets;
    const { [dataset]: __, ...restCreated } = this.state.datasetsCreated;
    this.setState({ datasets: rest, datasetsCreated: restCreated });

    this.saveDatasets(rest, restCreated);
  };

  saveDatasets = (
    datasets: Record<string, string[]>,
    datasetsCreated: Record<string, number>,
  ) => {
    localStorage.setItem("datasets", JSON.stringify(datasets));
    localStorage.setItem("datasetsCreated", JSON.stringify(datasetsCreated));
  };

  onSettingsChange = (settings: ISettings) => {
    // Apply a new default interval straight away
    if (settings.defaultInterval !== this.props.settings.defaultInterval)
      this.setState({ interval: settings.defaultInterval });
    this.props.onSettingsChange(settings);
  };

  formatFolders = (folders: string[]) =>
    folders.length > 1
      ? `${folders[0]} (+${folders.length - 1} more)`
      : folders[0];

  setInterval = (interval: number) => {
    this.setState({ interval });
  };

  start = (sessionLimitEnabled: boolean, sessionImageCount: number) => {
    this.props.onDirSelected(
      this.state.folders,
      this.state.interval,
      sessionLimitEnabled,
      sessionImageCount,
    );
  };

  clearFolders = () => {
    this.setState({ folders: null });
  };

  render() {
    const showDatasetForm =
      this.state.showDatasetCreation || this.state.datasetToEdit;

    return (
      <>
        <div className="main">
          {!this.state.showSettings && (
            <Tooltip title="Settings">
              <IconButton
                aria-label="settings"
                onClick={() => this.setState({ showSettings: true })}
                sx={{ position: "fixed", top: 8, right: 48, zIndex: 1 }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          <FullscreenButton />
          <div className="main-menu">
            <Header />
            {this.state.showSettings && (
              <SettingsPage
                settings={this.props.settings}
                onChange={this.onSettingsChange}
                onBack={() => this.setState({ showSettings: false })}
              />
            )}
            {!this.state.showSettings && (
            <>
            {/* Folder Selection */}
            {!this.state.folders && !showDatasetForm && (
              <div>
                <div>
                  <Button
                    className="wide"
                    variant="contained"
                    onClick={this.onLoadFolder}
                  >
                    Quick shuffle folder
                  </Button>
                </div>
                <div>
                  <div
                    style={{
                      margin: "1rem 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minHeight: "1rem",
                    }}
                  >
                    {Object.keys(this.state.datasets).length > 1 && (
                      <Button
                        size="small"
                        onClick={this.toggleSortOrder}
                        startIcon={
                          this.state.sortOrder === "newest" ? (
                            <ArrowDownwardIcon />
                          ) : (
                            <ArrowUpwardIcon />
                          )
                        }
                        sx={{ textTransform: "none" }}
                      >
                        {this.state.sortOrder === "newest"
                          ? "Newest first"
                          : "Oldest first"}
                      </Button>
                    )}
                  </div>
                  <List
                    sx={{ width: "100%", bgcolor: "background.paper" }}
                    subheader={
                      !Object.keys(this.state.datasets).length && (
                        <ListSubheader
                          component="div"
                          id="nested-list-subheader"
                        >
                          {Object.keys(this.state.datasets).length
                            ? "Collections"
                            : "You have no collections created"}
                        </ListSubheader>
                      )
                    }
                  >
                    {this.getSortedDatasetNames().map(
                      (datasetKey) => (
                        <ListItem
                          disablePadding
                          key={datasetKey}
                          sx={{
                            // Edit/delete only appear while hovering this collection
                            "& .collection-actions": {
                              opacity: 0,
                              transition: "opacity 0.2s",
                            },
                            "&:hover .collection-actions, & .collection-actions:focus-within":
                              { opacity: 1 },
                          }}
                        >
                          <ListItemButton
                            onClick={() =>
                              this.setState({
                                folders: this.state.datasets[datasetKey],
                              })
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                variant="rounded"
                                src={this.state.previews[datasetKey] ?? undefined}
                                sx={{ width: 48, height: 48, mr: 1.5 }}
                              >
                                <FolderIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={datasetKey}
                              secondary={this.formatFolders(
                                this.state.datasets[datasetKey],
                              )}
                              secondaryTypographyProps={{
                                noWrap: true,
                                title: this.state.datasets[datasetKey].join("\n"),
                              }}
                              sx={{ minWidth: 0 }}
                            />
                          </ListItemButton>
                          <Box className="collection-actions" sx={{ display: "flex" }}>
                            <IconButton
                              aria-label="edit"
                              onClick={() =>
                                this.setState({ datasetToEdit: datasetKey })
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => this.removeDataSet(datasetKey)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                      ),
                    )}
                  </List>
                </div>
                <div>
                  <Button
                    onClick={this.createNewDataset}
                    variant="contained"
                    className="wide"
                  >
                    + add new collection
                  </Button>
                </div>
              </div>
            )}

            {/* Create New Collection */}
            {showDatasetForm && (
              <DatasetCreation
                datasetToEdit={this.state.datasetToEdit}
                existingCollections={this.state.datasets}
                onSave={this.saveDataSet}
                onCancel={() =>
                  this.setState({
                    showDatasetCreation: false,
                    datasetToEdit: undefined,
                  })
                }
              />
            )}

            {/* Interval Selection */}
            {this.state.folders?.length && !showDatasetForm && (
              <IntervalSelector
                onBack={this.clearFolders}
                selectedInterval={this.state.interval}
                onSetInterval={this.setInterval}
                start={this.start}
              />
            )}
            </>
            )}
          </div>
        </div>
      </>
    );
  }
}
