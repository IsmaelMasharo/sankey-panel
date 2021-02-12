type SankeyAlign = 'Left' | 'Right' | 'Center' | 'Justify';
type EdgeColor = 'input' | 'output' | 'path' | 'none';
type DisplayValues = 'total' | 'percentage' | 'both' | 'none';
type Color =
  | 'Category10'
  | 'Accent'
  | 'Dark2'
  | 'Paired'
  | 'Pastel1'
  | 'Pastel2'
  | 'Set1'
  | 'Set2'
  | 'Set3'
  | 'Tableau10';

export interface SankeyOptions {
  align: SankeyAlign;
  edgeColor: EdgeColor;
  colorScheme: Color;
  displayValues: DisplayValues;
  highlightOnHover: boolean;
}
