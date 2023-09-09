const fetch = require('node-fetch');
const { swPeople, swPlanet } = require('../db');
const CommonPeople = require('../People/commonPeople');
const { Planet } = require('../Planet');

const getWeightOnPlanet = (mass, gravity) => {
    return mass * gravity;
}

const parseGravity = function(gravity){
    let options = gravity.split(',');
    let firstGravity = options[0].split(' ');
    let gravityValue = parseFloat(firstGravity);
    if(isNaN(gravityValue)){
        return 'No se puede calcular la gravedad por falta de datos'
    }
    return gravityValue;
}

const parseMass = function(mass){
    let massValue = parseFloat(mass)
    if(isNaN(massValue)){
        return 'No se puede calcular la masa por falta de datos'
    }
    return massValue;
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
        if (character && planet) {
            let mass = parseMass(character.getMass());
            let gravity = parseGravity(planet.getGravity());
            let weight = (typeof gravity === 'string') ? gravity : (typeof mass === 'string') ? mass : getWeightOnPlanet(mass, gravity)
            return { weight, planetGravity: planet.getGravity(), characterMass: character.getMass() }
        }
        return { weight: 'No existen los suficientes datos para calcular el peso' }
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