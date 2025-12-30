import { MdGridOn, MdTimeline, MdLinearScale, MdAutoFixHigh } from "react-icons/md";

export default [
    {
        id: 'ToggleOSnap',
        shortName: 'OSNAP',
        kind: 'Mode',
        description: 'Toggle Object Snap (F3)',
        icon: MdLinearScale,
        invoke: (ctx) => {
            ctx.viewer.toggleOSnap();
        }
    },
    {
        id: 'ToggleOrtho',
        shortName: 'Ortho',
        kind: 'Mode',
        description: 'Toggle Ortho Mode (F8)',
        icon: MdGridOn,
        invoke: (ctx) => {
            ctx.viewer.toggleOrtho();
        }
    },
    {
        id: 'TogglePolar',
        shortName: 'Polar',
        kind: 'Mode',
        description: 'Toggle Polar Tracking (F10)',
        icon: MdTimeline,
        invoke: (ctx) => {
            ctx.viewer.togglePolar();
        }
    },
    {
        id: 'ToggleSmartGuides',
        shortName: 'Smart Guides',
        kind: 'Mode',
        description: 'Toggle Smart Guides (F11)',
        icon: MdAutoFixHigh,
        invoke: (ctx) => {
            ctx.viewer.toggleSmartGuides();
        }
    },
];
