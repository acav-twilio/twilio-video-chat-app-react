import React from 'react';
import ParticipantStrip from '../ParticipantStrip/ParticipantStrip';
import { styled } from '@material-ui/core/styles';
import MainParticipant from '../MainParticipant/MainParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import Chat from '../Chat/Chat.js';

const Container = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'grid',
  gridTemplateColumns: `${theme.sidebarWidth}px 1fr ${theme.sidebarWidth}px`,
  gridTemplateAreas: '". participantList"',
  gridTemplateRows: '100%',
  [theme.breakpoints.down('xs')]: {
    gridTemplateAreas: '"participantList" "."',
    gridTemplateColumns: `auto`,
    gridTemplateRows: `calc(100% - ${theme.sidebarMobileHeight + 12}px) ${theme.sidebarMobileHeight + 6}px`,
    gridGap: '6px',
  },
}));

export default function Room() {
  const { room, token } = useVideoContext();
  const roomName = room.name;
  const identity = room.localParticipant.identity;
  console.log(room.name);
  console.log(room.localParticipant.identity);
  console.log(token); //acav check
  return (
    <>
      <Container>
        <ParticipantStrip />
        <MainParticipant />
        <Chat identity={identity} room={roomName} token={token} />{' '}
        {
          //ACAV Chat is a slave component of the room and will only be created if the token for the video works
        }
      </Container>
    </>
  );
}
