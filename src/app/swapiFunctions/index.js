const fetch = require('node-fetch');
const { swPeople, swPlanet } = require('../db');
const CommonPeople = require('../People/commonPeople');
const { Planet } = require('../Planet');

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
        const characterFromDB = await swPeople.findOne({ where: { id: characterId } });
        if (characterFromDB) {
            characterData = characterFromDB;
        } else {
            // Si no se encuentra en la base de datos, consulta la SWAPI.
            const swapiUrl = `https://swapi.dev/api/people/${characterId}/`;
            const swapiResponse = await genericRequest(swapiUrl, 'GET', null);
            if (swapiResponse && swapiResponse.name) {
                characterData = swapiResponse;
                const swapiUrlPlanet = characterData.homeworld;
                const match = swapiUrlPlanet.match(/planets\/(\d+)\/$/);
                const swapiResponsePlanet = await genericRequest(swapiUrlPlanet, 'GET', null);
                if (swapiResponsePlanet && swapiResponsePlanet.name) {
                    characterData.homeworld_name = swapiResponsePlanet.name;
                    characterData.homeworld_id = match[1]
                }
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


const getPlanetByID = async function (planetId) {
    try {
        let planetData = null;
        const planetFromDB = await swPlanet.findOne({ where: { id: planetId } });
        if (planetFromDB) {
            planetData = planetFromDB;
        } else {
            // Si no se encuentra en la base de datos, consulta la SWAPI.
            const swapiUrl = `https://swapi.dev/api/planets/${planetId}/`;
            const swapiResponse = await genericRequest(swapiUrl, 'GET', null);
            if (swapiResponse && swapiResponse.name) {
                planetData = swapiResponse;
            }
        }
        if (planetData) {
            const planet = new Planet();
            await planet.init(planetData);
            return planet;
        }
        return null;
    } catch (error) {
        throw error; // Maneja los errores si ocurren.
    }
}


const getWeightOnPlanetRandom = async function (numberPlanets, numberPeople) {
    try {
        const randomPlanetId = Math.floor(Math.random() * numberPlanets) + 1;
        const randomPeopleId = Math.floor(Math.random() * numberPeople) + 1;

        const planet = await getPlanetByID(randomPlanetId);
        const character = await getCharacterByID(randomPeopleId);

        let weight = getWeightOnPlanet(character.getMass, planet.getGravity)

        return weight

    } catch (error) {
        throw error
    }
}

module.exports = {
    getWeightOnPlanet,
    genericRequest,
    getCharacterByID,
    getPlanetByID,
    getWeightOnPlanetRandom
}