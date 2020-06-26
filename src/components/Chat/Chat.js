import React, { Component } from 'react';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import TwilioChat from 'twilio-chat';
import $ from 'jquery';
import './Chat.css';

import { styled } from '@material-ui/core/styles';

const Container = styled('aside')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'grid',
  gridTemplateRows: '1fr 25px',
  padding: '0.5em',
  overflowY: 'auto',
  backgroundColor: '#FFFFFF11',
  [theme.breakpoints.down('xs')]: {
    overflowY: 'initial',
    overflowX: 'auto',
    padding: 0,
    display: 'flex',
  },
}));

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      username: props.identity,
      room: props.room,
      channel: null,
      token: props.token,
    };
  }

  setChatCredentials = (r, id) => {
    //ACAV not used
    this.setState({ username: id });
    this.setState({ room: r });
  };

  componentDidMount = () => {
    console.log(this.state.room); //ACAV creation of chat instance + join channel based on token
    if (this.state.token === '') {
      this.getToken()
        .then(this.createChatClient)
        .then(this.joinGeneralChannel)
        .then(this.configureChannelEvents)
        .catch(error => {
          this.addMessage({ body: `Error: ${error.message}` });
        });
    } else {
      console.log(this.state.token);
      this.createChatClient(this.state.token)
        .then(this.joinGeneralChannel)
        .then(this.configureChannelEvents)
        .catch(error => {
          this.addMessage({ body: `Error: ${error.message}` });
        });
    }
  };

  getToken = () => {
    return new Promise((resolve, reject) => {
      //this.addMessage({ body: 'Connecting...' });

      $.getJSON(`/token-chat?identity=${this.state.username}&roomName=${this.state.room}`, token => {
        this.setState({ username: token.identity });
        resolve(token);
      }).fail(() => {
        reject(Error('Failed to connect.'));
      });
    });
  };

  createChatClient = token => {
    return new Promise((resolve, reject) => {
      resolve(TwilioChat.create(token.jwt));
    });
  };
  joinGeneralChannel = chatClient => {
    return new Promise((resolve, reject) => {
      chatClient
        .getSubscribedChannels()
        .then(() => {
          chatClient
            .getChannelByUniqueName(this.state.room)
            .then(channel => {
              this.addMessage({ body: 'Joining  channel...' });
              this.setState({ channel });
              channel
                .join()
                .then(() => {
                  this.addMessage({ body: `Joined  channel as ${this.state.username}` });
                  window.addEventListener('beforeunload', () => channel.leave());
                  resolve(channel);
                })
                .catch(() => reject(Error('Could not join  channel.')));
            })
            .catch(() => this.createGeneralChannel(chatClient));
        })
        .catch(() => reject(Error('Could not get channel list.')));
    });
  };

  createGeneralChannel = chatClient => {
    return new Promise((resolve, reject) => {
      this.addMessage({ body: 'Creating general channel...' });
      chatClient
        .createChannel({ uniqueName: this.state.room, friendlyName: `${this.state.room} Chat` })
        .then(() => {
          this.joinGeneralChannel(chatClient)
            .then(this.configureChannelEvents)
            .catch(error => {
              this.addMessage({ body: `Error: ${error.message}` });
            });
        })
        .catch(() => reject(Error('Could not create general channel.')));
    });
  };

  addMessage = message => {
    const messageData = { ...message, me: message.author === this.state.username };
    this.setState({
      messages: [...this.state.messages, messageData],
    });
  };

  handleNewMessage = text => {
    if (this.state.channel) {
      this.state.channel.sendMessage(text);
    }
  };

  configureChannelEvents = channel => {
    this.addMessage({ body: 'Configuring channel...' });

    channel.on('messageAdded', ({ author, body }) => {
      this.addMessage({ author, body });
    });

    channel.on('memberJoined', member => {
      this.addMessage({ body: `${member.identity} has joined the channel.` });
    });

    channel.on('memberLeft', member => {
      this.addMessage({ body: `${member.identity} has left the channel.` });
    });
  };

  render() {
    return (
      <Container>
        <MessageList messages={this.state.messages} />
        <MessageForm onMessageSend={this.handleNewMessage} />
      </Container>
    );
  }
}

export default Chat;
