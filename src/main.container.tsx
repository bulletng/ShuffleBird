import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import MainMenu from "./components/MainMenu";
import ImageSlider from "./components/ImageSlider/ImageSlider";
import { getSettings, ISettings } from "./utils/localStorage";
import { buildTheme, onSystemThemeChange } from "./utils/theme";

interface IProps { }

interface IState {
  selectedFolders: string[];
  interval?: number;
  sessionLimitEnabled: boolean;
  sessionImageCount: number;
  settings: ISettings;
}

export default class Main extends React.Component<IProps, IState> {
  removeSystemThemeListener?: () => void;

  constructor(props: any) {
    super(props);
    this.state = {
      selectedFolders: null,
      interval: null,
      sessionLimitEnabled: false,
      sessionImageCount: 5,
      settings: getSettings(),
    };
  }

  componentDidMount(): void {
    // Re-render when the OS theme changes, for the "System" theme option
    this.removeSystemThemeListener = onSystemThemeChange(() =>
      this.forceUpdate(),
    );
  }

  componentWillUnmount(): void {
    this.removeSystemThemeListener?.();
  }

  onDirselected = (
    dirs: string[],
    interval: number,
    sessionLimitEnabled: boolean,
    sessionImageCount: number
  ) => {
    this.setState({
      selectedFolders: dirs,
      interval,
      sessionLimitEnabled,
      sessionImageCount,
    });
  };

  returnToMainMenu = () => this.setState({ selectedFolders: null })

  onSettingsChange = (settings: ISettings) => this.setState({ settings });

  render(): any {
    return (
      <ThemeProvider theme={buildTheme(this.state.settings)}>
        {this.state.selectedFolders?.length ? (
          <ImageSlider
            folders={this.state.selectedFolders}
            onStop={this.returnToMainMenu}
            interval={this.state.interval}
            sessionLimitEnabled={this.state.sessionLimitEnabled}
            sessionImageCount={this.state.sessionImageCount}
          />
        ) : (
          <MainMenu
            onDirSelected={this.onDirselected}
            settings={this.state.settings}
            onSettingsChange={this.onSettingsChange}
          />
        )}
      </ThemeProvider>
    );
  }
}
