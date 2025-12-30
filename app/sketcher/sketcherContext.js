import { Viewer } from './viewer2d'
import { IO } from './io'
import React from "react";
import { state, stream } from "lstream";
import { getSketcherActionIndex } from "./actions";
import { Project } from "./project";


export function createAppContext() {
  return createEssentialAppContext();
}

export function createEssentialAppContext() {
  const applicationContext = {
    get actions() {
      return getSketcherActionIndex();
    },
    ui: {
      $constraintEditRequest: stream(),
      $wizardRequest: stream(),
      $sketchManagerRequest: stream(),
      $exportDialogRequest: stream(),
      $showTerminalRequest: state(null),
      $terminalOutput: state([])
    },
    printToTerminal(text) {
      this.ui.$terminalOutput.mutate(output => output.push({
        text
      }));
    }
  };

  applicationContext.initViewer = (canvas) => {
    applicationContext.viewer = new Viewer(canvas, IO, applicationContext);
    applicationContext.project = new Project(applicationContext.viewer);
  };

  return applicationContext;
}


