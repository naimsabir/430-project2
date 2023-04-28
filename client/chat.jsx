const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

let characters;
let powers;
let weaknesses;
let roomNum;

const chatBox = () => 
{
    const chatField = document.querySelector("#chatField");
    const chatBox = document.querySelector("#chatBox");

    chatField.addEventListener('submit', (e) => 
    {
        e.preventDefault();

        if(chatBox.value)
        {
            const data = 
            {
                message: chatBox.value
            };

            socket.emit('chat message', data);
            chatBox.value = '';

        }
    });
}
const handleRoom = (e) => 
{
    e.preventDefault();
    console.log("handle room called");

    roomNum = e.target.querySelector("#chatRoom").value;
    const messages = document.querySelector("#chatDisplay");
    messages.innerHTML = "";


    socket.emit('room select', {join: roomNum});
}

const LoginChatRoomWindow = (props) =>
{
    return(
        <form id="loginChatRoom"
            name="loginChatRoom"
            onSubmit={handleRoom}
        >
          <div id="room-dropdown" class="control is-inline-block mr-3">
            <span class="subtitle has-text-weight-bold">Chat Room</span>
            <select id="chatRoom" class="select is-primary is-small">
                <option value = "room-1">Room 1</option>
                <option value = "room-2">Room 2</option>
                <option value = "room-3">Room 3</option>
                <option value = "room-4">Room 4</option>
                <option value = "room-5">Room 5</option>
            </select>
          </div>
            <input className="formSubmit" type="submit" cols="10"value="Join Chat Room"/>
        </form>    
    );
}

const DisplayMessage = (props) =>
{
    return(
        <article class="message is-danger">
          <div class="message-header">
            <p>{props.username}</p>
          </div>
          <div class="message-body">
            {props.msg}
          </div>
        </article>
    );
}
const getTextData = async (url) => 
{
    fetch(url)
        .then(response => {
            //If the response is succesful, return the JSON
            if (response.ok) {
                return response.json();
            }

            //else throw an error that will be caught below
            return response.text().then(text =>{
                throw text;
            });
            
            
        })
        .then(json => {
            console.log("data was loaded");
            dataLoaded(json);
        }).catch(error => {
            //error
            console.log(error);
        });
}

const dataLoaded = (json) => 
{
    characters = json.characters;
    powers = json.powers;
    weaknesses = json.weaknesses;
    //console.log(characters);
    //console.log(powers);
    //console.log(weaknesses);
}

const init = () => 
{
    const messages = document.querySelector("#chatDisplay");
    const roomSelect = document.querySelector("#roomSelect")
    chatBox();
    ReactDOM.render(<LoginChatRoomWindow/>, roomSelect);
    //currently just using to see a way I can access this
    getTextData("../assets/card-data/cardtext.json");
    socket.on('chat message', (msg) => {
        const newMessage = document.createElement('div');
        messages.append(newMessage);
        console.log(msg);
        ReactDOM.render(<DisplayMessage username={msg.username} msg={msg.message}/>, newMessage);
    })
    
}

window.onload = init;