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
    });
});
