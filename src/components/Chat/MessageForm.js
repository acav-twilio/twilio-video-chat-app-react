import React, { Component, Button } from 'react';
import PropTypes from 'prop-types';
import './MessageForm.css';
import { styled } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';

const Container = styled('form')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  gridTemplateColumns: '25px 1fr',
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

class MessageForm extends Component {
  static propTypes = {
    onMessageSend: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.input.focus();
  };

  handleFormSubmit = event => {
    event.preventDefault();
    this.props.onMessageSend(this.input.value);
    this.input.value = '';
  };

  render() {
    return (
      <Container className="MessageForm" onSubmit={this.handleFormSubmit}>
        <div className="input-container">
          <input type="text" ref={node => (this.input = node)} placeholder="Enter your message..." />
        </div>
        <div className="button-container">
          <IconButton type="submit" color="secondary" aria-label="send">
            <SendIcon fontSize="small" color="primary" />
          </IconButton>
        </div>
      </Container>
    );
  }
}

export default MessageForm;
