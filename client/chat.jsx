const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

let characters;
let powers;
let weaknesses;

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

const DisplayMessage = (props) =>
{
    return(
        <article class="message is-danger">
          <div class="message-header">
            <p>{props.username}</p>
            <button class="delete" aria-label="delete"></button>
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
    chatBox();
    getTextData("../assets/card-data/cardtext.json");
    socket.on('chat message', (msg) => {
        const newMessage = document.createElement('div');
        messages.append(newMessage);
        console.log(msg);
        ReactDOM.render(<DisplayMessage username={msg.username} msg={msg.message}/>, newMessage);
    })
    
}

window.onload = init;