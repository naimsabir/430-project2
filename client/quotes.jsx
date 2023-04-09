const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const DomoList = (props) => {
    if(props.domos.length === 0) {
        return(
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return(
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace"/>
                <h3 className="domoName">Name: {domo.name} </h3>
                <h3 className="domoAge">Age: {domo.age} </h3>
                <h3 className="domoHeight">Height: {domo.height} </h3>
                <h3 className="domoQuote">Domo says: {RandomPhrase()}</h3>
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const RandomPhrase = () =>
{
    let randNum = Math.random();
    let returnString;

    if(randNum < 0.25)
    {
        returnString = "Domo Arigato!";
    }
    else if(randNum > 0.25 && randNum < 0.50)
    {
        returnString = "Domo is a brown, furry monster with a large, sawtoothed mouth that is locked wide open. His favorite food is nikujaga, a Japanese meat and potato stew.";
    }
    else if(randNum > 0.50 && randNum < 0.75)
    {
        returnString = "Domo lives in a cave with Mr. Usaji. Mr. Usaji is a wise old rabbit who has lived in a cave for decades, loves to watch television and drink astringent green tea.";
    }
    else if(randNum > 0.75)
    {
        returnString = "Clint Bickham, the writer of the Domo comic book, said that to him Domo's expression is a sort of cheery wonderment.";
    }

    return returnString;
};

const loadDomos = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(
        <DomoList domos={data.domos} />,
        document.querySelector("#showDomos")
    );
};

const init = () =>
{
    ReactDOM.render(
        <DomoList domos={[]}/>,
        document.querySelector("#showDomos")
    );
    loadDomos();
};

window.onload = init;