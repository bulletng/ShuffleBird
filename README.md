# ShuffleBird <img src="src/logo.png" alt="logo" width="22">

A random image viewer for artists. Point it at a folder (or a saved collection of folders) and it shows a timed slideshow of random images, which is handy for gesture drawing, studies and reference practice with your own local images.

This is a personal fork of [PuffedUpBirdie/ShuffleBird](https://github.com/PuffedUpBirdie/ShuffleBird) with extra features and fixes.

## Features

- **Timed slideshows** in seconds (3s default, presets up to 60s, or any custom value), or no timer at all.
- **No repeats**: every image is shown once before any repeat, then the order reshuffles and starts over.
- **Collections** of folders with a thumbnail preview and folder path, sortable newest/oldest first. New collections are named after their first folder automatically.
- **Session limits**: stop after a set number of images.
- **Transitions** between images: crossfade, fade out/in, slide or none, with adjustable speed.
- **Distraction-free viewing**: the controls and mouse pointer hide when the mouse is idle, and true fullscreen is one key away (F11).
- **Study aids**: grayscale (for judging values), mirror (for spotting drawing errors), contrast boost, and a black, gray or white background.
- **Themes**: dark, light or follow Windows, with a choice of accent colors.

Supported formats: JPG/JPEG (any capitalisation, e.g. `.JPG`), PNG and WebP.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Right / Left arrow | Next / previous image |
| Space | Pause / resume |
| Esc | Stop the slideshow (press again to exit) |
| F11 | Toggle fullscreen (anywhere in the app) |

## Changes in 1.4.0

- Fixed `.JPG` files (uppercase extension) being skipped, which made slideshows show blank.
- Added the Settings page (themes, transitions, image adjustments, control behaviour).
- Added no-repeat shuffling, collection thumbnails and sorting, second-based intervals.
- Added F11 and a main-menu button for fullscreen.
- Empty or missing folders now show a "No images found" message instead of a blank screen.

## Building from source

Requires [Node.js](https://nodejs.org/) 20.

```bash
npm install
npm start          # run in development mode
npm run make       # build the Windows installer and portable zip into out/make
```

Builds are not code-signed, so Windows SmartScreen may warn on first launch: choose **More info → Run anyway**.

## Credits and license

Originally created by [PuffedUpBirdie](https://github.com/PuffedUpBirdie/ShuffleBird). Licensed under the LGPL-3.0-or-later, as in the original project.
