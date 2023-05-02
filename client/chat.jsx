const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

let characters;
let powers;
let weaknesses;

let numInRoom;

//The big issue with this is that it doesn't stay consistent amongst all users
let isFull = false;
//get rid of this later
let roomNum;
//Things to ask Austin About:
//1. How to track the order of users that logged into any given chat room to determine the turn order
//  a. Also how to obtain the username in the client code to display above each deck so you know what user is using it. Also maybe use that to decide turn order
//     Honestly my biggest issue is trying to figure out how to do the turn order and how to get two players in game
//2. How to make DeckDisplay make display three cards without triggering the "jsx expressions must have one parent element"
//Realistic Checklist:
//1. I don't think I can do this in the way I want to due not only to time constraints but every method I try doesn't work so
//   first things first I'll make it so only the first two users who log in to a chat room can have the cards since that's basically
//   already what's there
//2. I'll also add the chat window along with the card section and just add vote buttons to the cards
//3. Hold on I'll look at this in the morning when my brain is alive but what if I just change pulldata to handle the random numbers
//   for the cards and then just create two cards with the two separate sockets each filled with original data. Wait or maybe just hardcoding the number values for the cards
//   or I can just make the code persist via the server for the card sections idk.

const chatBoxListener = (e) => {
    // const chatField = e.target.querySelector("#chatField");
    const chatBox = e.target.querySelector("#chatBox");

    // chatField.addEventListener('submit', (e) => 
    // {
    e.preventDefault();

    if (chatBox.value) {
        const data =
        {
            message: chatBox.value
        };

        socket.emit('chat message', data);
        chatBox.value = '';

    }
    // });
}
const ChatBox = (props) => {
    return (
        <form id="chatField" onSubmit={chatBoxListener}>
            <textarea class="textarea is-large is-info" type="text" placeholder="My character would win because..." rows="5" cols="50" id="chatBox"></textarea>
            <input type="submit" id="chatFieldSubmitButton" />
        </form>
    );
}
const DeckDisplay = (props) =>
{
    //if(props.length === 0)
    //{
    //    return(
    //        <div class="no-deck">
    //            <h1>There be an error here!</h1>
    //        </div>
    //    );
    //}
    return(
        //ok I do wanna make three separate cards but react doesn't like that and gives me the
        //"jsx expressions must have one parent element" error
        <div class="card" id="character-card">
            <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-5" id="userTitle">{props.username}</p>
                    <p class="title is-6" id="character-title">Character</p>
                    <p class="subtitle is-7" id="data"> {props.character} </p>
                    <p class="title is-6" id="power-title">Power</p>
                    <p class="subtitle is-7" id="data"> {props.power} </p>
                    <p class="title is-6" id="power-title">Weakness</p>
                    <p class="subtitle is-7" id="data"> {props.weakness} </p>
                  </div>
                </div>
            </div>
        </div>
        
    );

}

const handleRoom = (e) => {
    e.preventDefault();
    console.log("handle room called");

    roomNum = e.target.querySelector("#chatRoom").value;
    //e.target.querySelector("#roomSubmit").disabled = true;
    //time for voting - commenting out for testing
    //setTimeout(() => {e.target.querySelector("#roomSubmit").disabled = false;}, 30000);
    const messages = document.querySelector("#chatDisplay");
    messages.innerHTML = "";


    const characterRand = characters[Math.floor(Math.random() * 47)];
    const powerRand = powers[Math.floor(Math.random() * 37)];
    const weaknessRand = weaknesses[Math.floor(Math.random() * 20)];

    if(numInRoom <= 2)
    {
        helper.sendPost(e.target.action, { characterRand, powerRand, weaknessRand });
    }

    //This works but would be loaded after the decks are shown so I will comment it out for now
    ReactDOM.render(<ChatBox/>, document.querySelector("#textField"));

    //chatBoxListener();

    socket.emit('room select', { join: roomNum });

    socket.emit('deck select', {character: characterRand, power: powerRand, weakness: weaknessRand});
}

const LoginChatRoomWindow = (props) => {
    return (
        <form id="loginChatRoom"
            name="loginChatRoom"
            onSubmit={handleRoom}
            action="/makeDeck"
        >
            <div id="room-dropdown" class="control is-inline-block mr-3">
                <span class="subtitle has-text-weight-bold">Chat Room</span>
                <select id="chatRoom" class="select is-primary is-small">
                    <option value="room-1">Room 1</option>
                    <option value="room-2">Room 2</option>
                    <option value="room-3">Room 3</option>
                    <option value="room-4">Room 4</option>
                    <option value="room-5">Room 5</option>
                </select>
            </div>
            <input className="formSubmit" id="roomSubmit" type="submit" cols="10" value="Join Chat Room" />
        </form>
    );
}

const DisplayMessage = (props) => {
    return (
        <article class="message is-danger is-small">
            <div class="message-header">
                <p>{props.username}</p>
            </div>
            <div class="message-body">
                {props.msg}
            </div>
        </article>
    );
}
const getTextData = async (url) => {
    fetch(url)
        .then(response => {
            //If the response is succesful, return the JSON
            if (response.ok) {
                return response.json();
            }

            //else throw an error that will be caught below
            return response.text().then(text => {
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

const dataLoaded = (json) => {
    characters = json.characters;
    powers = json.powers;
    weaknesses = json.weaknesses;
    //console.log(characters);
    //console.log(powers);
    //console.log(weaknesses);
}

const loadDeckFromServer = async () =>
{
    socket.emit('pull data', {num: 1});
    if(numInRoom <= 2)
    {
        const response = await fetch('/getDeck');
        const data = await response.json();
        for(let i = 0; i < 2; i++)
        {
            if(i == 0)
            {
                ReactDOM.render(
                    <DeckDisplay deck={data[i].deck} />,
                    document.querySelector("#deck1")
                );
            }
            else if(i == 1)
            {
                ReactDOM.render(
                    <DeckDisplay deck={data[i].deck} />,
                    document.querySelector("#deck2")
                );
            }
        }
        //ReactDOM.render(
        //    <DeckDisplay deck={data.deck} />,
        //    document.querySelector("#deck1")
        //);
    }
}

const init = () => {
    const messages = document.querySelector("#chatDisplay");
    const roomSelect = document.querySelector("#roomSelect");

    loadDeckFromServer();
    //chatBoxListener();
    ReactDOM.render(<LoginChatRoomWindow />, roomSelect);
    //currently just using to see a way I can access this
    getTextData("../assets/card-data/cardtext.json");
    socket.on('chat message', (msg) => {
        const newMessage = document.createElement('div');
        messages.append(newMessage);
        console.log(msg);
        ReactDOM.render(<DisplayMessage username={msg.username} msg={msg.message} />, newMessage);
    })
    socket.on('deck select', (obj) => {
        console.log(obj);
        if(obj.queuePos % 2 == 0 && !isFull)
        {
            ReactDOM.render(
                <DeckDisplay username={obj.username} character={obj.character} power={obj.power} weakness={obj.weakness} />,
                document.querySelector("#deck2")
            )
        }
        else if(obj.queuePos % 2 != 0 && !isFull)
        {
            ReactDOM.render(
                <DeckDisplay username={obj.username} character={obj.character} power={obj.power} weakness={obj.weakness} />,
                document.querySelector("#deck1")
            )
        }
        //ReactDOM.render(
        //    <DeckDisplay username={obj.username} character={obj.character} power={obj.power} weakness={obj.weakness} />,
        //    document.querySelector("#deck1")
        //)
    })

    socket.on('pull data', (obj) => {
        if(obj.queuePos)
        {
            numInRoom = obj.queuePos;
            if(numInRoom >= 3)
            {
                isFull = true;
            }
        }
    })

}

window.onload = init;