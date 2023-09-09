const fetch = require('node-fetch');
const { swPeople, swPlanet } = require('../db');
const { Planet } = require('../Planet');
const { peopleFactory } = require('../People')

//Init functions
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





//General function
async function fetchDataFromSWAPI(url) {
    const response = await genericRequest(url, 'GET', null);
    if (response && response.name || response.whrascwo) {
        return response;
    }
    return null;
}


//Functions to getPlanetByID
async function fetchPlanetData(planetId) {
    const planetFromDB = await swPlanet.findOne({ where: { id: planetId } });
    if (planetFromDB) {
        return planetFromDB;
    }
    const swapiUrl = `https://swapi.dev/api/planets/${planetId}/`;
    const planetData = await fetchDataFromSWAPI(swapiUrl);
    return planetData || null;
}

async function createPlanetInstance(planetData) {
    const planet = new Planet(planetData.id);
    planet.init(planetData);
    return planet;
}


//Functions to getCharacterByID
async function fetchHomeworldData(homeworldUrl, isWookieeFormat) {
    const match = homeworldUrl.match(!isWookieeFormat ? /planets\/(\d+)\/$/ : /akanrawhwoaoc\/(\d+)\/$/) 
    homeworldUrl = !isWookieeFormat ? homeworldUrl : `https://swapi.dev/api/planets/${match[1]}?format=wookiee`
    const homeworldData = await fetchDataFromSWAPI(homeworldUrl);
    if (homeworldData) {
        return {
            homeworld_name: !isWookieeFormat? homeworldData.name: homeworldData.whrascwo,
            homeworld_id: match[1]
        };
    }
    return null;
}

async function fetchCharacterData(characterId, isWookieeFormat) {
    const characterFromDB = await swPeople.findOne({ where: { id: characterId } });
    if (characterFromDB) {
        return characterFromDB;
    }
    const swapiUrl = `https://swapi.dev/api/people/${characterId}?${isWookieeFormat?'format=wookiee':''}`;
    const characterData = await fetchDataFromSWAPI(swapiUrl);
    if (characterData) {
        let urlHomeWorld = isWookieeFormat? characterData.acooscwoohoorcanwa : characterData.homeworld
        characterData.homeworldData = await fetchHomeworldData(urlHomeWorld, isWookieeFormat);
        return characterData;
    }
    return null;
}

async function createCharacterInstance(characterData, lang) {
    return await peopleFactory(characterData.id, lang, characterData);
}

//Function to endpoint
const getCharacterByID = async function (characterId, isWookieeFormat) {
    try {
        const characterData = await fetchCharacterData(characterId, isWookieeFormat);
        if (characterData) {
            const character = await createCharacterInstance(characterData, isWookieeFormat ? 'wookiee' : '');
            return character;
        }
        return null;
    } catch (error) {
        throw error;
    }
}

//Function to endpoint
const getPlanetByID = async function (planetId) {
    try {
        const planetData = await fetchPlanetData(planetId);
        if (planetData) {
            const planet = await createPlanetInstance(planetData);
            return planet;
        }
        return null;
    } catch (error) {
        throw error;
    }
}

//Function to endpoint
const getWeightOnPlanetRandom = async function (numberPlanets, numberPeople) {
    try {
        const randomPlanetId = Math.floor(Math.random() * numberPlanets) + 1;
        const randomPeopleId = Math.floor(Math.random() * numberPeople) + 1;
        const planet = await getPlanetByID(randomPlanetId);
        const character = await getCharacterByID(randomPeopleId);
        if (!character || !planet) {
            const error = new Error('No existen suficientes datos para calcular el peso');
            error.code = 400;
            throw error;
        }
        return character.getWeightOnPlanet(planet);
    } catch (error) {
        throw error
    }
}

module.exports = {
    genericRequest,
    getCharacterByID,
    getPlanetByID,
    getWeightOnPlanetRandom
}