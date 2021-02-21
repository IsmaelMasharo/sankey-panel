// @ts-nocheck
import React from 'react';
import { Icon } from '@grafana/ui';

export const ErrorMessage = ({ message }) => (  
  <p style={panelStyles}>
    <div style={containerStyles}>
      <Icon name='exclamation-triangle' />
      <div style={messageStyles}>{message}</div>
    </div>
  </p>
)

const panelStyles = {
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const containerStyles = {
  padding: '15px 20px',
  marginBottom: '4px',
  position: 'relative',
  color: 'rgb(255, 255, 255)',
  textShadow: 'rgb(0 0 0 / 20%) 0px 1px 0px',
  borderRadius: '3px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  background: 'linear-gradient(90deg, rgb(224, 47, 68), rgb(224, 47, 68))'
}

const messageStyles = {
  marginLeft: 10
}
