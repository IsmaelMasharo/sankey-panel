// @ts-nocheck
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { PanelProps } from '@grafana/data';
import { SankeyOptions } from 'types';
import { Sankey } from 'Sankey'
import { ErrorMessage } from 'Error'

interface Props extends PanelProps<SankeyOptions> {}

export const SankeyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  // ------------------------    CHART CONSTANTS    -----------------------
  const CHART_REQUIRED_FIELDS = { source: 'source', target: 'target', value: 'value' };

  // ------------------------    ERROR MESSAGES    ------------------------
  const requiredFieldsMsg = `Required fields not present: ${Object.keys(CHART_REQUIRED_FIELDS).join(', ')}`;
  const fieldTypeMsg = `Fields should have the following types: source (string), target (string), value (numeric)`;

  // -------------------------    REACT HOOKS    --------------------------
  const [ error, setError ] = useState({ isError: false, message: '' })
  const [ graph, setGraph ] = useState({ nodes: [], links: [] })

  useEffect(() => {
    data.error
    ?
      setError({isError: true, message: data.error.message})
    :
      setGraph(buildGraph())
  }, [data])

  // -------------------------  DATA ACQUISITION  -------------------------
  const validate = (sources, targets, values) => {
    let isValid = true;

    // REQUIRED FIELDS
    if (!(sources && targets && values)) {
      setError({ isError: true, message: requiredFieldsMsg })
      return isValid = false;
    }

    // FIELD TYPES
    const sourcesString = sources.every(d => typeof d === 'string')
    const targetsString = targets.every(d => typeof d === 'string')
    const valuesNumeric = values.every(d => typeof d === 'number')

    if (!(sourcesString && targetsString && valuesNumeric)) {
      setError({ isError: true, message: fieldTypeMsg })
      return isValid = false;
    }

    setError({});

    return isValid;
  }

  const buildGraph = () => {
    const frame = data.series[0];

    const sourceAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.source);
    const targetAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.target);
    const valueAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);

    const sources = sourceAccesor?.values.toArray();
    const targets = targetAccesor?.values.toArray();
    const values = valueAccesor?.values.toArray();

    const isValid = validate(sources, targets, values);
    if (!isValid) return
  
    const zip = d3.zip(sources, targets, values);
  
    const nodes = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node }));
    const links = zip.map(d => ({ source: d[0], target: d[1], value: +d[2].toFixed(2) }));
    const graph = { nodes, links };

    return graph
  }

  // ------------------------------- CHART  ------------------------------
  const chart = svg => {
    const sankey = new Sankey(svg)
      .width(width)
      .height(height)
      .align(options.align)
      .edgeColor(options.edgeColor)
      .colorScheme(options.colorScheme)
      .displayValues(options.displayValues)
      .highlightOnHover(options.highlightOnHover)
      .data(graph)

    sankey.render()
  };

  return (error.isError ?
    <ErrorMessage message={error.message} />
    :
    <svg
      viewBox={`0 0 ${width} ${height}`}
      ref={node => {
        d3.select(node)
          .selectAll('*')
          .remove();
        d3.select(node).call(chart);
      }}
    />
  );
};
