import { getSketcherAction } from "../actions";
import React, { useContext } from "react";
import { SketcherAppContext } from "./SketcherAppContext";
import { useStream } from "ui/effects";

export function SketcherActionButton({ actionId, text = false }) {

  const action = getSketcherAction(actionId);

  if (!action) {
    return <span>?{actionId}?</span>;
  }

  const ctx = useContext(SketcherAppContext);

  // Check if this is a toggle action for OSNAP, Ortho, or Polar
  let isActive = false;
  if (actionId === 'ToggleOSnap') {
    isActive = useStream(ctx => ctx.viewer.streams.osnapEnabled);
  } else if (actionId === 'ToggleOrtho') {
    isActive = useStream(ctx => ctx.viewer.streams.orthoMode);
  } else if (actionId === 'TogglePolar') {
    isActive = useStream(ctx => ctx.viewer.streams.polarMode);
  } else if (actionId === 'ToggleSmartGuides') {
    isActive = useStream(ctx => ctx.viewer.streams.smartGuides);
  }

  const Icon = action.icon;

  const buttonStyle = isActive ? {
    backgroundColor: '#66bb6a',
    borderColor: '#66bb6a',
    color: 'white'
  } : {};

  return <button
    onClick={e => action.invoke(ctx, e)}
    title={action.description}
    className={`action-kind-${action.kind} ${text ? 'icon-button' : ''}`}
    style={buttonStyle}
  >
    {Icon && <Icon />} {(text || !Icon) && action.shortName}
  </button>;

}
