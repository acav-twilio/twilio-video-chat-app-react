import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Message.css';
import AttachFileIcon from '@material-ui/icons/AttachFile';

class Message extends Component {
  static propTypes = {
    author: PropTypes.string,
    body: PropTypes.string,
    me: PropTypes.bool,
    type: PropTypes.string,
    mediaUrl: PropTypes.string,
    media: PropTypes.object,
  };

  render() {
    const classes = classNames('Message', {
      log: !this.props.author,
      me: this.props.me,
    });

    if (this.props.type === 'media') {
      return (
        <div className={classes}>
          {this.props.author && <span className="author">{this.props.author}:</span>}
          <a className="anchor" href={this.props.mediaUrl} rel="noopener noreferrer" target="_blank">
            <AttachFileIcon fontSize="small" />
            {this.props.media.filename}{' '}
          </a>
        </div>
      );
    } else {
      return (
        <div className={classes}>
          {this.props.author && <span className="author">{this.props.author}:</span>}
          {this.props.body}
        </div>
      );
    }
  }
}

export default Message;
