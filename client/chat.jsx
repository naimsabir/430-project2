//To DO LIST
//1. Make the messages auto scroll to the latest message - DONE
//2. Make the messages persist on screen for those who are just joining the room
//   a. Current method I'm working on is making an array of the messages in the io files and then emitting that
//      instead of a single message
//   b. Then looping through that in a for each of the object that will be sent through socket
const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

// variables that hold the data for the cards
let characters;
let powers;
let weaknesses;

//use these for the random num array but if the buy more card packs button is pressed it will raise them to the cap
let charCap = 35;
let powerCap = 30;
let weakCap = 15;



//get rid of this later
let roomNum;

const chatBoxListener = (e) => {
    // const chatField = e.target.querySelector("#chatField");
    const chatBox = e.target.querySelector("#chatBox");

    e.preventDefault();

    if (chatBox.value) {
        const data =
        {
            message: chatBox.value
        };

        socket.emit('chat message', data);
        chatBox.value = '';

    }
}
//The input field
const ChatBox = (props) => 
{
    return (
        <form id="chatField" onSubmit={chatBoxListener}>
            <textarea class="textarea is-large is-info" type="text" placeholder="My character would win because..." rows="4" cols="50" id="chatBox"></textarea>
            <input type="submit" id="chatFieldSubmitButton" />
        </form>
    );
}

//Profit Model adding more cards to the pool
const addAllCards = (e) =>
{
    e.preventDefault();
    e.target.style.visibility = "hidden"; // visible when we want it back
    charCap = characters.length;
    powerCap = powers.length;
    weakCap = weaknesses.length;
}

//React Component for the profit model button
const BuyButton = (props) => 
{
    return (
        <button id="buyButton" value="Submit" onClick={addAllCards}>Buy New Card Packs</button>
    );
}

const addVote = (cardId) => {
    socket.emit('add vote', cardId );
}

//The Card React Component
const DeckDisplay = (props) =>
{

    return(
        <div class="card" id="character-card">
            <div class="control has-text-centered">
                <button
                    id="btn-vote"
                    class="button is-danger is-small mt-1"
                    title="Vote for this card!"
                    //style="background-color: #BC96E6" causes an error
                    onClick={() => addVote(props.cardId)}
                >
                    Vote!
                </button>
            </div>
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

//The submit function attached to the chat room joining form. It handles the generation of the card data
const handleRoom = (e) => {
    e.preventDefault();
    console.log("handle room called");

    roomNum = e.target.querySelector("#chatRoom").value;
    e.target.querySelector("#roomSubmit").disabled = true;
    //time for voting - commenting out for testing
    //setTimeout(() => {e.target.querySelector("#roomSubmit").disabled = false;}, 30000);
    const messages = document.querySelector("#chatDisplay");
    messages.innerHTML = "";


    const characterRand = characters[Math.floor(Math.random() * charCap)]; //47
    const powerRand = powers[Math.floor(Math.random() * powerCap)]; //37
    const weaknessRand = weaknesses[Math.floor(Math.random() * weakCap)]; //20

    const chatField = document.createElement('div');
    document.querySelector("#textField").appendChild(chatField);


    //This works but would be loaded after the decks are shown so I will comment it out for now
    ReactDOM.render(<ChatBox/>, chatField);

    //chatBoxListener();

    socket.emit('room select', { join: roomNum });

    socket.emit('deck select', {character: characterRand, power: powerRand, weakness: weaknessRand});

}

//React Component for the Chat Room form
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
//React Component for the chat messages
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
}

//End Screen React Component
const EndScreen  = (props) =>
{
    return(
        <div id="endText">
            <h1>{props.username} Won!</h1>
            <h3>This Room will close after 30 seconds</h3>
            <h4>P.S: There is a bug that I didn't have time to fix so the game will only work if you join another room after this.</h4>
        </div>
    )
}

const init = () => {
    const messages = document.querySelector("#chatDisplay");
    let roomSelect = document.querySelector("#roomSelect");
    const profitSpot = document.querySelector("#profitSpot");
    let endScreen = document.querySelector("#endScreen");

    ReactDOM.render(<LoginChatRoomWindow />, roomSelect);
    ReactDOM.render(<BuyButton/>, profitSpot);
    //currently just using to see a way I can access this
    getTextData("../assets/card-data/cardtext.json");
    //ok from here I can put a foreach inside of socket.on 'chat message' for every obj in the array. Hopefully it won't be noticeable
    socket.on('chat message', (data) => {
        console.log(data);
        messages.innerHTML = '';
        data.forEach(msg => 
            {
                const newMessage = document.createElement('div');
                messages.append(newMessage);
                ReactDOM.render(<DisplayMessage username={msg.username} msg={msg.message} />, newMessage);
            }
        );
        //const newMessage = document.createElement('div');
        //messages.append(newMessage);
        //console.log(data);
        
        //ReactDOM.render(<DisplayMessage username={msg.username} msg={msg.message} />, newMessage);
        messages.scrollTop = messages.scrollHeight;
    })
    socket.on('deck select', (obj) => {

    })

    socket.on('begin voting', (obj) => {
        //test later
        document.querySelector("#deck1").innerHTML = "";
        document.querySelector("#deck2").innerHTML = "";
        const deck1 = document.createElement('div');
        const deck2 = document.createElement('div');
        document.querySelector("#deck1").appendChild(deck1);
        document.querySelector("#deck2").appendChild(deck2);
        ReactDOM.render(
            <DeckDisplay cardId="card1" username={obj.card1.username} character={obj.card1.character} power={obj.card1.power} weakness={obj.card1.weakness} />,
                deck1
        )
        ReactDOM.render(
            <DeckDisplay cardId="card2" username={obj.card2.username} character={obj.card2.character} power={obj.card2.power} weakness={obj.card2.weakness} />,
                deck2
        )
        document.querySelector("#new-select").innerHTML = "";
        document.querySelector("#roomSelect").innerHTML = "";
        document.querySelector("#profitSpot").innerHTML = "";
    })

    socket.on('all votes', (obj) => {
        document.querySelector("#chatDisplay").innerHTML = "";
        document.querySelector("#textField").innerHTML = "";
        document.querySelector("#deck1").innerHTML = "";
        document.querySelector("#deck2").innerHTML = "";
        //new stuff
        //endScreen.remove();
        endScreen = document.createElement('div');
        endsScreen.setAttribute("id", "new-select");
        document.querySelector("#headSection").appendChild(endScreen);
        ReactDOM.render(
            <EndScreen username={obj.username} cardId={obj.cardId}/>,
            endScreen
        )
    })

    socket.on('server-command', (obj) => {
        if(obj == "leave-room")
        {
            document.querySelector("#endScreen").innerHTML = "";
            roomSelect.remove();
            endScreen.remove();
            roomSelect = document.createElement('div');
            roomSelect.setAttribute("id", "new-select");
            document.querySelector("#headSection").appendChild(roomSelect);
            ReactDOM.render(<LoginChatRoomWindow />, roomSelect);
        }
    })

    socket.on('add vote', (obj) => {
        votes = obj.votes;
    })

}

window.onload = init;