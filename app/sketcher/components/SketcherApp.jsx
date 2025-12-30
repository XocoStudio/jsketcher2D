import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ConstraintEditor } from './ConstraintEditor';
import { ContextualControls } from './ContextualControls';
import { ConstraintList } from './ConstraintExplorer';
import { StreamsContext } from 'ui/streamsContext';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SketcherOperationWizard from "./SketcherOperationWizard";
import { Scope } from "./Scope";
import { SketcherToolbar } from "./SketcherToolbar";
import { sketcherRightToolbarConfig, sketcherTopToolbarConfig } from "../uiConfig";
import { SketchManager } from "./SketchManager";
import { ExportDialog } from "./ExportDialog";
import { SketcherPropertiesView } from "./SketcherPropertiesView";
import { SketcherDimensionView } from "./SketcherDimensionsView";
import { SketcherTerminal } from "./TerminalView";
import { SketcherActionButton } from "./SketcherActionButton";

import { SketcherAppContext } from './SketcherAppContext';

export { SketcherAppContext };

export function SketcherApp({ applicationContext }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !applicationContext.viewer) {
      applicationContext.initViewer(canvasRef.current);
      if (applicationContext.onViewerReady) {
        applicationContext.onViewerReady();
      }
    }
  }, [applicationContext]);

  return <SketcherAppContext.Provider value={applicationContext}>
    <StreamsContext.Provider value={applicationContext}>
      <Scope><ToastContainer /></Scope>

      {/* Modern Layout Structure */}
      <div className="app-container">

        {/* Header / Top Bar */}
        <header className="top-bar">
          <div className="logo-section">
            <span className="logo-text">Sketcher <span className="logo-highlight">2D</span></span>
          </div>
          <div id="top-toolbar" className="toolbar-area">
            <Scope><SketcherToolbar actions={sketcherTopToolbarConfig} horizontal compact /></Scope>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="workspace">

          {/* Left Dock */}
          <aside id="dock" className="sidebar left-sidebar scroll">
            <div id="constraint-list"><Scope><ConstraintList /></Scope></div>
            <div id="properties-view"><Scope><SketcherPropertiesView /></Scope></div>
            <div id="dimension-view"><Scope><SketcherDimensionView /></Scope></div>
            <RightSideControls />
          </aside>

          {/* Viewer / Canvas Area */}
          <section id="viewer-container" class="canvas-area">
            <div id="react-controls"></div>
            <div className="tool-hint"></div>
            <canvas id="viewer" ref={canvasRef}></canvas>
          </section>

          {/* Right Toolbar */}
          <aside id="right-toolbar" class="sidebar right-sidebar scroll">
            <Scope><SketcherToolbar actions={sketcherRightToolbarConfig} /></Scope>
          </aside>

        </main>

        {/* Status Bar */}
        <footer id="status" class="status-bar">
          <div className="button-group">
            <Scope><SketchManager /></Scope>
            <Scope><ExportDialog /></Scope>
            <span className="separator" style={{ margin: '0 10px', borderLeft: '1px solid #444', height: '16px' }}></span>
            <Scope><SketcherActionButton actionId="ToggleOSnap" text /></Scope>
            <Scope><SketcherActionButton actionId="ToggleOrtho" text /></Scope>
            <Scope><SketcherActionButton actionId="TogglePolar" text /></Scope>
            <Scope><SketcherActionButton actionId="ToggleSmartGuides" text /></Scope>
          </div>
          <div className="status-info">
            <span className="status-item coordinates-info">0.000 : 0.000</span>
            <span class="status-item tool-info"></span>
          </div>
        </footer>

      </div>

      {/* Global Overlays */}
      <div id="global-windows">
        <Scope><SketcherTerminal /></Scope>
      </div>

    </StreamsContext.Provider>
  </SketcherAppContext.Provider>;

}

function RightSideControls() {
  return <React.Fragment>
    <Scope><ContextualControls /></Scope>
    <Scope><ConstraintEditor /></Scope>
    <Scope><SketcherOperationWizard /></Scope>
  </React.Fragment>
}