// @ts-nocheck
import React from 'react';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { PanelProps } from '@grafana/data';
import { SankeyOptions } from 'types';

interface Props extends PanelProps<SankeyOptions> {}

export const SankeyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  // -----------------------    CHART CONSTANTS    -----------------------
  const CHART_REQUIRED_FIELDS = { source: 'source', target: 'target', value: 'value' };
  const DISPLAY_VALUES = { total: 'total', percentage: 'percentage', both: 'both', none: 'none' };

  // -----------------------  CHART CONFIGURATION  -----------------------
  const config = {
    background: '#f8f8fa',
    align: options.align,
    colorScheme: options.colorScheme,
    edgeColor: options.edgeColor,
    displayValues: options.displayValues,
    highlightOnHover: options.highlightOnHover
  };

  // ----------------------- BASE DATA ACQUISITION -----------------------
  const frame = data.series[0];
  const dataLen = frame.length;
  const indices = d3.range(dataLen);

  // -----------------------       ACCESSORS      -----------------------
  const sourceAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.source);
  const targetAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.target);
  const valueAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);

  // -----------------------      VALIDATIONS     -----------------------
  if (!(sourceAccesor && targetAccesor && valueAccesor)) {
    throw new Error(`Required fields not present: ${Object.keys(CHART_REQUIRED_FIELDS).join(', ')}`);
  }

  // -----------------------  CHART FIELD VALUES  -----------------------
  const sources = sourceAccesor.values.toArray();
  const targets = targetAccesor.values.toArray();
  const values = valueAccesor.values.toArray();

  const zip = d3.zip(sources, targets, values);

  const nodes = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node }));
  const links = zip.map(d => ({ source: d[0], target: d[1], value: +d[2].toFixed(2) }));
  const graph = { nodes, links };

  // -----------------------    CHART DIMENSIONS  -----------------------
  const dimensions = {
    width: width,
    height: height,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
  };

  dimensions.boundedWidth = dimensions.width - dimensions.marginLeft - dimensions.marginRight;
  dimensions.boundedHeight = dimensions.height - dimensions.marginTop - dimensions.marginBottom;

  // -----------------------    CHART ELEMENTS    -----------------------
  // COLOR
  const colorScale = d3.scaleOrdinal(d3[`scheme${config.colorScheme}`]);
  const color = node => colorScale(node.name);

  // SANKEY GENERATOR
  const sankeyAlign = d3Sankey[`sankey${config.align}`];

  const sankeyConfig = d3Sankey
    .sankey()
    .nodeId(d => d.name)
    .nodeAlign(sankeyAlign)
    .nodeWidth(15)
    .nodePadding(20)
    .extent([
      [1, 5],
      [dimensions.boundedWidth - 1, dimensions.boundedHeight - 5],
    ]);

  const sankey = ({ nodes, links }) =>
    sankeyConfig({
      nodes: nodes.map(d => Object.assign({}, d)),
      links: links.map(d => Object.assign({}, d)),
    });

  // NODE LABELING
  const formatValue = value => d3.format('.2~f')(value);
  const formatPercent = percent => d3.format('.2~%')(percent);
  const formatThousand = value => d3.format('.3~s')(value);

  const labelNode = (nodes, currentNode) => {
    const nodesAtDepth = nodes.filter(node => node.depth === currentNode.depth);
    const totalAtDepth = d3.sum(nodesAtDepth, node => node.value);
    const nodeValue = formatThousand(currentNode.value);
    const nodePercent = formatPercent(currentNode.value / totalAtDepth);

    let label = currentNode.name;
    switch (config.displayValues) {
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

  // NODE HOVER
  const showLinks = (currentNode, svgBounds) => {
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
    svgBounds
      .selectAll('.sankey-node')
      .style('opacity', node =>
        currentNode.name === node.name || linkedNodes.find(linkedNode => linkedNode.name === node.name) ? '1' : '0.2'
      );
    // highlight links
    svgBounds
      .selectAll('.sankey-link')
      .style('opacity', link =>
        link && (link.source.name === currentNode.name || link.target.name === currentNode.name) ? '1' : '0.2'
      );
  };

  const showAll = svgBounds => {
    svgBounds.selectAll('.sankey-node').style('opacity', '1');
    svgBounds.selectAll('.sankey-link').style('opacity', '1');
  };

  // ------------------------------- CHART  ------------------------------
  const chart = svg => {
    // SVG STYLING
    svg.style('background-color', config.background);

    // VALIDATION
    if (!(sources.length && targets.length && values.length)) {
      svg
        .append('text')
        .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`)
        .attr('text-anchor', 'middle')
        .text('No data supplied');
      return;
    }

    // BOUNDS
    const bounds = svg.append('g').attr('transform', `translate(${dimensions.marginLeft}, ${dimensions.marginTop})`);

    const { nodes, links } = sankey(graph);

    // NODES
    const node = bounds
      .append('g')
      .attr('stroke', '#000')
      .selectAll('sankey-node')
      .data(nodes, node => node.name)
      .join('rect')
      .attr('class', 'sankey-node')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('stroke', d => d3.color(color(d)).darker(0.5))
      .attr('fill', color)
      .on('mouseover', d => config.highlightOnHover && showLinks(d, bounds))
      .on('mouseout', _ => config.highlightOnHover && showAll(bounds));

    // LINKS
    const link = bounds
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.3)
      .selectAll('g')
      .data(links, link => `${link.source.name}-${link.target.name}`)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    // LINKS STYLING
    if (config.edgeColor === 'path') {
      const gradient = link
        .append('linearGradient')
        .attr('id', d => (d.uid = `link-${d.index}-${Math.random()}`))
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', d => d.source.x1)
        .attr('x2', d => d.target.x0);

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d => color(d.source));

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d => color(d.target));
    }

    link
      .append('path')
      .attr('class', 'sankey-link')
      .attr('d', d3Sankey.sankeyLinkHorizontal())
      .attr('stroke', d =>
        config.edgeColor === 'none'
          ? '#aaa'
          : config.edgeColor === 'path'
          ? `url(#${d.uid})`
          : config.edgeColor === 'input'
          ? color(d.source)
          : color(d.target)
      )
      .attr('stroke-width', d => Math.max(1, d.width));

    // LABELS
    bounds
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 < width / 2 ? 'start' : 'end'))
      .text(d => labelNode(nodes, d));

    node.append('title').text(d => `${d.name}\n${formatValue(d.value)}`);
    link.append('title').text(d => `${d.source.name} → ${d.target.name}\n${formatValue(d.value)}`);
  };

  return (
    <svg
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      ref={node => {
        d3.select(node)
          .selectAll('*')
          .remove();
        d3.select(node).call(chart);
      }}
    />
  );
};
