type SankeyAlign = 'Left' | 'Right' | 'Center' | 'Justify';
type EdgeColor = 'input' | 'output' | 'path' | 'none';
type DisplayValues = 'total' | 'percentage' | 'both' | 'none';

export interface SankeyOptions {
  align: SankeyAlign;
  edgeColor: EdgeColor;
  displayValues: DisplayValues;
}
