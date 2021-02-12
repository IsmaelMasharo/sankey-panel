import { PanelPlugin } from '@grafana/data';
import { SankeyOptions } from './types';
import { SankeyPanel } from './SankeyPanel';

export const plugin = new PanelPlugin<SankeyOptions>(SankeyPanel).setPanelOptions(builder => {
  return builder
    .addSelect({
      path: 'align',
      name: 'Align',
      defaultValue: 'Justify',
      settings: {
        options: [
          {
            value: 'Justify',
            label: 'Justify',
          },
          {
            value: 'Left',
            label: 'Left',
          },
          {
            value: 'Right',
            label: 'Right',
          },
          {
            value: 'Center',
            label: 'Center',
          },
        ],
      },
    })
    .addSelect({
      path: 'colorScheme',
      name: 'Color',
      defaultValue: 'Tableau10',
      settings: {
        options: [
          {
            value: 'Tableau10',
            label: 'Tableau10',
          },
          {
            value: 'Category10',
            label: 'Category10',
          },
          {
            value: 'Accent',
            label: 'Accent',
          },
          {
            value: 'Dark2',
            label: 'Dark2',
          },
          {
            value: 'Paired',
            label: 'Paired',
          },
          {
            value: 'Pastel1',
            label: 'Pastel1',
          },
          {
            value: 'Pastel2',
            label: 'Pastel2',
          },
          {
            value: 'Set1',
            label: 'Set1',
          },
          {
            value: 'Set2',
            label: 'Set2',
          },
          {
            value: 'Set3',
            label: 'Set3',
          }
        ],
      },
    })
    .addSelect({
      path: 'edgeColor',
      name: 'Edge Color',
      defaultValue: 'path',
      settings: {
        options: [
          {
            value: 'path',
            label: 'input-output',
          },
          {
            value: 'input',
            label: 'input',
          },
          {
            value: 'output',
            label: 'output',
          },
          {
            value: 'none',
            label: 'none',
          },
        ],
      },
    })
    .addSelect({
      path: 'displayValues',
      name: 'Display Values',
      defaultValue: 'none',
      settings: {
        options: [
          {
            value: 'total',
            label: 'Totals',
          },
          {
            value: 'percentage',
            label: 'Percentages',
          },
          {
            value: 'both',
            label: 'Both',
          },
          {
            value: 'none',
            label: 'None',
          },
        ],
      },
    })
    .addBooleanSwitch({
      path: 'highlightOnHover',
      name: 'Highlight connections on node hover',
      defaultValue: false,
    })
    ;
});
