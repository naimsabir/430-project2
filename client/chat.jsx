const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

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

const init = () => 
{
    const messages = document.querySelector("#chatDisplay");
    chatBox();
    socket.on('chat message', (msg) => {
        const newMessage = document.createElement('div');
        messages.append(newMessage);
        console.log(msg);
        ReactDOM.render(<DisplayMessage username={msg.username} msg={msg.message}/>, newMessage);
    })
    
}

window.onload = init;