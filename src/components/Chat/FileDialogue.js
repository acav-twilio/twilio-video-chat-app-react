import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import './FileDialogue.css';
import PublishIcon from '@material-ui/icons/Publish';
import IconButton from '@material-ui/core/IconButton';

function buildFileSelector() {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('multiple', 'multiple');
  return fileSelector;
}

class FileDialogue extends Component {
  componentDidMount() {
    this.fileSelector = buildFileSelector();
  }

  handleFileSelect = e => {
    e.preventDefault();
    this.fileSelector.click();
  };

  render() {
    return (
      <IconButton className="button" aria-label="select files" onClick={this.handleFileSelect}>
        <PublishIcon fontSize="small" color="primary" />
      </IconButton>
    );
  }
}

export default FileDialogue;
