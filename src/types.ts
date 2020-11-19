type SankeyAlign = 'Left' | 'Right' | 'Center' | 'Justify';
type EdgeColor = 'input' | 'output' | 'path' | 'none';
export interface SankeyOptions {
  align: SankeyAlign;
  edgeColor: EdgeColor;
}
