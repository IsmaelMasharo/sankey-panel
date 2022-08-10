import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';

const DISPLAY_VALUES = { total: 'total', percentage: 'percentage', both: 'both', none: 'none' };
const EDGE_COLORS = { none: 'none', path: 'path', input: 'input', output: 'output'};

export class Sankey {
  constructor(svg, container) {
    this._svg = svg;
    this._container = container || svg;
    this._gBound = null;

    this._data = null;
    this._nodes = null;
    this._links = null;

    this._width = 0;
    this._height = 0;
    this._boundedWidth = 0;
    this._boundedHeight = 0;

    this._marginTop = 20;
    this._marginRight = 20;
    this._marginBottom = 20;
    this._marginLeft = 20;

    this._textColor = '#000000';
    this._edgeColor = 'path';
    this._colorScheme = 'Tableau10';
    this._colorScale = null;

    this._sankeyAlignType = 'Justify';
    this._sankeyAlign = null;
    this._sankeyGenerator = null;
    this._sankeyNodeWith = 15;
    this._sankeyNodePadding = 20;

    this._svgNode = null;
    this._svgLink = null;

    this._displayValues = 'none';
    this._highlightOnHover = false;

  }
  
  _init() {
    this._setBoundDimensions();
    this._setColorScale();
    this._configureSankey();
    this._calculateSankey();
  }

  // ----------------------------   DIMENSIONS   ----------------------------

  _setBoundDimensions() {
    this._boundedWidth = this._width - this._marginLeft - this._marginRight;
    this._boundedHeight = this._height - this._marginTop - this._marginBottom;
  }

  // ------------------------------   COLOR   -------------------------------

  _setColorScale() {
    this._colorScale = d3.scaleOrdinal(d3[`scheme${this._colorScheme}`]);
  }

  _color(node) {
    return this._colorScale(node.name);
  }

  // ------------------------------   SANKEY   -------------------------------

  _configureSankey() {
    this._sankeyAlign = d3Sankey[`sankey${this._sankeyAlignType}`];

    this._sankeyGenerator = d3Sankey
      .sankey()
      .nodeId(d => d.name)
      .nodeAlign(this._sankeyAlign)
      .nodeWidth(this._sankeyNodeWith)
      .nodePadding(this._sankeyNodePadding)
      .extent([
        [0, 0],
        [this._boundedWidth, this._boundedHeight],
      ]);
  }

  _calculateSankey() {
    const sankeyData = this._sankeyGenerator({
      nodes: this._data.nodes.map(d => Object.assign({}, d)),
      links: this._data.links.map(d => Object.assign({}, d))
    });

    this._nodes = sankeyData.nodes;
    this._links = sankeyData.links;
  }

  // ----------------------------   VALIDATIONS   -----------------------------

  _validate() {
    return this._data &&
    this._data.nodes &&
    this._data.links &&
    this._data.nodes.length > 0 &&
    this._data.links.length > 0
  }

  // ------------------------------   HELPERS   -------------------------------

  _setLinkGradient() {
    const gradient = this._svgLink
    .append('linearGradient')
      .attr('id', d => (d.uid = `link-${d.index}-${Math.random()}`))
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0);

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d => this._color(d.source));

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d => this._color(d.target));
  }

  _setLinkStroke(d) {
      switch (this._edgeColor) {
        case EDGE_COLORS.none:
          return '#aaa';
        case EDGE_COLORS.path:
          return `url(#${d.uid})`;
        case EDGE_COLORS.input:
          return this._color(d.source)
        case EDGE_COLORS.output:
          return this._color(d.target)
        default:
          return
      }
  }

  // NODE HOVER
  _showLinks(currentNode) {
    const linkedNodes = [];

    let traverse = [
      {
        linkType: 'sourceLinks',
        nodeType: 'target',
      },
      {
        linkType: 'targetLinks',
        nodeType: 'source',
      },
    ];

    traverse.forEach(step => {
      currentNode[step.linkType].forEach(l => {
        linkedNodes.push(l[step.nodeType]);
      });
    });

    // highlight linked nodes
    this._gBound
      .selectAll('.sankey-node')
      .style('opacity', node =>
        currentNode.name === node.name ||
        linkedNodes.find(linkedNode => linkedNode.name === node.name) ? 
        '1' : '0.2'
      );

    // highlight links
    this._gBound
      .selectAll('.sankey-link')
      .style('opacity', link =>
        link && (
          link.source.name === currentNode.name || 
          link.target.name === currentNode.name
        ) ? 
        '1' : '0.2'
      );
  };

  _showAll() {
    this._gBound.selectAll('.sankey-node').style('opacity', '1');
    this._gBound.selectAll('.sankey-link').style('opacity', '1');
  };

  // NODE LABELING
  _formatValue(value) {
    const display = this._data.valueDisplay(value);
    return (display.prefix ? display.prefix : '') + display.text + (display.suffix ? display.suffix : '');
  }
  _formatPercent(percent)  { return d3.format('.2~%')(percent); }

  _labelNode(currentNode) {
    const nodesAtDepth = this._nodes.filter(node => node.depth === currentNode.depth);
    const totalAtDepth = d3.sum(nodesAtDepth, node => node.value);
    const nodeValue = this._formatValue(currentNode.value);
    const nodePercent = this._formatPercent(currentNode.value / totalAtDepth);

    let label = currentNode.name;
    switch (this._displayValues) {
      case DISPLAY_VALUES.total:
        label = `${label}: ${nodeValue}`;
        break;
      case DISPLAY_VALUES.percentage:
        label = `${label}: ${nodePercent}`;
        break;
      case DISPLAY_VALUES.both:
        label = `${label}: ${nodePercent} - ${nodeValue}`;
        break;
      default:
        break;
    }
    return label;
  };

  // ------------------------------   DRAWING   -------------------------------

  _renderSVG() {
    // BOUNDS
    this._gBound = this._container.append('g')
        .attr('transform', `translate(${this._marginLeft}, ${this._marginTop})`);

    // NODES
    this._svgNode = this._gBound
      .append('g')
        .attr('stroke', '#000')
      .selectAll('.sankey-node')
      .data(this._nodes, node => node.name)
      .join('rect')
        .attr('class', 'sankey-node')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('stroke', d => d3.color(this._color(d)).darker(0.5))
        .attr('fill', d => this._color(d))
        .on('mouseover', d => this._highlightOnHover && this._showLinks(d))
        .on('mouseout', _ => this._highlightOnHover && this._showAll());

    // LINKS
    this._svgLink = this._gBound
      .append('g')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.3)
      .selectAll('g')
      .data(this._links, link => `${link.source.name}-${link.target.name}`)
      .join('g')
        .style('mix-blend-mode', 'multiply');

    if (this._edgeColor === 'path') this._setLinkGradient()

    this._svgLink
      .append('path')
        .attr('class', 'sankey-link')
        .attr('d', d3Sankey.sankeyLinkHorizontal())
        .attr('stroke', d => this._setLinkStroke(d))
        .attr('stroke-width', d => Math.max(1, d.width));    

    // LABELS
    this._gBound
      .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 12)
        .attr('fill', this._textColor)
      .selectAll('text')
      .data(this._nodes)
      .join('text')
        .attr('x', d => (d.x0 < this._width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => (d.x0 < this._width / 2 ? 'start' : 'end'))
        .text(d => this._labelNode(d));

    this._svgNode
      .append('title')
        .text(d => `${d.name}\n${this._formatValue(d.value)}`);

    this._svgLink
      .append('title')
        .text(d => `${d.source.name} → ${d.target.name}\n${this._formatValue(d.value)}`);
  }


  // -----------------------------------------------------------------------  
  // ------------------------------    API    ------------------------------
  // -----------------------------------------------------------------------  

  data(_) {
    return arguments.length ? (this._data = _, this) : this._data;
  };

  width(_) {
    return arguments.length ? (this._width = +_, this) : this._width;
  };

  height(_) {
    return arguments.length ? (this._height = +_, this) : this._height;
  };

  align(_) {
    return arguments.length ? (this._sankeyAlignType = _, this) : this._sankeyAlignType;
  }

  colorScheme(_) {
    return arguments.length ? (this._colorScheme = _, this) : this._colorScheme;
  }

  edgeColor(_) {
    return arguments.length ? (this._edgeColor = _, this) : this._edgeColor;
  }

  textColor(_) {
    return arguments.length ? (this._textColor = _, this) : this._textColor;
  }

  displayValues(_) {
    return arguments.length ? (this._displayValues = _, this) : this._displayValues;
  }

  highlightOnHover(_) {
    return arguments.length ? (this._highlightOnHover = _, this) : this._highlightOnHover;
  }

  render() {
    if (!this._validate()) {
      // no graph data
    }
    else {
      this._init();
      this._renderSVG()
    }
    return this;
  }
}
