import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './FileDialogue.css';
import { styled } from '@material-ui/core/styles';

import PublishIcon from '@material-ui/icons/Publish';
import IconButton from '@material-ui/core/IconButton';

const Container = styled('form')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  gridTemplateColumns: '25px 1fr 1fr',
  //padding: '0.5em',
  overflowY: 'auto',
  backgroundColor: '#FFFFFF',
  [theme.breakpoints.down('xs')]: {
    overflowY: 'initial',
    overflowX: 'auto',
    padding: 0,
    display: 'flex',
  },
}));

function buildFileSelector() {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  // fileSelector.setAttribute('multiple', 'multiple');

  return fileSelector;
}

class FileDialogue extends Component {
  static propTypes = {
    onMessageSend: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.fileSelector = buildFileSelector();
    this.fileSelector.addEventListener('input', this.onInput);
    this.fileSelector.addEventListener('change', this.onChange);
  }

  handleFileSelect = e => {
    e.preventDefault();
    this.fileSelector.click();
  };

  onInput = event => {
    console.log('on_input happens as soon as the value has changed');
    console.log(this.fileSelector.value);
  };

  onChange = event => {
    console.log('on_change happens when the element has lost focus');
    this.form.requestSubmit();
  };
  handleFormSubmit = event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', this.fileSelector.files[0]); //also check this.fileselector[0]
    console.log(this.fileSelector.files[0]);
    this.props.onMessageSend(formData);

    this.fileSelector.value = '';

    console.log('inside form submit');
  };

  render() {
    return (
      <Container ref={node => (this.form = node)} className="MessageForm" onSubmit={this.handleFormSubmit}>
        <IconButton className="button" aria-label="select files" onClick={this.handleFileSelect}>
          <PublishIcon fontSize="large" color="primary" />
        </IconButton>
      </Container>
    );
  }
}

export default FileDialogue;
