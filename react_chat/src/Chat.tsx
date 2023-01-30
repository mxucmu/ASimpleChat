import React, { useEffect, useState} from 'react';
import './Chat.css';
import { io, Socket } from 'socket.io-client';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const initialRoomList = ['Eighties', 'Ninties', 'Millenium'];

function Chat() {

  const [socket, setSocket] = useState<Socket>()

  const [loggedIn, setLoggedIn] = useState(false);

  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const [roomList, setRoomList] = useState(initialRoomList);

  const [createRoom, setCreateRoom] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [inputMessageRoom, setInputMessageRoom] = useState('');
  const [messagesRoom, setMessagesRoom] = useState<Array<[string, string]>>([]);

  const [onlineUserList, setOnlineUserList] = useState<Array<[string, string]>>([]);
  const [blockedUserList, setBlockedUserList] = useState<Array<{id:string; checked:boolean}>>([]);
  const [userRoomList, setUserRoomList] = useState<Array<[string, string]>>([]);

  const [selectUserId, setSelectUserId] = useState('');
  const [selectUserName, setSelectUserName] = useState('');
  const [privateMessaging, setPrivateMessaging] = useState(false);

  const [inputPrivate, setInputPrivate] = useState('');
  const [messagesPrivate, setMessagesPrivate] = useState<Array<[string, string]>>([]);

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  useEffect((): any => {

    //const url = "http://10.12.5.1:3001"; // 3rd floor
    const url = "http://10.11.13.1:3001"; // 4th floor
    //const url = "http://10.11.13.4:3001"; // 4th floor
    //const url = "http://10.11.14.1:3001"; // 4th floor
    //const url = "http://192.168.1.108:3001"; // home
    const newSocket: Socket = io(url, { autoConnect: false });
    setSocket(newSocket);

    return () => newSocket.close();

  }, []);
  
  // socket?.onAny((event, ...args) => {
  //   console.log(event, args);
  // });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {

    e.preventDefault();

    socket?.connect();
    setLoggedIn(true);

    if (room !== '')
    {
      socket?.emit(
        'addUser', 
        {usr: name}, 
        (data: string) => console.log("new user: " + data)
      );
  
      socket?.emit(
        'joinRoom', 
        {room: room}, 
        (data: string) => console.log("joined room " + data)
      );
    }

    if (createRoom !== '')
    {
      console.log("createdRoom=", createRoom);

      socket?.emit(
        'addUser', 
        {usr: name}, 
        (data: string) => console.log("new user: " + data)
      );

      socket?.emit(
        'addRoom', 
        {room: createRoom}, 
        (data: string) => console.log("created room " + data)
      );
  
      socket?.emit(
        'joinRoom', 
        {room: createRoom}, 
        (data: string) => console.log("joined room " + data)
      );

      setRoom(createRoom);
      setIsAdmin(true);
    }
    
  };

  const handleSelectRoom = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, selectRoom: string) => {

    e.preventDefault();

    console.log("Select room for messaging:", selectRoom);

    socket?.emit(
      'joinRoom', 
      {room: selectRoom}, 
      (data: string) => console.log("joined room " + data)
    );

    socket?.emit(
      'leaveRoom', 
      {room: room}, 
      (data: string) => console.log("left room " + data)
    );

    setRoom(selectRoom);
    setMessagesRoom([]);

  };

  const handleSelectUser = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, user: [string, string]) => {

    e.preventDefault();

    console.log("Select user for private messaging:", user);

    setPrivateMessaging(true);
    setSelectUserId(user[0]);
    setSelectUserName(user[1]);
    setMessagesPrivate([]);

  };

  const handleBlockUser = (e: React.ChangeEvent<HTMLInputElement>) => {

    console.log("block user: ", e.target.name, e.target.checked);

    const ind = blockedUserList.findIndex(each => each.id === e.target.name);
    console.log("blocked user index = ", ind);

    if ( ind === -1) {
      setBlockedUserList(list => [...list, {id: e.target.name, checked: e.target.checked}]);
    } else {
      let list = blockedUserList;
      list[ind] = {id: e.target.name, checked: e.target.checked};
      setBlockedUserList(list);
    }

    // setBlockedUserList(list => [...list, {id: e.target.name, checked: e.target.checked}]);
    console.log("blockedUserList", blockedUserList);

  };

  const removeUserFromRoom = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, user: [string, string]) => {

    e.preventDefault();

    console.log("Remove user ", user, " from chatroom ", room);

    socket?.emit(
      'removeUser',
      {id: user[0], name: user[1], room: room, admin: name}
    );

  };

  const handleSendRoomMessage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    e.preventDefault();

    console.log({room: room, name: name, message: inputMessageRoom});
    console.log(socket);

    setMessagesRoom((list) => [...list, [name, inputMessageRoom]]);

    socket?.emit(
      'msgToServer', 
      {room: room, name: name, message: inputMessageRoom}, 
      (data: any) => console.log(data)
    );

    setInputMessageRoom('');

  };

  const handleSendPrivateMessage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    e.preventDefault();

    console.log({selectUserId: selectUserId, 
        selectUserName: selectUserName, 
        senderId: socket?.id, 
        senderName: name, 
        message: inputPrivate});
    console.log(socket);

    setMessagesPrivate((list) => [...list, [name, inputPrivate]]);

    socket?.emit(
      'msgPrivateToServer', 
      {selectUserId: selectUserId, 
        selectUserName: selectUserName, 
        senderId: socket?.id, 
        senderName: name, 
        message: inputPrivate}, 
      (data: any) => console.log(data)
    );

    setInputPrivate('');

  };

  useEffect(() => {
    console.log('roomList= ', roomList)
  } , [roomList]);

  useEffect(() => {
    console.log('userRoomList= ', userRoomList)
  } , [userRoomList]);

  useEffect(() => {
    console.log('blockedUserList= ', blockedUserList)
  } , [blockedUserList]);

  useEffect(() => {
    console.log('onlineUserList= ', onlineUserList)

    onlineUserList.forEach( user => {
      setBlockedUserList( prev => [...prev.filter(
        each => each.id !== user[0]
      ), {id: user[0], checked:false}]);
    });

  } , [onlineUserList]);

  useEffect((): any => {

    socket?.on('updateUserList', ( UserNameList: Array<[string, string]> ) => {
      console.log("UserNameList: ", UserNameList);
      setOnlineUserList(UserNameList.filter(
        (user: [string, string]) => user[0] !== socket.id
      ));
      console.log("OnlineUserList: ", onlineUserList);
      
    });

    socket?.on('lostUser', ( usr_name: string ) => {
      console.log(usr_name + " disconconnected.");
    });

    socket?.on('updateRoomList', ( RoomList: Array<string> ) => {
      console.log("RoomList: ", RoomList);
      setRoomList(RoomList);
    });

    socket?.on('updateUserInRoomList', ( UserInRoomList: Array<[string, string]> ) => {
      console.log("UserRoomList: ", UserInRoomList);
      setUserRoomList(UserInRoomList.filter(
        (user: [string, string]) => user[0] !== socket.id
      ));
    });

    socket?.on('joinedRoom', ( usr_room: string ) => {
      console.log(usr_room + " entered.");
    });

    socket?.on('leftRoom', ( usr_name: string ) => {
      console.log(usr_name + " exited.");
    });

    socket?.on('removedFromRoom', () => {
      setRoom('');
      setUserRoomList([]);
      console.log("Kicked out of the current room.");
    });

    socket?.on('msgToClient', (client_message: {room: string, id: string, name: string, message: string}) => {
      console.log("received from server: ", client_message);

      const ind = blockedUserList.findIndex(each => each.id === client_message.id);

      console.log('sender id: ', client_message.id);
      console.log('blockedUserList', blockedUserList);
      console.log('index found: ', ind);
      console.log('blocked? ', blockedUserList[ind].checked);

      if (ind === -1 || (ind !== -1 && blockedUserList[ind].checked === false)) {
        setMessagesRoom((list) => [...list, [client_message.name, client_message.message]]);
      } 

    });

    socket?.on('msgPrivateToClient', (client_message: 
          {senderId: string, senderName: string, message: string}) => {
      
      console.log("received private message from server: ", client_message);
      console.log("select user id:", client_message.senderId, 
        "select user name:", client_message.senderName);

      const ind = blockedUserList.findIndex(each => each.id === client_message.senderId);

      console.log("blockedUserList: ", blockedUserList);
      console.log("onlineUserList: ", onlineUserList);
      console.log('senderId: ', client_message.senderId);
      console.log('index found: ', ind);
      console.log('blocked? ', blockedUserList[ind].checked);

      if ( ind === -1 || (ind !== -1 && blockedUserList[ind].checked === false) ) {
        setPrivateMessaging(true);
        setSelectUserId(client_message.senderId);
        setSelectUserName(client_message.senderName);
        console.log("select user id:", client_message.senderId, 
          "select user name:", client_message.senderName);
        setMessagesPrivate((list) => 
          [...list, [client_message.senderName, client_message.message]]);
      }
      
    });

    socket?.on('disconnect', () => {
      socket?.emit('deleteUser', {usr: name}, (data: string) => console.log(data));
    })

    return () => {
      socket?.off('updateUser');
      socket?.off('lostUser');
      socket?.off('updateUserInRoomList');
      socket?.off('joinedRoom');
      socket?.off('leftRoom');
      socket?.off('msgToClient');
      socket?.off('msgPrivateToClient');
      socket?.off('disconnect');
    }
  }, [socket, blockedUserList]);


  return (
    loggedIn === true ? (

    <Box sx={{ flexGrow: 1 }}>

      <Grid container spacing={2}>

        <Grid item xs={4}>

          <Item>
            <Box sx={{ width: '100%' }}>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                <Tab label="Rooms" {...a11yProps(0)} />
                <Tab label="Persons" {...a11yProps(1)} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
            <Typography variant="subtitle2"> Available Chat Rooms </Typography>
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {roomList && roomList.map((eachRoom, index) => (
                  <ListItemButton   key={index}
                                    selected={room === eachRoom}
                                    onClick={e => handleSelectRoom(e, eachRoom)}>
                    <ListItemAvatar>
                      <Avatar>
                        <ImageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={eachRoom} />
                  </ListItemButton>
                ))}
              </List>    
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle2"> Users in "{room}" Chat Room </Typography>
              <Stack spacing={2} direction="row">  
                  
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                  {userRoomList && userRoomList.map((eachPerson, index) => (
                    <ListItemButton   key={index}
                                      // selected={room === eachRoom}
                                      // onClick={e => handleSelectRoom(e, eachRoom)}
                                      >
                      <ListItemAvatar>
                        <Avatar>
                          <ImageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={eachPerson[1]} />
                    </ListItemButton>
                  ))}
                </List>

                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                  {userRoomList && isAdmin && userRoomList.map((user, index) => (
                    <Box>
                      <IconButton sx={{mt:1.5}} 
                                  key={index} 
                                  aria-label="delete"
                                  onClick={e => removeUserFromRoom(e, user)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </List>

              </Stack>   
            </TabPanel>

            </Box>
          </Item>

          <Item><Typography variant='h6' > All Online Users </Typography>
            <Stack spacing={2} direction="row">

              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {onlineUserList && onlineUserList.map((user, index) => (

                  <ListItemButton   key={index}
                                    selected={selectUserId === user[0]}
                                    onClick={e => handleSelectUser(e, user)}>
                    <ListItemAvatar>
                      <Avatar>
                        <ImageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText   primary={user[1]} />
                  </ListItemButton>

                ))}
              </List>

              <FormControl component="fieldset" variant="standard">
                <FormGroup>
                  <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {blockedUserList && blockedUserList.map((user, index) => 
                      
                      <FormControlLabel key={index}
                                        sx={{mt:1.7}}
                                        control={
                                          <Switch 
                                                  onChange={handleBlockUser} 
                                                  name={user.id} />
                                        }
                                        label="Block" />
                    )}
                  </List>
                </FormGroup>
              </FormControl>

            </Stack>
          </Item>

        </Grid>

        <Grid item xs={8}>

          {room &&

            <Item>
            <Typography variant='h6' > "{room}" Chat Room </Typography>
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {
                  messagesRoom && messagesRoom.map((message, index) => (
                    <ListItem  key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <ImageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${message[0]}: ${message[1]}`} secondary={new Date().toLocaleString()} />
                  </ListItem>
                  ))
                }
              </List>
              <Stack spacing={2} direction="row">
                <Box
                  component="form"
                  sx={{
                    '& > :not(style)': { m: 1, width: 450},
                  }}
                  noValidate
                  autoComplete="off">
                  <TextField 
                    id="outlined-basic" label="Text Message" variant="outlined"
                    type="text"
                    required
                    multiline
                    value={inputMessageRoom}
                    onChange={(e) => setInputMessageRoom(e.target.value)}/>
                </Box>
                <Button 
                  variant="contained"
                  disabled={inputMessageRoom === ""}
                  onClick={(e) => handleSendRoomMessage(e)}
                  endIcon={<SendIcon />}
                  >Send
                </Button>
              </Stack>
            </Item>

          }
        
          {privateMessaging &&

            <Item>
              <Typography variant='h6' > Private Messaging with User "{selectUserName}" </Typography>
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {
                  messagesPrivate && messagesPrivate.map((message, index) => (
                    <ListItem  key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <ImageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${message[0]}: ${message[1]}`} secondary={new Date().toLocaleString()} />
                  </ListItem>
                  ))
                }
              </List>
              <Stack spacing={2} direction="row">
                <Box
                  component="form"
                  sx={{
                    '& > :not(style)': { m: 1, width: 450},
                  }}
                  noValidate
                  autoComplete="off">
                  <TextField 
                    id="outlined-basic" label="Text Message" variant="outlined"
                    type="text"
                    required
                    multiline
                    value={inputPrivate}
                    onChange={(e) => setInputPrivate(e.target.value)}/>
                </Box>
                <Button 
                  variant="contained"
                  disabled={inputPrivate === ""}
                  onClick={(e) => handleSendPrivateMessage(e)}
                  endIcon={<SendIcon />}
                  >Send
                </Button>
              </Stack>
            </Item>

          }

        </Grid>
      </Grid>
    </Box>
      
      // <section className='Chat-Area'>
      //   <ul id='messages'> 
      //     <Messages data={messages} /> 
      //   </ul>
      //   <ul id="online"> 
      //     &#x1f310; : <Online data={online} />
      //   </ul>
      //   <div id='sendform'>
      //     <form 
      //       className='Chat-Message'
      //       onSubmit={handleSendRoomMessage}>
      //         <input 
      //           id='message_input'
      //           type='text'
      //           value={input}
      //           required
      //           onChange={(e) => setInput(e.target.value)}
      //         />
      //         <button> Send </button>
      //     </form>
      //   </div>
      // </section>
      
    ) : (

    <Paper>
      <Stack>

        <Item>
          <TextField 
            id="outlined-basic" label="User name" variant="outlined"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Item>

        <Item>
          <FormControl sx={{ minWidth: 195 }}>
            <InputLabel id="demo-simple-select-label">Room</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={room}
              label="Select A Room"
              onChange={(e) => setRoom(e.target.value)}
            >
              {
                roomList && roomList.map((room, index) => (
                  <MenuItem key={index} value={room}>{room}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Item>

        <Item>
          <TextField 
            id="outlined-basic" label="Create room" variant="outlined"
            type="text"
            required
            value={createRoom}
            onChange={(e) => setCreateRoom(e.target.value)}
            placeholder='room name'
          />
        </Item>

        <Item>     
          <Button 
            variant="contained"
            disabled={(room === "" && createRoom === "") || (room !== "" && createRoom !== "") || name === "" }
            onClick={(e) => handleSubmit(e)}
            >Submit
          </Button>
        </Item>

      </Stack>
    </Paper>

      // <div className='Chat-Entry'>
      //   <form onSubmit={handleSubmit}>
      //     <input 
      //       id='name_input'
      //       type='text'
      //       value={name}
      //       onChange={(e) => setName(e.target.value)}
      //       required
      //       placeholder='What is your name ..'
      //     />
      //     <br />
      //     <input
      //       id='room_input'
      //       type='text'
      //       value={room}
      //       onChange={(e) => setRoom(e.target.value)}
      //       placeholder='what is your room ..'
      //     />
      //     <br />
      //     <button>Submit</button>
      //     </form>
      // </div>

    )
  );
}

export default Chat;
