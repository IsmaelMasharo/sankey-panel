// @ts-nocheck
import React from 'react';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { PanelProps } from '@grafana/data';
import { SankeyOptions } from 'types';
import { Sankey } from 'Sankey'

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
    highlightOnHover: options.highlightOnHover,
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

  // ------------------------------- CHART  ------------------------------
  const chart = svg => {
    const sankey = new Sankey(svg)
      .width(width)
      .height(height)
      .data(graph)
    
    sankey.render()
    return svg

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
