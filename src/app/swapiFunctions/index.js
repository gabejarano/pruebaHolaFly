const fetch = require('node-fetch');
const { swPeople } = require('../db');
const CommonPeople = require('../People/commonPeople')

const getWeightOnPlanet = (mass, gravity) => {
    return mass * gravity;
}

const genericRequest = async (url, method, body, logging = false) => {
    let options = {
        method: method
    }
    if (body) {
        options.body = body;
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (logging) {
        console.log(data);
    }
    return data;
}

const getCharacterByID = async function (characterId) {
    try {
        let characterData = null;
        let people = await swPeople.findAll();
        console.log(people)
        const characterFromDB = await swPeople.findOne({ where: { id: characterId } });
        console.log(characterFromDB)
        if (characterFromDB) {
            characterData = characterFromDB;
        } else {
            // Si no se encuentra en la base de datos, consulta la SWAPI.
            const swapiUrl = `https://swapi.dev/api/people/${characterId}/`;
            const swapiResponse = await genericRequest(swapiUrl, 'GET', null);
            if (swapiResponse && swapiResponse.name) {
                characterData = swapiResponse;
            }
        }
        if (characterData) {
            // Crea una instancia de CommonPeople y devuelve el personaje.
            const commonPeople = new CommonPeople(characterData.id);
            await commonPeople.init(characterData);
            return commonPeople;
        }
        return null;
    } catch (error) {
        throw error; // Maneja los errores si ocurren.
    }
}

module.exports = {
    getWeightOnPlanet,
    genericRequest,
    getCharacterByID
}