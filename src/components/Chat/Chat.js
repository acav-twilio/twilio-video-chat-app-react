import React, { Component } from 'react';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import TwilioChat from 'twilio-chat';
import $ from 'jquery';
import './Chat.css';

import FileDialogue from './FileDialogue';

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
      room: props.room, //this chat belongs to a video room
      channel: null,
      token: props.token, //this chat was created after having been granted access to a video room and I am using the same tokem
    };
  }

  setChatCredentials = (r, id) => {
    //ACAV not used
    this.setState({ username: id });
    this.setState({ room: r });
  };

  componentDidMount = () => {
    console.log(`componentdiddmount ${this.state.room}`); //ACAV creation of chat instance + join channel based on token
    if (this.state.token === '') {
      this.getToken()
        .then(this.createChatClient)
        .then(this.joinGeneralChannel)
        .then(this.configureChannelEvents)
        .catch(error => {
          this.addMessage({ body: `Error: ${error.message}` });
        });
    } else {
      console.log(`inside create chat client ${this.state.token}`);
      this.createChatClient(this.state.token)
        .then(this.joinGeneralChannel)
        .then(this.configureChannelEvents)
        .catch(error => {
          console.log(`Error: ${error.message}`);
          this.addMessage({ body: `Error: ${error.message}` });
        });
    }
  };

  componentWillUnmount = () => {
    this.state.channel.leave(); //when the object is destroyed it means that the video call has finished or stopped --> leave the channel
    console.log('leaving the chat');
  };

  getToken = () => {
    //ACAV not used in this version as one token used with both video and chat
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
      //resolve(TwilioChat.create(token.jwt)); //ACAV string returned directly - no JWT object!
      resolve(TwilioChat.create(token));
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
              //this.addMessage({ body: 'Joining  channel...' });
              this.setState({ channel });
              channel
                .join()
                .then(() => {
                  this.addMessage({ body: ` ${this.state.username} joined the session` });
                  window.addEventListener('beforeunload', () => channel.leave());
                  resolve(channel);
                })
                .catch(error => {
                  this.addMessage({ body: `Error: ${error.message}` });
                  reject(Error('Could not join  channel.'));
                });
            })
            .catch(() => this.createGeneralChannel(chatClient));
        })
        .catch(() => reject(Error('Could not get channel list.')));
    });
  };

  createGeneralChannel = chatClient => {
    return new Promise((resolve, reject) => {
      //this.addMessage({ body: 'Creating general channel...' });
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
    console.log(`inside addMessage: ${message.type}`);

    if (message.type === 'media') {
      message.media
        .getContentUrl()
        .then(Url => {
          console.log(`ur: ${Url}`);

          const messageData = { ...message, me: message.author === this.state.username, mediaUrl: Url };
          this.setState({
            messages: [...this.state.messages, messageData],
          });
        })
        .catch(e => {
          console.log(`ERROR: ${e}`);
        });
    } else {
      console.log(`inside else in addmessage ${message.filename}`);
      const messageData = { ...message, me: message.author === this.state.username };
      this.setState({
        messages: [...this.state.messages, messageData],
      });
    }
  };

  handleNewMessage = text => {
    console.log(`handle new message ${text}`);
    if (this.state.channel) {
      this.state.channel.sendMessage(text);
    }
  };

  handleNewMedia = formData => {
    //ACAV to handle sending files in formData - different call strictly not needed - makes code more readable
    console.log(formData);
    if (this.state.channel) {
      this.state.channel.sendMessage(formData);
    }
  };

  configureChannelEvents = channel => {
    //this.addMessage({ body: 'Configuring channel...' });

    channel.getMessages().then(messages => {
      const totalMessages = messages.items.length;
      for (let i = 0; i < totalMessages; i++) {
        const message = messages.items[i];
        console.log('Author:' + message.author);
        if (message.media != null) console.log('Media: ' + message.media.filename);
        this.addMessage({ author: message.author, body: message.body, type: message.type, media: message.media });
      }
      console.log('Total Messages:' + totalMessages);
    });

    /*  channel.on('messageAdded', ({ author, body }) => {
      this.addMessage({ author, body });  //ACAV  -> need to check whether it is what we are expecting
    }); */

    channel.on('messageAdded', message => {
      console.log(`messageAdded: ${message.body}`);
      this.addMessage({ author: message.author, body: message.body, type: message.type, media: message.media });
    });

    channel.on('memberJoined', member => {
      this.addMessage({ body: `${member.identity} has joined the session.` });
    });

    channel.on('memberLeft', member => {
      this.addMessage({ body: `${member.identity} has left the session.` });
    });
  };

  render() {
    return (
      <Container>
        <MessageList messages={this.state.messages} />
        <MessageForm onMessageSend={this.handleNewMessage} />
        <FileDialogue onMessageSend={this.handleNewMedia} />
      </Container>
    );
  }
}

export default Chat;
